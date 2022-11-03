const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const messageSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    conversationId: {
      type: ObjectId,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },

    reacts: [],

    replyMessageId: {
      type: ObjectId,
    },

    deletedByUserIds: [],
    type: {
      type: String,
      enum: ["TEXT", "IMAGE", "STICKER", "VIDEO", "APPLICATION", "HTML", "NOTIFY"],
      require: true,
    },
    createdAt: Date,
    updatedAt: Date,
  },
  { timestamps: true }
);

//total message
messageSchema.statics.countDocumentsByConversationIdAndUserId = async (
  conversationId
) => {
  const totalMessages = await Message.countDocuments({
    conversationId,
  });

  return totalMessages;
};
//list conversation individual
messageSchema.statics.getListByConversationIdAndUserId = async (
  conversationId,
  userId,
  skip,
  limit
) => {
  const messages = await Message.aggregate([
    {
      $match: {
          conversationId: ObjectId(conversationId),
          deletedUserIds: {
              $nin: [userId],
          },
      },
      
  },
  {
      $lookup: {
          from: 'messages',
          localField: 'replyMessageId',
          foreignField: '_id',
          as: 'replyMessage',
      },
  },
  {
     $skip: skip,
  },
  {
      $limit: limit,
  },
  {
      $group:{
          _id: "$conversationId",
          messages: {
              $push: {
                  _id: "$_id",
                  userId: "$userId",
                  content: "$content",
                  createdAt: "$createdAt",
                  isDeleted: "$isDeleted",
                  deletedByUserIds: "$deletedByUserIds",
                  reacts:"$reacts",
                  replyMessageId: "$replyMessage",
                  createdAt: "$createdAt",
                  type: "$type",
              },
          },
      },
  }
  ,{
      $project: {
          _id: 0,
          messages: 1,
      },
  },
  ]);
  return messages;
};

messageSchema.statics.countUnread = async (time, conversationId) => {
  return await Message.countDocuments({
    createdAt: { $gt: time },
    conversationId,
  });
};

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;