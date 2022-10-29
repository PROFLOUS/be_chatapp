const router = require("express").Router();
const MessageController = require("../controllers/MessageController");
const uploadFile = require("../middleware/uploadFile");

const messageRouter = (io) => {
  const messageController = new MessageController(io);

  //get list message of conversationId
  router.get("/:conversationId", messageController.getList);
  //send text message
  router.post("/text", messageController.addText);
  //send file message
  router.post(
    "/files",
    uploadFile.uploadFileMiddleware,
    messageController.addFile
  );
  //send react
  router.post("/addReact", messageController.addReact);
  //delete react
  router.post("/deleteReact", messageController.deleteReact);
  //get reacts
  router.get("/reacts/getReact/:idMessage", messageController.getReact);
  //thu hoi tin nhan
  router.post("/reMessage", messageController.reMessage);
  //xoa tin nhan
  router.post("/deleteMessage", messageController.deleteMessage);
  //lay tin nhan theo loai
  router.get('/getMessageByType/:conversationId/:typeMessage', messageController.getMessageByType);
  return router;
};

module.exports = messageRouter;
