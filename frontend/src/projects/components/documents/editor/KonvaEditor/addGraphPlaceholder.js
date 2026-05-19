export default function addGraphPlaceholder(graphType, opts = {}) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = 1000;
        canvas.height = 700;
        let ctx = canvas.getContext('2d');

        const isRadar = String(graphType).includes('Radar');
        const isGeneral = String(graphType).includes('General');
        const title = isGeneral ? 'General Competencies' : 'Specific Competencies';

        if (isRadar) {
            // ensure background when radar is drawn
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#1e293b';
            ctx.font = 'bold 32px Inter, Arial';
            ctx.textAlign = 'left';
            ctx.fillText(title, 50, 60);

            // Subtitle: show active softskill model name for General radar (if available)
            let legendY = 110;
            let showDocName = false;
            if (isGeneral && this.generalCompetencyDocName) {
                const nameNorm = String(this.generalCompetencyDocName).trim().toLowerCase();
                if (nameNorm && nameNorm !== 'soft skills' && nameNorm !== 'soft skill') {
                    showDocName = true;
                }
            }
            if (showDocName) {
                ctx.font = '18px Inter, Arial';
                ctx.fillStyle = '#475569';
                ctx.fillText(this.generalCompetencyDocName, 50, 100);
                legendY = 150;
            }

            // Legend
            ctx.fillStyle = '#7c3aed';
            ctx.beginPath();
            ctx.arc(380, legendY, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#64748b';
            ctx.font = '18px Inter, Arial';
            ctx.fillText('You', 405, legendY + 6);
            ctx.fillStyle = '#fb7185';
            ctx.beginPath();
            ctx.arc(520, legendY, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#64748b';
            ctx.fillText('Average', 545, legendY + 6);

            const centerX = canvas.width / 2;
            let centerY = canvas.height / 2 + 50;
            const radius = 180;

            // Ensure there's extra space below the legend (You/Average)
            const legendTextHeight = showDocName ? 28 : 18;
            const extraGap = 80; 
            const minCenterY = radius + legendY + legendTextHeight + extraGap;
            if (centerY < minCenterY) {
                centerY = minCenterY;
            }
            let labels = isGeneral ? this.getGeneralCompetencyLabels() : this.getSpecificCompetencyPlaceholders();
            if (!Array.isArray(labels) || !labels.length) {
                labels = isGeneral
                    ? ['Creativity', 'Problem Solving', 'Digital Literacy', 'Learning', 'Agility', 'Communication']
                    : ['Programming', 'Frameworks', 'Database', 'Version Control', 'Architecture', 'Testing'];
            }
            const sides = Math.max(3, labels.length);

            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 1.5;
            for (let r = 1; r <= 5; r++) {
                const currentR = (radius / 5) * r;
                ctx.beginPath();
                for (let i = 0; i < sides; i++) {
                    const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
                    const x = centerX + currentR * Math.cos(angle);
                    const y = centerY + currentR * Math.sin(angle);
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.stroke();
            }

            // Draw radial spokes and labels with wrapping and smarter alignment
            ctx.font = 'bold 14px Inter, Arial';
            const lineHeight = 18;
            const maxLabelWidth = 140; 
            const outerOffsetX = 65; 
            const outerOffsetY = 45;
            for (let i = 0; i < sides; i++) {
                const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
                const x = centerX + radius * Math.cos(angle);
                const y = centerY + radius * Math.sin(angle);
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(x, y);
                ctx.stroke();

                const labelX = centerX + (radius + outerOffsetX) * Math.cos(angle);
                const labelY = centerY + (radius + outerOffsetY) * Math.sin(angle);

                const cos = Math.cos(angle);
                if (Math.abs(cos) < 0.25) {
                    ctx.textAlign = 'center';
                } else if (cos > 0) {
                    ctx.textAlign = 'left';
                } else {
                    ctx.textAlign = 'right';
                }

                const raw = String(labels[i] || '');
                const words = raw.split(/\s+/).filter(Boolean);
                const lines = [];
                if (words.length === 0) {
                    lines.push('');
                } else {
                    let cur = words[0] || '';
                    for (let w = 1; w < words.length; w++) {
                        const test = cur + ' ' + words[w];
                        if (ctx.measureText(test).width <= maxLabelWidth) {
                            cur = test;
                        } else {
                            lines.push(cur);
                            cur = words[w];
                        }
                    }
                    if (cur) lines.push(cur);
                    if (lines.length === 1 && ctx.measureText(lines[0]).width > maxLabelWidth) {
                        const token = lines[0];
                        lines.length = 0;
                        const approxChars = Math.max(6, Math.floor(maxLabelWidth / 8));
                        for (let p = 0; p < token.length; p += approxChars) {
                            lines.push(token.slice(p, p + approxChars));
                        }
                    }
                }

                const totalH = lines.length * lineHeight;
                let drawY = labelY - (totalH / 2) + (lineHeight / 2);
                ctx.fillStyle = '#1e293b';
                ctx.font = 'bold 14px Inter, Arial';
                for (const ln of lines) {
                    ctx.fillText(ln, labelX, drawY);
                    drawY += lineHeight;
                }
            }

            const samplePattern = [0.75, 0.65, 0.85, 0.72, 0.68, 0.82];
            const avgValues = labels.map((_, i) => samplePattern[i % samplePattern.length]);
            const youValues = labels.map((_, i) => Math.min(1, (samplePattern[(i + 1) % samplePattern.length] || 0.75) + 0.12));

            ctx.fillStyle = 'rgba(251, 113, 133, 0.35)';
            ctx.strokeStyle = '#fb7185';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            avgValues.forEach((v, i) => {
                const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
                const x = centerX + (radius * v) * Math.cos(angle);
                const y = centerY + (radius * v) * Math.sin(angle);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = 'rgba(124, 58, 237, 0.45)';
            ctx.strokeStyle = '#7c3aed';
            ctx.lineWidth = 4;
            ctx.beginPath();
            youValues.forEach((v, i) => {
                const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
                const x = centerX + (radius * v) * Math.cos(angle);
                const y = centerY + (radius * v) * Math.sin(angle);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

        } else {
            const labels = isGeneral ? this.getGeneralCompetencyLabels() : this.getSpecificCompetencyPlaceholders();
            const competencies = Array.isArray(labels) && labels.length
                ? labels.map(l => ({ name: String(l || ''), desc: '' }))
                : [
                    { name: 'Competency A', desc: '' },
                    { name: 'Competency B', desc: '' },
                    { name: 'Competency C', desc: '' }
                ];

            const topOffset = 140;
            const bottomPadding = 40;
            const rowHeight = 90; 
            const requiredHeight = topOffset + bottomPadding + (competencies.length * rowHeight);

            if (requiredHeight > canvas.height) {
                canvas.height = requiredHeight;
                ctx = canvas.getContext('2d');
            }

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#1e293b';
            ctx.font = 'bold 36px Inter, Arial';
            ctx.textAlign = 'left';
            ctx.fillText(title, 50, 70);

            const percentages = competencies.map(() => 80);

            let startY = topOffset;
            const barW = canvas.width - 120;
            const barH = Math.max(10, Math.min(18, Math.floor(rowHeight * 0.18)));

            competencies.forEach((item, idx) => {
                ctx.fillStyle = '#1e293b';
                ctx.font = 'bold 20px Inter, Arial';
                ctx.fillText(item.name, 60, startY);

                ctx.fillStyle = '#475569';
                ctx.font = '18px Inter, Arial';
                ctx.textAlign = 'right';
                ctx.fillText('xx%', canvas.width - 60, startY);

                ctx.textAlign = 'left';
                ctx.fillStyle = '#64748b';
                ctx.font = 'normal 14px Inter, Arial';
                ctx.fillText(item.desc, 60, startY + 22);

                const percent = percentages[idx] || 0;
                const fillW = Math.max(0, Math.floor(barW * (percent / 100)));
                ctx.fillStyle = '#f1f5f9';
                this.drawRoundRect(ctx, 60, startY + 40, barW, barH, 6);
                ctx.fill();
                ctx.fillStyle = '#dc2626';
                this.drawRoundRect(ctx, 60, startY + 40, fillW, barH, 6);
                ctx.fill();

                startY += rowHeight;
            });

            const dataUrl = canvas.toDataURL('image/png');
            const imageWidth = opts.width || 600;
            const imageHeight = opts.height || Math.max(1, Math.round((canvas.height / canvas.width) * imageWidth));

            this.addImage(dataUrl, {
                width: imageWidth,
                height: imageHeight,
                ...opts,
                isGraphPlaceholder: true,
                graphType: graphType
            }).then(resolve);
            return;
        }

        const dataUrl = canvas.toDataURL('image/png');
        this.addImage(dataUrl, {
            width: 600,
            height: 450,
            ...opts,
            isGraphPlaceholder: true,
            graphType: graphType
        }).then(resolve);
    });
}
