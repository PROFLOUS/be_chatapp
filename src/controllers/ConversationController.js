const ConversationService = require('../services/ConversationService');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const NotFoundError = require('../exception/NotFoundError');
const redisDb = require('../app/redis');
const ObjectId = require('mongodb').ObjectId;
const mongoose = require('mongoose')

class ConversationController {
    constructor(io) {
        this.io = io;
        this.createIndividualConversation =
        this.createIndividualConversation.bind(this);
        this.createGroupConversation = this.createGroupConversation.bind(this);
        this.leaveGroup = this.leaveGroup.bind(this);

    }

    // [GET] /:id
    async getOne(req, res, next) {
        const { id } = req.params;
        // const { userId } = req.params;
        const userId = req.query.receiverId;


        // var page=0;
        // var size=20;
        const {page, size} = req.query;

        try {
            const conversationService = new ConversationService();
            const conversation =
                await conversationService.getConversationById(id,userId,parseInt(page),parseInt(size));
            res.json(conversation);
        } catch (err) {
            next(err);
        }
    }

    // [GET] /
    async getAll(req, res, next) {
        let userId = req.params.userId;
        const {page, size} = req.query;
    
        try {
            const conversationService = new ConversationService();
            const conversations =
                await conversationService.getAllConversation(userId,parseInt(page),parseInt(size));
            res.json(conversations);
        }catch (err) {
            next(err);
        }

    }

    async checkConversation(req, res, next) {
        // const senderID = req.params.userId;
        // const receiverID = req.params.friendId;

        const senderID = req.query.senderID;
        const receiverID = req.query.receiverID;
        
        const conversationService = new ConversationService();

        try {
            const conversation = await conversationService.checkConversation(senderID, receiverID);
                res.json(conversation);
        }catch (err) {
            throw new Exception(err);
        }
    }

    // [POST] /individuals/:userId
    async createIndividualConversation(req, res, next) {

        const {userId} = req.params;
        const {userFriendId} = req.body;
        // var myId = JSON.parse(userI);


        // var objectId = mongoose.Types.ObjectId(myId);
        // console.log(objectId);

        // const idSelt = new ObjectId(userId.trim());
        // console.log(typeof idSelt);
        // const idUserFren = new ObjectId(userFriendId);
        // console.log(typeof idUserFren);

        

        const userSelt = await redisDb.client.get(''+userId).then((data)=>{
            return JSON.parse(data)
        }).catch((err)=>{
            console.log(err);
        });
        const userFriend = await redisDb.client.get(''+userFriendId).then((data)=>{
            return JSON.parse(data)
        }).catch((err)=>{
            console.log(err);
        });


        const user1 ={
            userId: userSelt.uid,
            userFistName:userSelt.first_name,
            userLastName: userSelt.last_name,
            avaUser: userSelt.avatar
        }

        const user2 ={
            userId: userFriend.uid,
            userFistName:userFriend.first_name,
            userLastName: userFriend.last_name,
            avaUser: userFriend.avatar
        }

        const conversationService = new ConversationService();

        try {
                const rs=  await conversationService.createIndividualConversation(
                    user1,
                    user2,
                );
                res.status(201).json(rs);
        } catch (err) {
            res.status(500).json({message: err.message});
            // console.log(err);
            // next(err);
        }
    }

    // [DELETE] /:id/messages
    async deleteAllMessage(req, res, next) {
        const {id} = req.params;
        const {userId} = req.body;
        const conversationService = new ConversationService();

        try {
            const rs = await conversationService.deleteAllMessage(id,userId);
            res.status(201).json(rs);
        }catch (err) {
            next(err);
        }
    }


    async createGroupConversation(req, res, next) {
        const {userId,name='',userList=[],avatar} = req.body;
        const conversationService = new ConversationService();

        const userSeltFb = await redisDb.client.get(''+userId).then((data)=>{
            return JSON.parse(data)
        }).catch((err)=>{
            console.log(err);
        });

        const userSelt ={
            userId: userSeltFb.uid,
            userFistName:userSeltFb.first_name,
            userLastName: userSeltFb.last_name,
            avaUser: userSeltFb.avatar
        }

        // info user in room
        let userInRoom = [];

        for (let i = 0; i < userList.length; i++) {
            const user = await redisDb.client.get(''+userList[i]).then((data)=>{
                return JSON.parse(data)
            }).catch((err)=>{
                console.log(err);
            });
            const userIn ={
                userId: user.uid,
                userFistName:user.first_name,
                userLastName: user.last_name,
                avaUser: user.avatar
            }
            userInRoom.push(userIn);
        }
        try {
            const rs=  await conversationService.createGroupConversation(
                userSelt,
                name,
                avatar,
                userInRoom
            );

            // this.io.to(rs).emit('create-conversation',rs)

            res.status(201).json(rs);
        }catch (err) {
            next(err);
        }

    }

    async getMembers(req, res, next) {
        const {id} = req.params;
        const conversationService = new ConversationService();

        try {
            const members = await conversationService.getMembers(id);
            res.json(members);
        }catch (err) {
            next(err);
        }
    }

    async addMembers(req, res, next) {
        const {id} = req.params;
        const {members=[],userId} = req.body;

        let memberInRoom = [];
        for (let i = 0; i < members.length; i++) {
            const user = await redisDb.client.get(''+members[i]).then((data)=>{
                return JSON.parse(data)
            }).catch((err)=>{
                console.log(err);
            });
            const userIn ={
                userId: user.uid,
                userFistName:user.first_name,
                userLastName: user.last_name,
                avaUser: user.avatar
            }
            memberInRoom.push(userIn);
        }
        
        const conversationService = new ConversationService();

        try {
            
            const rs = await conversationService.addMembers(id, memberInRoom,userId);
            res.json(rs);
        }catch (err) {
            next(err);
        }
    }

    async deleteMembers(req, res, next) {
        const {id, memberId} = req.params;
        const {userId} = req.body;
        console.log(memberId,userId)

        const conversationService = new ConversationService();

        try {
            const rs = await conversationService.deleteMembers(id, memberId,userId);
            res.json(rs);
        }catch (err) {
            next(err);
        }
    }

    async leaveGroup(req, res, next) {
        const {id} = req.params;
        const {userId} = req.body;

        const conversationService = new ConversationService();

        try {
            const rs = await conversationService.leaveGroup(id, userId);
            res.json(rs);
        }catch (err) {
            next(err);
        }
    }

    async deleteGroup(req, res, next) {
        const {id} = req.params;
        

        const conversationService = new ConversationService();

        try {
            const rs = await conversationService.deleteGroup(id);
            res.json(rs);
        }catch (err) {
            next(err);
        }

    }

    async getNewConversation(req, res, next) {
        const senderID = req.query.senderID;
        const receiverID = req.query.receiverID;
        console.log(senderID,receiverID)
        const conversationService = new ConversationService();

        try {
            const conversation = await conversationService.getOneConversation(senderID, receiverID);
                res.json(conversation);
        }catch (err) {
            next(err);
        }
    }
}

module.exports = ConversationController;