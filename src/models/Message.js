const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const messageSchema = new Schema({
    userId: {
        type: ObjectId,
        required: true,
    },
    content: {
        type: String,
        required: true
    },
    conversationId: {
        type: ObjectId,
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    reacts: {
        type: [
            {
                userId: ObjectId,
                type: {
                    type: Number,
                    enum: [0, 1, 2, 3, 4, 5, 6],
                },
            },
        ],
        default: [],
    },
    replyMessageId: {
        type: ObjectId,
    },
    tagUserIds: {
        type: [ObjectId],
        default: [],
    },
    type: {
        type: String,
        enum: [
            'TEXT',
            'IMAGE',
            'STICKER',
            'VIDEO',
            'FILE',
            'HTML',
            'NOTIFY',
            'VOTE',
        ],
        require: true,
    },
    createdAt: Date,
    updatedAt: Date,


},
    { timestamps: true }
);

//total message 
messageSchema.statics.countDocumentsByConversationIdAndUserId = async (
    conversationId,
    userId
) => {
    const totalMessages = await Message.countDocuments({
        conversationId,
        deletedByUserIds: {
            $nin: [userId],
        },
    });

    return totalMessages;
};
//list conversation individual
messageSchema.statics.getListByConversationIdAndUserIdOfIndividual = async (
    pr,
    skip,
    limit
) => {
    const messages = await Message.aggregate([
        {
            $match: {
                conversationId: { 
                    $in:pr
                },
            },
        },
        {
            $lookup: {
                from: 'conversations',
                localField: 'conversationId',
                foreignField: '_id',
                as: 'conversations',
            },
        },
        {
            $project: {
                userId: 1,
                conversationId: 1,
                conversations: {
                    _id: 1,
                    name: 1,
                    avatar: 1,
                },
                content: 1,
                type: 1,
                createdAt: 1,
                updatedAt: 1,
            },
        },
        {
            $skip: skip,
        },
        {
            $limit: limit,
        },
        
    ]);
    return messages;
};

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;