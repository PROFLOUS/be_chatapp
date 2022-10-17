const route = (app, io) => {
  const friendRouter = require("./friend")(io);
  const conversationRouter = require("./conversation")(io);
  const messageRouter = require("./message")(io);

  app.use("/friends", friendRouter);
  app.use("/conversation", conversationRouter);
  app.use("/messages", messageRouter);
};

module.exports = route;
