const router = require('express').Router();
const MessageController = require('../controllers/MessageController');
const uploadFile = require('../middleware/uploadFile');

const messageRouter = (io) => {
    const messageController = new MessageController(io);

    //get list message of conversationId
    router.get('/:conversationId', messageController.getList);
    //send text message 
    router.post('/text', messageController.addText);
    //send file message
    router.post('/files',uploadFile.uploadFileMiddleware,messageController.addFile);


    return router;
}

module.exports = messageRouter;