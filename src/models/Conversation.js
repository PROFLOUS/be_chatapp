const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const conversationSchema = new Schema(
  {
    name: {
      type: String,
    },
    avatar: {
      type: String,
    },
    leaderId: {
      type: String,
    },
    lastMessageId: ObjectId,
    members: {
      type: [
        {
          userId: {
            type: String,
            
          },
          userFistName: {
            type: String,
            
          },
          userLastName: {
            type: String,
            
          },
          avaUser: {
            type: String,
          },
        },
      ],
    },
    type: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

conversationSchema.index({ name: "text" });

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
  message = "Conversation"
) => {
  const conversation = await Conversation.findOne({
    _id,
    members: { $in: [userId] },
  });

  if (!conversation) throw new NotFoundError(message);

  return conversation;
};

conversationSchema.statics.getMemberFriend = async (_id, userId) => {
  const conversation = await Conversation.aggregate([
    {
      $match: {
        _id: ObjectId(_id),
      },
    },
    {
      $unwind: "$members",
    },
    {
      $match: {
        "members.userId": { $ne: userId },
      },
    },
  ]);

  return conversation;
};

//total conversation by userId
conversationSchema.statics.countConversationByUserId = async (userId) => {
  const totalCon = await Conversation.countDocuments({
    "members.userId": { $all: [userId] },
  });

  return totalCon;
};

conversationSchema.statics.getAllConversation = async (userId, skip, limit) => {
  const getAll = await Conversation.aggregate([
    {
      $match: {
        "members.userId": { $in: [userId] },
      },
    },
    {
      $lookup: {
        from: "messages",
        localField: "lastMessageId",
        foreignField: "_id",
        as: "lastMessage",
      },
    },
    {
      $lookup: {
        from: "members",
        localField: "_id",
        foreignField: "conversationId",
        as: "mb",
      },
    },
    {
      $unwind: "$mb",
    },
    {
      $match: {
        "mb.userId": userId,
      },
    },
    {
      $project: {
        lastMessage: {
          userId: 1,
          content: 1,
          type: 1,
          updatedAt: 1,
        },
        mb: {
          numberUnread: 1,
        },
        type: 1,
        leaderId:1
      },
    },
    {
      $sort: {
        "lastMessage.updatedAt": -1,
      },
    },
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
  ]);

  return getAll;
};

const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = Conversation;
