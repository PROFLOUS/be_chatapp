const messageService = require('../services/MessageService');
const MyError = require('../exception/MyError');

class MessageController {
    constructor(io) {
        this.io = io;
        this.getList = this.getList.bind(this);
        this.addText = this.addText.bind(this);
        this.addFile = this.addFile.bind(this);

    }

    // [GET] /:conversationId
    async getList(req, res, next) {
        const { _id } = req.body;
        const { conversationId } = req.params;
        const { page = 0, size = 20 } = req.query;
        try {
            const messages = await messageService.getList(
                conversationId,
                _id,
                parseInt(page),
                parseInt(size)
            );

            res.json(messages);
        } catch (error) {
            next(error);
        }
    }

    //[POST] /text  tin nhắn dạng text
    async addText(req, res, next) {
        const { _id } = req;
        console.log(_id);

        try {
            // const { conversationId } = req.body;
            const message = await messageService.addText(req.body, _id);
            res.status(201).json(message);
        } catch (err) {
            next(err);
        }
    }

    //[POST] /files  tin nhắn dạng file
    async addFile(req, res, next) {
        const { _id, type, conversationId } = req.body;
        const file = req.file;
        try {
            if (!conversationId || !type || !file)
                throw new MyError('File, Type or ConversationId not exists');

            const message = await messageService.addFile(
                file,
                type,
                conversationId,
                _id
            );
            res.status(201).json(message);
        } catch (err) {
            next(err);
        }
    }






}

module.exports = MessageController;