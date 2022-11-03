const messageService = require("../services/MessageService");
const MyError = require("../exception/MyError");

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
    const { userId, conversationId } = req.body;

    try {
      // const { conversationId } = req.body;
      const message = await messageService.addText(req.body, userId);

      // this.io.to(conversationId).emit('new_Mess', message);
      // console.log("send"+message);

      res.status(201).json(message);
    } catch (err) {
      next(err);
    }
  }

  //[POST] /files  tin nhắn dạng file
  async addFile(req, res, next) {
    const { userId, type, conversationId } = req.body;
    const file = req.file;
    try {
      if (!conversationId || !type || !file)
        throw new MyError("File, Type or ConversationId not exists");

      const message = await messageService.addFile(
        file,
        type,
        conversationId,
        userId
      );
      res.status(201).json(message);
    } catch (err) {
      next(err);
    }
  }

  //addReacts
  async addReact(req, res, next) {
    try {
      const message = await messageService.addReact(req);
      res.status(201).json(message);
    } catch (err) {
      next(err);
    }
  }

  //deleteReacts
  async deleteReact(req, res, next) {
    try {
      const message = await messageService.deleteReact(req);
      res.status(201).json(message);
    } catch (err) {
      next(err);
    }
  }

  //getReacts
  async getReact(req, res, next) {
    try {
      messageService.getReact(req, res);
    } catch (err) {
      next(err);
    }
  }

  //thu hoi tin nhan
  async reMessage(req, res, next) {
    try {
      const message = await messageService.reMessage(req);
      res.status(201).json(message);
    } catch (err) {
      next(err);
    }
  }

  //xoa tin nhan
  async deleteMessage(req, res, next) {
    try {
      messageService.deleteMessage(req, res);
      res.status(201).json({
        message: "Xóa tin nhắn thành công",
      });
    } catch (err) {
      next(err);
    }
  }


  //lay tin nhan theo loai
  async getMessageByType(req, res, next) {
    try {
       messageService.getMessageByType(req, res);
    } catch (err) {
        next(err);
    }
}

}

module.exports = MessageController;
