const Conversation = require('../models/Conversation');
const Member = require('../models/Member');
const messageService = require('../services/MessageService');
const Message = require('../models/Message');
const commonUtils = require('../utils/commonUtils');
const ArgumentError = require('../exception/ArgumentError');
const Friend = require('../models/Friend');
const ObjectId = require('mongodb').ObjectId;
const MyError = require("../exception/MyError");



class ConversationService {

    async getInfoIndividual(conversationId,userId){
        const conver = await Conversation.getMemberFriend(conversationId,userId);
        const cons = conver.map((con) => con);
        let firstName = '';
        let lastName = '';
        let avatar ;
        let userIdFriend;
        let idCon;
        for(const conTmp of cons){
            const {members,_id} = conTmp;
            const {userFistName,userLastName,avaUser} = members;
            
            firstName = userFistName;
            lastName=userLastName;
            avatar = avaUser;
            userIdFriend=members.userId;
            idCon = _id;
        }
        return {firstName,lastName,avatar,userIdFriend,idCon};
    }

    async updateNumberUnread(conversationId, userId) {
        
        
        //update numberUnread
        if(conversationId){
            const member = await Member.findOne({conversationId, userId});
            if(member){
                const { lastView } = member;
                const countUnread = await Message.countUnread(lastView, conversationId);
                await member.updateOne({ $set: { numberUnread: countUnread } });
            }
        
        }
    }

    async getOneConversation(senderID, receiverID) {
        const conversation = await Conversation.findOne({
            "type": false,
            "members.userId":{$all:[senderID,receiverID]},
        })
        if(conversation){
            const listCon = await this.getAllConversation(senderID);
            const result = listCon.data.filter((con) => con.conversations._id.toString() === conversation._id.toString());
            return result;
        }else{
            return null;
        }
    }

    async getInfoGroup(conversation){
        const { _id, name, avatar } = conversation;
        let groupName = '';
        let groupAvatar = [];
        let userInfo;
        let leaderId;
        if (!name || !avatar) {
            const nameAndAvataresOfGroup =
                await Conversation.findOne({ _id },{_id:0,
                    members: {
                        userFistName: 1,
                        userLastName:1,
                        avaUser:1,
                        userId:1,
                },}).distinct('members');

            userInfo = nameAndAvataresOfGroup;
            for (const tempt of nameAndAvataresOfGroup) {
                const nameTempt = tempt.userLastName;
                const { avaUser} = tempt;
                groupName += `, ${nameTempt}`;
                groupAvatar.push({ avaUser });
            }
        }else{
            const nameAndAvataresOfGroup =
                await Conversation.findOne({ _id },{_id:0,
                    members: {
                        userFistName: 1,
                        userLastName:1,
                        avaUser:1,
                        userId:1,
                },}).distinct('members');
            userInfo = nameAndAvataresOfGroup;
            groupAvatar.push(avatar);
        }

        const result = {
            name,
            avatar,
            idCon: _id,
            userInfo,
        };

        result.avatar = groupAvatar;
        if (!name) result.name = groupName.slice(2);
        return result;
    }

    async checkIsFriendByCon(conversationId,userId,){
        //check đã là bạn
        let status;       
        const conver = await Conversation.getMemberFriend(conversationId,userId);
        const fri= conver.map(async(con) => {
            const {members} = con;
            const freId = members.userId.toString();
            
            const status = await Friend.existsByIds(userId,freId);
            return status;
        });
        status = await Promise.all(fri);
        return status;
    }
    
    async getConversationById(conversationId,userId,page, size){
        if (!conversationId || !size || page < 0 || size <= 0) 
            throw new ArgumentError();
        const conversation = await Conversation.findOne({ 
            _id:conversationId,
        })

        const{type} = conversation;
        let inFo;
        let status;
        // check true la nhom false la ca nhan
        if(type){
            inFo = await this.getInfoGroup(conversation);
            status='';
        }else{
            inFo = await this.getInfoIndividual(conversationId,userId);  
            status = await this.checkIsFriendByCon(conversationId,userId);
        }
        
        const totalMessages =
        await Message.countDocumentsByConversationIdAndUserId(
            conversationId
        );
        

        const { skip, limit, totalPages } = commonUtils.getPagination(
            page,
            size,
            totalMessages
        ); 
        console.log(skip,limit,totalPages);

        try {
            let messages = await Message.getListByConversationIdAndUserId(conversationId,userId,skip,limit);
            
            console.log(messages);

            //update lastView
            await Member.updateOne(
                { conversationId, userId },
                { $set: { lastView: new Date() } },
            );
            //update numberUnread
            await this.updateNumberUnread(conversationId, userId);
            // const member = await Member.findOne({conversationId, userId});
            // const { lastView } = member;
            // const countUnread = await Message.countUnread(lastView, conversationId);
            // await member.updateOne({ $set: { numberUnread: countUnread } });

            return {
                data: messages,
                conversationId,
                type,
                info:inFo,
                friendStatus: status[0],
                page,
                size,
                totalPages
            }
        } catch (error) {
            console.log(error);
        }
    }

