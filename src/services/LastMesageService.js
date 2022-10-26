const Member = require('../models/Member');


const LastMessageService = {
    async updateLastMessage(conversationId, userId) {
        //update lastView
        await Member.updateOne(
            { conversationId, userId },
            { $set: { lastView: new Date() } },
        );
    }
}


module.exports = LastMessageService;