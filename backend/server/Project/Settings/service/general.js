const General = require('../controller/general');
const resMsg = require("./message");

exports.onGetSettings = async function (request, response, next) {
    try {
        let docs = await General.onQuerys({});
        if (!docs || docs.length === 0) {
            let doc = await General.onCreate({ apiKey: '', modelName: 'gemini-3.1-flash-lite' });
            docs = [doc];
        }
        let resData = await resMsg.onMessage_Response(0, 20000);
        resData.data = docs[0];
        response.status(200).json(resData);
    } catch (err) {
        console.error("Error in onGetSettings:", err);
        let resData = await resMsg.onMessage_Response(0, 40400);
        response.status(404).json(resData);
    }
};

exports.onUpdateSettings = async function (request, response, next) {
    try {
        let docs = await General.onQuerys({});
        if (!docs || docs.length === 0) {
            await General.onCreate({ apiKey: '', modelName: 'gemini-3.1-flash-lite' });
            docs = await General.onQuerys({});
        }
        const docId = docs[0]._id;

        const updateData = {
            apiKey: request.body.apiKey !== undefined ? request.body.apiKey : docs[0].apiKey,
            modelName: request.body.modelName !== undefined ? request.body.modelName : docs[0].modelName,
            updatedAt: new Date()
        };

        const doc = await General.onUpdate({ _id: docId }, updateData);

        let resData = await resMsg.onMessage_Response(0, 20000);
        resData.data = doc;
        response.status(200).json(resData);
    } catch (err) {
        console.error("Error in onUpdateSettings:", err);
        let resData = await resMsg.onMessage_Response(0, 40400);
        response.status(404).json(resData);
    }
};