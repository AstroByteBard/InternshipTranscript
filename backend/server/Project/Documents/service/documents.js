var mongo = require('mongodb');
var Documents = require('../controller/documents');

// Simple inline response helper - no DB dependency
function sendOK(response, data) {
    return response.status(200).json({ code: 20000, message: 'Success', data: data });
}
function sendError(response, err) {
    console.error('[Documents Service Error]', err);
    return response.status(500).json({ code: 50000, message: 'Internal Server Error' });
}

function buildMockDocumentData() {
    const year = new Date().getFullYear();
    return {
        StudentName: 'Name XXXXX',
        StudentID: 'Student ID X',
        School: 'School XXXXX',
        Program: 'Major XXXXX',
        AcademyYear: String(year),
        CompanyLogo: 'https://demo.zdrive.fund/assets/images/brand/logo.png',
        StudentPhoto: 'https://i.pravatar.cc/200?img=12',
        GeneralCompetencies: [
            { name: 'Creativity', score: '4.2' },
            { name: 'Analytical Thinking', score: '4.0' },
            { name: 'Digital Literacy', score: '4.4' },
            { name: 'Continuous Learning', score: '4.1' },
            { name: 'Communication', score: '4.0' }
        ],
        SpecificCompetencies: [
            { name: 'Programming Languages', score: '4.5' },
            { name: 'Frameworks & Libraries', score: '4.3' },
            { name: 'Databases', score: '4.1' },
            { name: 'Version Control', score: '4.4' },
            { name: 'Testing', score: '4.0' }
        ],
        GraphGeneralRadar: {
            labels: ['Creativity', 'Analytical', 'Digital', 'Learning', 'Agility', 'Communication'],
            you: [4.2, 4.0, 4.4, 4.1, 3.8, 4.0],
            average: [3.6, 3.5, 3.7, 3.5, 3.4, 3.6]
        },
        GraphSpecificRadar: {
            labels: ['Programming', 'Frameworks', 'Database', 'Version Control', 'Architecture', 'Testing'],
            you: [4.5, 4.3, 4.1, 4.4, 4.0, 4.2],
            average: [3.8, 3.6, 3.7, 3.6, 3.5, 3.6]
        },
        GraphGeneralBar: {
            items: [
                { name: 'Creativity', score: 84 },
                { name: 'Analytical Thinking', score: 80 },
                { name: 'Digital Literacy', score: 88 },
                { name: 'Continuous Learning', score: 82 },
                { name: 'Communication', score: 80 }
            ]
        },
        GraphSpecificBar: {
            items: [
                { name: 'Programming Languages', score: 90 },
                { name: 'Frameworks & Libraries', score: 86 },
                { name: 'Databases', score: 82 },
                { name: 'Version Control', score: 88 },
                { name: 'Testing', score: 80 }
            ]
        },
        Suggestion: {
            outstanding: [
                {
                    advisor: 'Daniel Carter',
                    company: 'Name Company',
                    date: '26-7-2025',
                    points: [
                        'Shows strong willingness to learn and adapt.',
                        'Completes tasks within deadlines.',
                        'Asks questions when facing challenges.'
                    ]
                }
            ],
            opportunities: [
                {
                    advisor: 'Daniel Carter',
                    company: 'Name Company',
                    date: '26-7-2025',
                    points: [
                        'Increase initiative on new tasks.',
                        'Improve independence in problem solving.',
                        'Strengthen adaptability in new situations.'
                    ]
                }
            ]
        }
    };
}

exports.onQuery = async function (request, response) {
    try {
        let query = {};
        if (request.params.id) {
            query._id = new mongo.ObjectId(request.params.id);
        } else if (request.body && request.body._id) {
            query._id = new mongo.ObjectId(request.body._id);
        }
        const doc = await Documents.onQuery(query);
        return sendOK(response, doc);
    } catch (err) {
        return sendError(response, err);
    }
};

exports.onQuerys = async function (request, response) {
    try {
        let query = {};
        if (request.query && request.query.status) {
            query.status = request.query.status;
        }
        const doc = await Documents.onQuerys(query);
        return sendOK(response, doc);
    } catch (err) {
        return sendError(response, err);
    }
};

exports.onCreate = async function (request, response) {
    try {
        const doc = await Documents.onCreate(request.body);
        return sendOK(response, doc);
    } catch (err) {
        return sendError(response, err);
    }
};

exports.onUpdate = async function (request, response) {
    try {
        let query = {};
        const id = (request.params && request.params.id) || (request.body && request.body._id);
        if (!id) return response.status(400).json({ code: 40000, message: 'Missing ID' });
        query._id = new mongo.ObjectId(id);

        if (!request.body.update) request.body.update = {};
        request.body.update.datetime = new Date();

        const doc = await Documents.onUpdate(query, request.body);
        return sendOK(response, doc);
    } catch (err) {
        return sendError(response, err);
    }
};

exports.onDelete = async function (request, response) {
    try {
        let query = {};
        const id = (request.params && request.params.id) || (request.body && request.body._id);
        if (!id) return response.status(400).json({ code: 40000, message: 'Missing ID' });
        query._id = new mongo.ObjectId(id);

        const doc = await Documents.onDelete(query);
        return sendOK(response, doc);
    } catch (err) {
        return sendError(response, err);
    }
};

