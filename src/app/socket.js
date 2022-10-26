// const redisService = require('../services/redisService');
const redisDb = require("../app/redis");

const ConversationService = require("../services/ConversationService");
const LastMessageService = require("../services/LastMesageService");

const handleStart = async (user) => {
  const { uid, first_name, last_name, avatar } = user;
  // const cachedUser = await redisDb.client.get(''+uid).then((data)=>{
  //   return JSON.parse(data)
  // }).catch((err)=>{
  //   console.log(err);
  // });
  // if(cachedUser){
  //   await redisDb.set(uid, {
  //     ...cachedUser,
  //     isOnline: true,
  //     lastLogin: new Date(),
  //   });
  // }else{
  await redisDb.set(uid, {
    uid,
    first_name,
    last_name,
    avatar,
    isOnline: true,
    lastLogin: new Date(),
  });
  // }
  // await redisDb.set(uid, {
  //   uid,
  //   first_name,
  //   last_name,
  //   avatar,
  //   isOnline: true,
  //   lastLogin: null,
  // });
  // const cachedUser = await redisDb.get(userId);
  // console.log(cachedUser);
  // if (cachedUser){
  //     await redisDb.set(userId, {
  //         ...cachedUser,
  //         isOnline: true,
  //         lastLogin: null,
  //     });
  // }else{
  //     await redisDb.set(userId, {
  //         isOnline: true,
  //         lastLogin: null,
  //     });
  // }
};

const handleEnd = async (userId) => {
  const cachedUser = await redisDb.client
    .get("" + userId)
    .then((data) => {
      return JSON.parse(data);
    })
    .catch((err) => {
      console.log(err);
    });
  if (cachedUser)
    await redisDb.set(userId, {
      ...cachedUser,
      isOnline: false,
      lastLogin: new Date(),
    });
};

const getListUserOnline = async (userId, cb) => {
  const cachedUser = await redisDb.get(userId);

  if (cachedUser) {
    const { isOnline, lastLogin } = cachedUser;
    cb({ isOnline, lastLogin });
  }
};

const socket = (io) => {
  io.on("connection", (socket) => {
    console.log(socket.id + " Connected");

    socket.on("start", (user) => {
      const { uid } = user;
      socket.userId = uid;
      socket.join(uid);
      handleStart(user);
    });

    socket.on("disconnect", () => {
      const userId = socket.userId;
      console.log(socket.id + " Disconnected");

      if (userId) handleEnd(userId);
    });

    socket.on("join-conversations", (conversationIds) => {
      console.log("chayy");
      console.log("all1" + conversationIds);
      conversationIds.forEach((id) => {
        socket.join(id);
        console.log(socket.userId + "joinSuccess:" + id + "\n");
      });
    });

    socket.on("join-room", ({ idCon, isNew }) => {
      console.log("join");
      socket.join(idCon);
      console.log(socket.userId + " joinRoom: " + idCon);
    });

    socket.on(
      "send-message",
      async ({ senderId, receiverId, message, idCon, isNew }) => {
        console.log({ message });
        socket.receiverId = receiverId;

        io.to(socket.receiverId)
          .to(socket.userId)
          .emit("get-message", { senderId, message });
        const conversationService = new ConversationService();
        const listConSender = await conversationService.getAllConversation(
          senderId
        );
        const listConReceiver = await conversationService.getAllConversation(
          receiverId
        );

        // if(isNew){
        //   console.log("new");
        //   io.emit("get-last-message",{
        //     listSender:listConSender.data,
        //     listReceiver:listConReceiver.data

        //   })
        //   isNew = false;
        // }else{

        io.to(socket.receiverId).to(socket.userId).emit("get-last-message", {
          listSender: listConSender.data,
          listReceiver: listConReceiver.data,
        });
        console.log("last");
        // }
      }
    );

    socket.on("reMessage", ({ idMessage, idCon }) => {
      console.log("reMessage" + idMessage);
      io.to(idCon).emit("reMessage", idMessage);
    });

    socket.on("leave-room", (idConversation) => {
      socket.leave(idConversation);
      console.log("leaveRoom" + idConversation);
    });

    socket.on("seen-message", async ({ conversationId, userId }) => {
      const conversationService = new ConversationService();
      await LastMessageService.updateLastMessage(conversationId, userId);
      const listConSender = await conversationService.getAllConversation(
        userId
      );
      io.to(socket.id).emit("get-last", listConSender.data);
    });
  });
};

module.exports = socket;
