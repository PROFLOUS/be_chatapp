// const redisService = require('../services/redisService');
const redisDb = require("../app/redis");
const ConversationService = require('../services/ConversationService');
const LastMessageService = require('../services/LastMesageService');

const handleStart = async (user) => {
  const { uid} = user;
  const cachedUser = await redisDb.client.get(''+uid).then((data)=>{
    return JSON.parse(data)
  }).catch((err)=>{
    console.log(err);
  });
  if(cachedUser){
    await redisDb.set(uid, {
      ...cachedUser,
      isOnline: true,
      lastLogin: new Date(),
    })}else{
    await redisDb.set(uid, {
      ...user,
      isOnline: true,
      lastLogin: new Date(),
    });
  }
  
};

const handleEnd = async (userId) => {
  const cachedUser = await redisDb.client.get(''+userId).then((data)=>{
    return JSON.parse(data)
  }).catch((err)=>{
    console.log(err);
  });
  if (cachedUser)
    await redisDb.set(userId, {
      ...cachedUser,
      isOnline: false,
      lastLogin: new Date(),
    });
};

const getUserOnline = async (userId, cb) => {
  const cachedUser = await redisDb.client.get(''+userId).then((data)=>{
    return JSON.parse(data)
  }).catch((err)=>{
    console.log(err);
  });

  if (cachedUser) {
    const { isOnline, lastLogin } = cachedUser;
    cb({ isOnline, lastLogin });
  }
};

const socket = (io) => {
  io.on("connection", (socket) => {
    

    socket.on("start", (user) => {
      const { uid } = user;
      socket.userId = uid;
      socket.join(uid);
      console.log(socket.userId + " Connected");
      handleStart(user);
    });
    
    socket.on("out", () => {
      const userId = socket.userId;
      console.log(socket.id + " Disconnected");
      if (userId) handleEnd(userId);
    });

    socket.on("disconnect", () => {
      const userId = socket.userId;

      console.log(socket.id + " Disconnected")
      if (userId) handleEnd(userId);
    });


    socket.on("join-conversations", (conversationIds) => {
      // console.log("chayy");
      // console.log("all1"+conversationIds);
      conversationIds.forEach((id) => {
        socket.join(id)
        console.log(socket.userId+"joinSuccess:"+id+"\n");
      });
      
    });


    socket.on("join-room", ({idCon}) => {
      console.log("join");
      socket.join(idCon)
      console.log( socket.userId+" joinRoom: "+idCon);
    });

    socket.on("send-message",async ({senderId,receiverId,message,idCon,name,avatar,isGroup,nameGroup}) => {
      
      if(isGroup){
        io.to(idCon).emit("get-message",{senderId,message,isGroup});
        socket.broadcast.to(idCon).emit("get-notifiGr",{message,name,avatar,nameGroup});
      }
      else{
        socket.receiverId=receiverId
      const conversationService = new ConversationService();

      const listConSender =conversationService.getAllConversation(senderId)
        .then((data)=>{
          return data.data;
        })
      const listConReceiver =conversationService.getAllConversation(receiverId)
        .then((data)=>{
          return data.data;
        })
      
      Promise.all([listConSender,listConReceiver]).then((data)=>{
        const listConSenders = data[0];
        const listConReceivers = data[1];
        io.to(idCon).emit("get-last-message",{
          listSender:listConSenders,
          listReceiver:listConReceivers
        }); 
      })

      socket.broadcast.to(idCon).emit("get-notifi",{message,name,avatar});
      io.to(idCon).emit("get-message",{senderId,message,name});
      }
      
    });

    socket.on("reMessage",({idMessage,idCon})=>{ 
      console.log("reMessage"+idMessage);
      io.to(idCon).emit("reMessage",idMessage);
    })



    socket.on("leave-room", (idConversation) => {
      socket.leave(idConversation);
      console.log("leaveRoom"+idConversation);
    })
    

    socket.on("seen-message",async ({conversationId,userId}) => {
      console.log("seen");
      const conversationService = new ConversationService(); 
      await LastMessageService.updateLastMessage(conversationId,userId);
      // const listConSender = await conversationService.getAllConversation(userId);
      // io.to(conversationId).emit("get-last",listConSender.data);
      io.to(conversationId).emit("get-last");
    })


    socket.on("get-user-online", (userId, cb) => {
      console.log("id"+userId);
      getUserOnline(userId, cb);
    });

    socket.on("reaction", ({isReaction,idConversation}) => {
      console.log(isReaction,idConversation);
      if(isReaction){
        io.to(idConversation).emit("reaction",idConversation);
      }
    });

    socket.on("typing", (idConversation,me) => {
      socket.broadcast.to(idConversation).emit("typing",me);

    });

    socket.on("stop-typing", (idConversation,me) => {
      socket.broadcast.to(idConversation).emit("stop-typing",me);
    });

    socket.on("create-conversation", ({idConversation,idList}) => {
      const userIdsTempt = [socket.userId, ...idList];
      userIdsTempt.forEach((userIdEle) =>{
        io.to(userIdEle).emit("get-conversation-group",idConversation);
      });
    });

    socket.on("kickUser", ({idConversation,idLeader,idUserKick}) => {
      console.log(idConversation,idLeader,idUserKick);
      io.to(idUserKick).emit("kickUser-group",idConversation);
      io.to(idConversation).emit("messNotifi",idConversation);
      io.to(idConversation).emit("notifi-kickUser",idConversation);

    });

     
  });
};

module.exports = socket;
