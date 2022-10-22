// const redisService = require('../services/redisService');
const redisDb = require("../app/redis");
const ConversationService = require('../services/ConversationService');

const handleStart = async (user) => {
  const { uid, first_name, last_name, avatar } = user;

  await redisDb.set(uid, {
    uid,
    first_name,
    last_name,
    avatar,
    isOnline: true,
    lastLogin: null,
  });
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
  const cachedUser = await redisDb.get(userId);
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



let users =[];

const addUsers = (userId,soketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, soketId });
};

const removeUser = (soketId) => {
  users = users.filter((user) => user.soketId !== soketId);
}

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
}

const socket = (io) => {
  io.on("connection", (socket) => {
    console.log(socket.id + " Connected");

    // socket.on("add-user", (userId) => {
    //   addUsers(userId,socket.id);
    //   io.emit("get-users",users);
    // });

    // socket.on("send-message",async ({senderId,receiverId,message}) => {
    //   const user = getUser(receiverId);
    //   io.to(user.soketId).emit("get-message",{senderId,message});
    //   const conversationService = new ConversationService();
    //   const listCon = await conversationService.getAllConversation(senderId);
    //   io.emit("get-last-message",listCon.data);      
    // });



    socket.on("disconnect", () => {
      const userId = socket.userId;
      console.log(socket.id + " Disconnected");
      removeUser(socket.id);
      if (userId) handleEnd(userId);
    });

    socket.on("start", (user) => {
      const { uid } = user;
      // socket.userId = uid;
      // socket.join(uid);
      handleStart(user);
    });

    socket.on("join-conversations", (conversationIds) => {
      conversationIds.forEach((id) => socket.join(id));
      console.log("joinSuccess"+conversationIds);
    });

    // socket.on("join-room", (idCon) => {
    //   socket.join(idCon)
    //   console.log("joinRoom"+idCon);
    // });

    socket.on("join-room", (idCon) => {
      socket.join(idCon)
      console.log("joinRoom"+idCon);
      socket.on("send-message",async ({senderId,receiverId,message}) => {
        
        io.to(idCon).emit("get-message",{senderId,message});
        const conversationService = new ConversationService();
        const listCon = await conversationService.getAllConversation(senderId);
        io.emit("get-last-message",listCon.data);      
      });
    });

    
  });
};

module.exports = socket;
