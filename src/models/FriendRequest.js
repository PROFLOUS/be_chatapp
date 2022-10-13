const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;
const NotFoundError = require('../exception/NotFoundError');

const friendReqSchema = new Schema(
    {
        senderId: ObjectId,
        receiverId: ObjectId,
    },
    { timestamps: true }
);

friendReqSchema.statics.existsByIds = async (senderId, receiverId) => {
    const isExists = await FriendRequest.findOne({
        senderId,
        receiverId,
    });

    if (isExists) return true;

    return false;
};

friendReqSchema.statics.checkByIds = async (senderId,receiverId,message = 'Invite') => {
    const isExists = await FriendRequest.findOne({
        senderId,
        receiverId,
    });
    console.log(isExists);

    if (!isExists) throw new NotFoundError(message);
};

friendReqSchema.statics.deleteByIds = async (senderId,receiverId,message = 'Invite'
) => {
    const rs = await FriendRequest.deleteOne({ senderId, receiverId });

    const { deletedCount } = rs;
    if (deletedCount === 0) throw new NotFoundError(message);
};

const FriendRequest = mongoose.model('friendRequest', friendReqSchema);

module.exports =  FriendRequest;