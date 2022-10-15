const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const MyError = require('../exception/MyError');

const commonUtils = require('../utils/commonUtils');
const Member = require('../models/Member');
const awsS3Service = require('../services/AwsS3Service');
const MessageService ={

    //get list messages of conversationId
    getList:async(conversationId,userId,page,size)=>{
        if (!conversationId || !userId || !size || page < 0 || size <= 0)
            throw new ArgumentError();

        const conversation = await Conversation.getByIdAndUserId(
            conversationId,
            userId
        );
        //tong so message
        const totalMessages =
            await Message.countDocumentsByConversationIdAndUserId(
                conversationId,
                userId
            );
        //phan trang
        const { skip, limit, totalPages } = commonUtils.getPagination(
            page,
            size,
            totalMessages
        );
        //lay danh sach message
        let messages;
        
        //neu conversation la group
        if (conversation.type) {
            const messagesTempt =
                await Message.getListByConversationIdAndUserIdOfGroup(
                    conversationId,
                    userId,
                    skip,
                    limit
                );

            messages = messagesTempt.map((messageEle) =>
                messageUtils.convertMessageOfGroup(messageEle)
            );
            
        } else {
            const messagesTempt =
                await Message.getListByConversationIdAndUserIdOfIndividual(
                    conversationId,
                    userId,
                    skip,
                    limit
                );
            messages = messagesTempt.map((messageEle) =>
                messageUtils.convertMessageOfIndividual(messageEle)
            );
        }

        // await lastViewService.updateLastViewOfConversation(
        //     conversationId,
        //     userId
        // );

        return {
            data: messages,
            page,
            size,
            totalPages,
        };
        
    },

    // send text
    addText:async(message, userId) => {

        
        const { conversationId,content } = message;
        console.log(message);
        const newMessage = new Message({
            userId,
            content,
            conversationId,
            ...message
        });

        console.log(newMessage);

        // lưu xuống
        const saveMessage = await newMessage.save();
        console.log("saveMessage");
        // cap nhat conversation khi co tin nhan moi
        return MessageService.updateWhenHasNewMessage(
            saveMessage,
            conversationId,
            userId
        );

    },


    // send file
    addFile:async(file,type,conversationId, userId) => {

        // upload ảnh
        const content = await awsS3Service.uploadFile(file);

        console.log("content"+content);

        const newMessageTmp = {
            userId,
            content,
            type,
            conversationId,
        }

        const newMessage = new Message({
            ...newMessageTmp,
        });

        // lưu 
        const saveMessage = await newMessage.save();

        return MessageService.updateWhenHasNewMessage(
            saveMessage,
            conversationId,
            userId
        );

    },

    // update conversation when has new message
    updateWhenHasNewMessage: async(saveMessage, conversationId, userId) => {
        const { _id } = saveMessage;
        console.log(_id);
        await Conversation.updateOne(
            { _id: conversationId },
            { lastMessageId: _id }
        );

        await Member.updateOne(
            { conversationId, userId },
            { $set: { lastView: new Date() } }
        );

        return await Message.findById(_id);
    }

}

module.exports = MessageService;