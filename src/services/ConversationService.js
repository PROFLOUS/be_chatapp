const Conversation = require('../models/Conversation');
const Member = require('../models/Member');
const messageService = require('../services/MessageService');
const Message = require('../models/Message');
const commonUtils = require('../utils/commonUtils');
const ArgumentError = require('../exception/ArgumentError');
const Friend = require('../models/Friend');
const ObjectId = require('mongodb').ObjectId;



class ConversationService {

    async getInfoIndividual(conversationId,userId){
        const conver = await Conversation.getMemberByCon(conversationId,userId);
        const cons = conver.map((con) => con);
        let firstName = '';
        let lastName = '';
        let avatar ;
        let userIdFriend;
        for(const conTmp of cons){
            const {members,_id} = conTmp;
            const {userFistName,userLastName,avaUser} = members;
            
            firstName = userFistName;
            lastName=userLastName;
            avatar = avaUser;
            userIdFriend=members.userId;
        }
        return {firstName,lastName,avatar,userIdFriend};
    }

    async updateNumberUnread(conversationId, userId) {
        
        
        //update numberUnread
        const member = await Member.findOne({conversationId, userId});
        
        const { lastView } = member;
        const countUnread = await Message.countUnread(lastView, conversationId);
        await member.updateOne({ $set: { numberUnread: countUnread } });
    }

    async getInfoGroup(conversation){
        const { _id, name, avatar } = conversation;
        let groupName = '';
        let groupAvatar = [];

        if (!name || !avatar) {
            const nameAndAvataresOfGroup =
                await Conversation.findOne({ _id },{_id:0,
                    members: {
                        userLastName:1,
                        avaUser:1
                },}).distinct('members');
            for (const tempt of nameAndAvataresOfGroup) {
                const nameTempt = tempt.userLastName;
                const { avaUser} = tempt;
                groupName += `, ${nameTempt}`;
                groupAvatar.push({ avaUser });
            }
        }

        const result = {
            name,
            avatar,
        };

        result.avatar = groupAvatar;
        if (!name) result.name = groupName.slice(2);
        return result;
    }

    async checkIsFriendByCon(conversationId,userId,){
        //check đã là bạn
        let status;       
        const conver = await Conversation.getMemberByCon(conversationId,userId);
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

        try {
            let messages = await Message.getListByConversationIdAndUserId(conversationId,skip,limit);
            
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

    async getAllConversation(userId,page, size){
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

        // let inFo=[];
        let listInfo =[];
        
        const conIds = consId.map((con) => con._id);
        for(const id of conIds){

            const conversation = await Conversation.findOne({
                _id:id,
            })
            const{type} = conversation;
            if(type){
                const inFoGroup = await this.getInfoGroup(conversation);
                // inFo.length = 0;
                // inFo.push(inFoGroup);
                listInfo.push(inFoGroup);
            }else{
                var rs = await this.getInfoIndividual(id,userId);
                listInfo.push(rs);
            }
            


            //update numberUnread
            await this.updateNumberUnread(id, userId);

            // //update numberUnread
            // const mb = await Member.findOne({
            //     conversationId:id,
            //     userId
            // })
            // const { lastView } = mb;
            // const countUnread = await Message.countUnread(lastView, id);
            // await mb.updateOne({ $set: { numberUnread: countUnread } });
            
            
        }
        

        let conversations = await Conversation.getAllConversation(
            userId,
            skip,
            limit
        );
        let rss =[] ;
        let ifo = listInfo.reverse();

        for(let i=0; i<conversations.length;i++){
            rss.push({conversations:conversations[i],inFo:ifo[i]});
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
            "members.userId":{$all:[senderID,receiverID]},
        })
        if(conversation){
            return conversation._id;
        }
        return false;
    }
    
    // return id conversation
    async createIndividualConversation(user1, user2) {
        


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
    }

    async createGroupConversation(userO,name,userList){
        
        var uss = userList.map((us) => us.userId);

        const users =[userO.userId,...uss];

        // add new conversation
        const newConversation = new Conversation({
            name,
            leaderId: userO.userId,
            members: [userO,...userList],
            type: true,
        });
        const saveConversation = await newConversation.save();
        const { _id } = saveConversation;

        const newMessage = new Message({
            userId: userO.userId,
            content: 'Đã tạo nhóm',
            type: 'NOTIFY',
            conversationId: _id,
        });


        await newMessage.save();
        const { _id:mesId } = newMessage;

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
            content: 'Đã là bạn bè',
            type: 'NOTIFY',
            conversationId: _id,
        });

        const saveMessage = await messageService.addText(newMessage, user.userId);

        return { conversationId: _id, isExists , message: saveMessage};
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
            content: `Đã xóa ${memberId} khỏi nhóm`,
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

    async leaveGroup(conversationId,userId){
        // delete member in conversation
        await Conversation.updateOne(
            { _id: conversationId },
            { $pull: { members: { userId } } }
        );

        // delete member in member
        await Member.deleteOne({
            conversationId,
            userId,
        });

        // add message
        const newMessage = new Message({
            userId,
            content: `${userId} Đã rời khỏi nhóm`,
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

        return true;


    }




}

module.exports = ConversationService;