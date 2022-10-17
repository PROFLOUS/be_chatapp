const ConversationController = require("../controllers/ConversationController");
const router = require("express").Router();

const conversationRouter = (io) => {
  const conversationController = new ConversationController(io);
  // get the conversationId
  router.get("/:id", conversationController.getOne);
  // get all conversation of user

  router.get("/user/:userId", conversationController.getAll);

  // create a new conversation individual
  router.post(
    "/individuals/:userId",
    conversationController.createIndividualConversation
  );
  // create a new group conversation
  router.post("/groups", conversationController.createGroupConversation);

  // get list members
  router.get("/members/:id", conversationController.getMembers);

  // add members
  router.post("/members/:id", conversationController.addMembers);

  // delete members
  router.delete("/members/:id/:memberId", conversationController.deleteMembers);

  // leave group
  router.delete("/leave/:id", conversationController.leaveGroup);

  // delete group
  router.delete("/groups/:id", conversationController.deleteGroup);

  router.get("/test", (req, res) => {
    res.json({ message: "test" });
  });

  return router;
};

module.exports = conversationRouter;