    async getAllConversation(userId,page=0, size=20){
        if (!userId || !size || page < 0 || size <= 0)
            throw new ArgumentError();
        const totalCon =
        await Conversation.countConversationByUserId(
            userId
        );
        const { skip, limit, totalPages } = commonUtils.getPagination(
            page,
            size,
            totalCon
        );

        const consId = await Conversation.find({
            "members.userId":{$in:[userId]},
        })
        let listInfo =[];
        const conIds = consId.map((con) => con._id);
        for(const id of conIds){
            const conversation = await Conversation.findOne({
                _id:id,
            })
            const{type} = conversation;
            if(type){
                const inFoGroup = await this.getInfoGroup(conversation);
                listInfo.push(inFoGroup);
            }else{
                var rs = await this.getInfoIndividual(id,userId);
                listInfo.push(rs);
            }

            await this.updateNumberUnread(id, userId);
        }
    
        let conversations = await Conversation.getAllConversation(
            userId,
            skip,
            limit
        );

        let rss =[] ;
        if (!conversations || !listInfo)
            throw new MyError(" ConversationId not exists");
        for(let i=0; i<conversations.length;i++){
            for(let j =0; j< listInfo.length;j++){
                if(conversations[i]._id.toString()===listInfo[j].idCon.toString()){
                    rss.push({
                            conversations:conversations[i],
                            inFo:listInfo[j]
                        });
                }
            }
        }
        return {
            data: rss,
            page,
            size,
            totalPages
        }

    }

    async checkConversation(senderID,receiverID){

        const conversation = await Conversation.findOne({
            "type": false,
            "members.userId":{$all:[senderID,receiverID]},
        })
        if(conversation){
            return conversation._id;
        }
        return null;
    }
    
    // return id conversation
    async createIndividualConversation(user1, user2) {
        
        const check = await this.checkConversation(user1.userId,user2.userId)
        if(!check){
        console.log("createIndividualConversation");
            // add new conversation
        const newConversation = new Conversation({
            // name: user2.userLastName,
            // avatar: user2.avaUser,
            members: [user1, user2],
            type: false,
        });
        const saveConversation = await newConversation.save();
        const { _id } = saveConversation;

        // tạo 2 member
        const member1 = new Member({
            conversationId: _id,
            userId: user1.userId,
        });

        const member2 = new Member({
            conversationId: _id,
            userId: user2.userId,
        });

        // save
        await member1.save()
        await member2.save();

        return _id;
        }else{
        console.log("IndividualConversation is exists");

            return {_id:check}
        }
        
    }

    async createGroupConversation(userSelt,name,avatar,userInRoom){
        
        var uss = userInRoom.map((us) => us.userId);

        const users =[userSelt.userId,...uss];

        console.log(users);

        // add new conversation
        const newConversation = new Conversation({
            name,
            avatar,
            leaderId: userSelt.userId,
            members: [userSelt,...userInRoom],
            type: true,
        });
        const saveConversation = await newConversation.save();
        const { _id } = saveConversation;

        const newMessage = new Message({
            userId: userSelt.userId,
            content: 'Đã tạo nhóm',
            type: 'NOTIFY',
            conversationId: _id,
        });

        await newMessage.save();
        const mesId= newMessage._id;

        await Conversation.updateOne(
            { _id },
            { lastMessageId: mesId }
        );

        // save members
        for(const uid of users){
            const member = new Member({
                conversationId: _id,
                userId: uid,
            });
            member.save().then();
        }

        return _id;

    }

    //create conversation when was friend
    async createIndividualConversationWhenWasFriend(user, sender) {

        

        const { _id, isExists } = await this.createIndividualConversation(
            user,
            sender
        );

        // tao loi chao mung
        const newMessage = new Message({
            userId:user.userId,
            content: 'Đã là bạn bè',
            type: 'NOTIFY',
            conversationId: _id,
        });

        await newMessage.save();

        const mesId= newMessage._id;
        await Conversation.updateOne(
            { _id },
            { lastMessageId: mesId }
        );

        return { conversationId: _id, isExists , message: newMessage};
    }

