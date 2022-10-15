const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const conversationSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    avatar:{
        type: String,
        required: true,
    },
    leaderId: {
        type: ObjectId,
    },
    lastMessageId:ObjectId,
    members: {
        type: [{
            userId: {
                type: ObjectId,
                required: true
              },
              userFistName: {
                type: String,
                required: true
              },
              userLastName: {
                type: String,
                required: true
              },
              avaUser: {
                type: String,
                required: true
              }
        }]
    },
    type:{
        type: Boolean,
        default: false,
    }
},
{timestamps: true}
);

conversationSchema.index({name: 'text'});

//check coveration co ton tai ko
conversationSchema.statics.existsIndividualConversation = async (
    userId1,
    userId2
) => {
    console.log("model");
    const conversation = await Conversation.findOne({
        type: false,
        members: { $all: [userId1, userId2] },
    });

    if (conversation) return conversation._id;
    return null;
};

conversationSchema.statics.getByIdAndUserId = async (
    _id,
    userId,
    message = 'Conversation'
) => {
    const conversation = await Conversation.findOne({
        _id,
        members: { $in: [userId] },
    });

    if (!conversation) throw new NotFoundError(message);

    return conversation;
};


const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;



