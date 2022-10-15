const Conversation = require('../models/Conversation');
const Member = require('../models/Member');
const messageService = require('../services/MessageService');
const Message = require('../models/Message');


class ConversationService {


    async getConversationById(_id){
        try {
            let messages = await Message.find({conversationId: _id});
            return messages;
        } catch (error) {
            console.log(error);
        }
    }

    async getAllConversation(userId){
        try {
            const listChats = await (await Conversation.find({"members.userId":{$all:[userId]}},{_id:1}));
            let id =[];
            listChats.forEach(async (item)=>{
                id.push(item._id);
            })
            let listMessages = await Message.getListByConversationIdAndUserIdOfIndividual(id,0,20);
            const map = new Map();
            for(let message of listMessages){
                let key = message.conversationId.toString();
                if(map.has(key)){
                    if(map.get(key).updatedAt < message.updatedAt){
                        map.set(key, message);
                    } 
                } else {
                    map.set(key, message);
                }
            }
            const rs =[];
                for(let[key, value] of map){
                    rs.push(value);
            }
            return rs;
        }catch (err) {
            console.log(err);
        }

    }

    

    
    // return id conversation
    async createIndividualConversation(user1, user2) {

        // const { userName1, userName2, conversationId } =
        //     await conversationValidate.validateIndividualConversation(
        //         userId1,
        //         userId2
        //     );

        // if (conversationId) return { _id: conversationId, isExists: true };

        // add new conversation
        const newConversation = new Conversation({
            name: user2.userLastName,
            avatar: user2.avaUser,
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

        return { _id, isExists: false };
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




}

module.exports = ConversationService;