    async getMembers(conversationId){
        return await Conversation.findOne({
            _id:conversationId,
        },{members:1,leaderId:1,_id:0});
    }

    async addMembers(conversationId,members,userId){


        // add members to conversation
        await Conversation.updateOne(
            { _id: conversationId },
            { $push: { members: { $each: members } } }
        );
        
        let newMessage;
        // save members
        members.forEach(async(member) => {
            
            const newMember = new Member({
                conversationId,
                userId: member.userId,
            });
            newMember.save().then();

            // add message
            newMessage = new Message({
                userId,
                content: `${member.userFistName+' '+member.userLastName} đã tham gia nhóm`,
                type: 'NOTIFY',
                conversationId,
            })
            await newMessage.save();
            
        });

        // update last message
        const{_id,createdAt} = newMessage;
        await Conversation.updateOne(
            { _id: conversationId },
            { lastMessageId: _id }
        );


        // update last view
        await Member.updateOne(
            { conversationId, userId },
            { lastView: createdAt }
        )

        return true;
    }

    async deleteMembers(conversationId, memberId,userId){

        const dataUser = await Conversation.findOne(
            { _id: conversationId },
            {members: {
                $elemMatch: {
                    userId: userId
                }
            }}
        );
        console.log(dataUser)

        const dataMember = await Conversation.findOne(
            { _id: conversationId },
            {members: {
                $elemMatch: {
                    userId: memberId
                }
            }}
        );

        console.log(dataMember)

        const {userFistName,userLastName} = dataUser.members[0];

        // delete member in conversation
        await Conversation.updateOne(
            { _id: conversationId },
            { $pull: { members: { userId: memberId } } }
        );

        // delete member in member
        await Member.deleteOne({
            conversationId,
            userId: memberId,
        });
 
        // add message
        const newMessage = new Message({
            userId,
            content: `${userFistName+""+userLastName} Đã xóa ${dataMember.members[0].userFistName+""+dataMember.members[0].userLastName} khỏi nhóm`,
            type: 'NOTIFY',
            conversationId,
        })
        await newMessage.save();

        // update last message
        const{_id,createdAt} = newMessage;
        await Conversation.updateOne(
            { _id: conversationId },
            { lastMessageId: _id }
        );

        // update last view
        await Member.updateOne(
            { conversationId, userId },
            { lastView: createdAt }
        )

        return true;

    }

    async deleteAllMessage(conversationId,userId){
        const rs = await Message.updateMany(
            {
            conversationId:ObjectId(conversationId),deletedByUserIds:{ $nin: [userId]  }
           },
           { $push: { deletedByUserIds: userId } }
        );
        return rs;
    }

    async leaveGroup(conversationId,userId){
        console.log(conversationId,userId)
        
        const data = await Conversation.findOne(
            { _id: conversationId },
            {members: {
                $elemMatch: {
                    userId: userId
                }
            }}
        );
        console.log(data)
        const {userFistName,userLastName} = data.members[0];
        
        // delete member in conversation
        await Conversation.updateOne(
            { _id: conversationId },
            { $pull: { members: { userId } } }
        );

        // count member in conversation
        const countMember = await Member.countDocuments({
            conversationId,
        });
        console.log(countMember)
        if(countMember === 0){
            return await ConversationService.deleteGroup(conversationId);
        }else{
            const{leaderId} = await Conversation.findOne({_id:conversationId});
            // delete member in member
            await Member.deleteOne({
                conversationId,
                userId,
            });

            // add message
            const newMessage = new Message({
                userId,
                content: `${userFistName+""+userLastName} Đã rời khỏi nhóm`,
                type: 'NOTIFY',
                conversationId,
            })
            await newMessage.save();

            // update last message
            const{_id,createdAt} = newMessage;
            await Conversation.updateOne(
                { _id: conversationId },
                { lastMessageId: _id }
            );

            if(userId===leaderId){
                const newLeader = await Member.findOne({conversationId},{userId:1,_id:0}).limit(1);
                console.log(newLeader);
                await Conversation.updateOne(
                    { _id: conversationId },
                    { leaderId: newLeader.userId }
                );
            }
        }
        

        return true;

    }

    async deleteGroup(conversationId){
        // delete member in conversation
        await Conversation.deleteOne(
            { _id: conversationId },
        );

        // delete member in member
        await Member.deleteMany({
            conversationId,
        });

        // delete message
        await Message.deleteMany({
            conversationId,
        });

        return true;

    }


}

module.exports = ConversationService;