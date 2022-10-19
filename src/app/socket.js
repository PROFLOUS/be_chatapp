
// const redisService = require('../services/redisService');
const redisDb = require('../app/redis');

const handleStart = async (user) => {    
    const {uid,first_name,last_name,avatar} = user;
    
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

const socket =(io)=>{
    io.on('connect',(socket)=>{

        console.log(socket.id+" Connected");

        socket.on('disconnect',()=>{
            const userId = socket.userId;
            if(userId) handleEnd(userId);
        });

        socket.on('start',(user)=>{
            const {uid} = user;
            socket.uid = uid;
            socket.join(uid);
            handleStart(user);
        })

        socket.on('join-conversations', (conversationIds) => {
            conversationIds.forEach((id) => socket.join(id));
        });

        socket.on('send-message',(senderId,conversationId,message)=>{
            socket.to(conversationId).emit('get-message',conversationId,message);
        });

        
    })

}

module.exports = socket;