const Message = require("../models/Message");
const Member = require("../models/Member");
const Conversation = require("../models/Conversation");
const Friend = require("../models/Friend");
const ArgumentError = require("../exception/ArgumentError");
const FriendService = require("./FriendService");
const ObjectId = require("mongoose").Types.ObjectId;

const MeService = {
  async getNumberCommonGroup(_id, senderId) {
    const num = await Conversation.aggregate([
      {
        $match: { "members.userId": { $all: [_id, senderId] } },
      },
      {
        $group: {
          _id: null,
          numCommonGroup: { $count: {} },
        },
      },
      {
        $project: { _id: 0 },
      },
    ]);

    var numCommon = 0;
    for (const numOfGroup of num) {
      if (num.length < 0) {
        numCommon = 0;
      } else {
        numCommon = numOfGroup.numCommonGroup;
        if (numCommon != 0) {
          return (numCommon = numOfGroup.numCommonGroup - 1);
        }
      }
    }
    console.log("numOfGroup", num.length);
    console.log("num" + numCommon);
    return numCommon;
  },
  getNumberCommonFriend: async (_id, senderId) => {
    let listMyFriend = await Friend.aggregate([
      {
        $project: {
          _id: 0,
        },
      },
      {
        $match: {
          "user.userId": _id,
        },
      },
      {
        $unwind: "$user",
      },
      {
        $replaceWith: "$user",
      },
      {
        $match: { userId: { $ne: _id } },
      },
    ]);
    let listFriendSender = await Friend.aggregate([
      {
        $project: {
          _id: 0,
        },
      },
      {
        $match: {
          "user.userId": senderId,
        },
      },
      {
        $unwind: "$user",
      },
      {
        $replaceWith: "$user",
      },
      {
        $match: { userId: { $ne: senderId } },
      },
    ]);
    console.log(listFriendSender);
    var num = 0;

    for (const friend of listMyFriend) {
      for (const friendSender of listFriendSender) {
        if (friend.userId == friendSender.userId) {
          num++;
        }
        console.log("friend id " + friendSender.userId);
      }
    }
    return num;
  },
};

module.exports = MeService;
