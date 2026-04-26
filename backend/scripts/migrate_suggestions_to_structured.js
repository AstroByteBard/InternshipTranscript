#!/usr/bin/env node
'use strict';

const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Load environment file if present (tries ../.env, ../.env.dev), fallback to default env
const dotenv = require('dotenv');
const envCandidates = [path.join(__dirname, '../.env'), path.join(__dirname, '../.env.dev')];
let envLoaded = false;
for (const p of envCandidates) {
    if (fs.existsSync(p)) {
        dotenv.config({ path: p });
        envLoaded = true;
        break;
    }
}
if (!envLoaded) dotenv.config();

const config = require('../config/config');
const Evaluation = require('../server/Project/Competencies/models/evaluation.model');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const limitArg = args.find(a => a.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : 0;

function tryParseJSONFromString(s) {
    if (!s || typeof s !== 'string') return null;
    // direct parse
    try {
        return JSON.parse(s);
    } catch (e) {
        // try extract code-fenced JSON ```json ... ```
        const codeMatch = s.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
        if (codeMatch) {
            try { return JSON.parse(codeMatch[1]); } catch (e2) { /* fall through */ }
        }
        // try to find first { ... } block
        const braceMatch = s.match(/(\{[\s\S]*\})/);
        if (braceMatch) {
            try { return JSON.parse(braceMatch[0]); } catch (e3) { /* fall through */ }
        }
    }
    return null;
}

function extractSections(s) {
    if (!s || typeof s !== 'string') return null;
    const lines = s.replace(/\r/g, '').split('\n');
    const headingOut = /(?:^|\b)(outstanding|strengths?|จุดแข็ง|ข้อเด่น)/i;
    const headingOpp = /(?:^|\b)(opportunit|opportunities|areas for improvement|สิ่งที่ควรพัฒนา|ข้อเสนอแนะ|ควร)/i;

    let outIdx = -1, oppIdx = -1;
    for (let i = 0; i < lines.length; i++) {
        const l = lines[i].trim();
        if (outIdx === -1 && headingOut.test(l)) outIdx = i;
        if (oppIdx === -1 && headingOpp.test(l)) oppIdx = i;
    }

    const collectItems = (from, to) => {
        const items = [];
        for (let i = from; i < to; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            // strip leading bullet markers
            const cleaned = line.replace(/^[-*•\d\.]+\s*/, '').trim();
            items.push(cleaned);
        }
        return items;
    };

    if (outIdx !== -1 || oppIdx !== -1) {
        // Determine ranges
        let outItems = [];
        let oppItems = [];
        if (outIdx !== -1) {
            const start = outIdx + 1;
            const end = (oppIdx !== -1 && oppIdx > outIdx) ? oppIdx : lines.length;
            outItems = collectItems(start, end);
        }
        if (oppIdx !== -1) {
            const start = oppIdx + 1;
            const end = (outIdx !== -1 && outIdx > oppIdx) ? outIdx : lines.length;
            oppItems = collectItems(start, end);
        }
        return { outstanding: outItems, opportunity: oppItems };
    }

    // fallback: try to pick bullet list from whole text
    const bullets = lines.map(l => l.trim()).filter(l => /^[-*•]|^\d+\./.test(l));
    if (bullets.length > 0) {
        const cleaned = bullets.map(b => b.replace(/^[-*•\d\.]+\s*/, '').trim());
        return { outstanding: [], opportunity: cleaned };
    }

    return null;
}

function normalizeValue(val) {
    if (val == null) return { changed: true, value: { outstanding: [], opportunity: [] } };
    if (Array.isArray(val)) {
        return { changed: true, value: { outstanding: [], opportunity: val.map(String) } };
    }
    if (typeof val === 'object') {
        // ensure fields exist and are arrays of strings
        const out = Array.isArray(val.outstanding) ? val.outstanding.map(String) : (val.outstanding ? [String(val.outstanding)] : []);
        const opp = Array.isArray(val.opportunity) ? val.opportunity.map(String) : (val.opportunity ? [String(val.opportunity)] : []);
        const alreadyGood = Array.isArray(val.outstanding) || Array.isArray(val.opportunity);
        return { changed: !alreadyGood, value: { outstanding: out, opportunity: opp } };
    }
    if (typeof val === 'string') {
        const s = val.trim();
        const parsed = tryParseJSONFromString(s);
        if (parsed && (Array.isArray(parsed.outstanding) || Array.isArray(parsed.opportunity))) {
            return { changed: true, value: { outstanding: Array.isArray(parsed.outstanding) ? parsed.outstanding.map(String) : [], opportunity: Array.isArray(parsed.opportunity) ? parsed.opportunity.map(String) : [] } };
        }
        const extracted = extractSections(s);
        if (extracted) return { changed: true, value: extracted };
        // final safe fallback: put the whole string into opportunity
        return { changed: true, value: { outstanding: [], opportunity: [s] } };
    }
    // unknown types
    return { changed: true, value: { outstanding: [], opportunity: [String(val)] } };
}

async function run() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected.');

        const query = { 'sugestion.answer.value': { $exists: true } };
        let q = Evaluation.find(query);
        if (limit && Number.isInteger(limit) && limit > 0) q = q.limit(limit);
        const docs = await q.exec();
        console.log(`Found ${docs.length} documents with suggestion values (limit=${limit || 'none'})`);

        let updatedCount = 0;
        for (const doc of docs) {
            const suggestions = doc.sugestion || [];
            let changed = false;
            for (let i = 0; i < suggestions.length; i++) {
                const s = suggestions[i];
                const val = s && s.answer && s.answer.value;
                const norm = normalizeValue(val);
                if (norm.changed) {
                    suggestions[i].answer.value = norm.value;
                    changed = true;
                }
            }
            if (changed) {
                if (!dryRun) {
                    await Evaluation.updateOne({ _id: doc._id }, { $set: { sugestion: suggestions } });
                }
                updatedCount++;
                console.log(`${dryRun ? '[DRY] ' : ''}Prepared update for doc ${doc._id}`);
            }
        }

        console.log(`${dryRun ? '[DRY] ' : ''}Migration complete. Documents updated: ${updatedCount}`);
        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('Migration error:', err);
        try { await mongoose.disconnect(); } catch (e) { }
        process.exit(1);
    }
}

run();
