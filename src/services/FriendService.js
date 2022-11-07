const Friend = require("../models/Friend");
const FriendReq = require("../models/FriendRequest");
const ConversationService = require("./ConversationService");
const Conversation = require("../models/Conversation");
const MyError = require("../exception/MyError");
const { findOneAndDelete } = require("../models/Friend");
const MeService = require("./CommonService");
const ObjectId = require("mongoose").Types.ObjectId;
const FirebaseService = require("./FirebaseService");

const FriendService = {
  searchFriend: async (_id, name) => {
    // console.log("userid", _id);
    const friend = await Friend.aggregate([
      { $match: { $text: { $search: name }, "user.userId": { $in: [_id] } } },
      {
        $unwind: "$user",
      },
      {
        $replaceWith: "$user",
      },
      {
        $match: { userId: { $ne: _id } },
      },
      {
        $project: {
          _id: 0,
        },
      },
    ]);
    return friend;
  },

  getList: async (_id) => {
    const friend = await Friend.aggregate([
      {
        $project: {
          _id: 0,
          "user.userId": 1,
          "user.userLastName": 1,
          "user.userFistName": 1,
          "user.avaUser": 1,
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
    return friend;
  },
  deleteFriend: async (_id, friendId) => {
    await Friend.deleteByIds(_id, friendId);
  },

  acceptFriend: async (user, sender) => {
    //check co ton tai loi moi
    // await FriendReq.checkByIds(senderId, _id);

    // check đã là bạn
    // if (await Friend.existsByIds(_id, senderId))
    //     throw new MyError('Friend exists');

    // delete xoa loi moi
    await FriendReq.deleteByIds(sender.userId, user.userId);

    // add friend
    const friend = new Friend({
      user: [user, sender],
    });
    await friend.save();

    const conversationService = new ConversationService();
    return await conversationService.createIndividualConversationWhenWasFriend(
      user,
      sender
    );
  },
  deleteFriendInvite: async (_id, senderId) => {
    await FriendReq.deleteByIds(senderId, _id);
  },

  sendFriendInvite: async (_id, userId) => {
    // check da la ban be ?
    if (await Friend.existsByIds(_id, userId))
      throw new MyError("Friend exists");

    // check không có lời mời nào
    if (
      (await FriendReq.existsByIds(_id, userId)) ||
      (await FriendReq.existsByIds(userId, _id))
    )
      throw new MyError("Invite exists");

    const friendRequest = new FriendReq({
      senderId: _id,
      receiverId: userId,
    });

    await friendRequest.save();
  },
  async getNumberCommonGroup(_id, senderId) {
    const num = await Conversation.aggregate([
      {
        $match: {
          "members.userId": { $all: [_id, senderId] },
        },
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
    console.log(num);
    return num;
  },
  getNumberCommonFriend: async (_id, senderId) => {
    let listMyFriend = await this.getList(_id);
    let listFriendSender = await this.getList(senderId);
    var num = 0;

    for (const friend of listMyFriend) {
      for (const friendSender of listFriendSender) {
        if (friend.userId == friendSender.userId) {
          num++;
        }
      }
    }
    return num;
  },

  getListInvite: async (_id) => {
    const listInviteId = await FriendReq.aggregate([
      {
        $match: { receiverId: _id },
      },
      { $project: { _id: 0, senderId: 1 } },
    ]);

    

    const listInviteResult = [];
    var invite = null;
    for (const listInvite of listInviteId) {
      var inviteId = listInvite.senderId;
      const array = await FirebaseService.getById(listInvite.senderId).then(
        (result) => {
          return { ...result };
        }
      );

      const idConver = await Conversation.findOne(
        {
          "members.userId":{$all:[_id,inviteId]},
          "type":false,
        },
        {
          _id: 1,
        }
      )
      console.log("idd", idConver);
      console.log("usreFirebase", _id,inviteId);
      // var numCommonGroup =0;
      //var numGroup = await MeService.getNumberCommonGroup(_id,inId)
      invite = {
        //  inviteId.senderId,
        inviteId,
        ...array,
        numCommonGroup: await MeService.getNumberCommonGroup(_id, inviteId),

        numCommonFriend: await MeService.getNumberCommonFriend(
          _id,
          listInvite.senderId
        ),
        idConver: idConver
      };



      listInviteResult.push(invite);
      console.log("senderID" + listInvite.senderId);
    }
    return listInviteResult;
  },

  checkStatus: async (userId, friendId) => {
    const friend = await Friend.existsByIds(userId, friendId);
    const friendReq = await FriendReq.existsByIds(userId, friendId);

    console.log(friendReq, friend);

    if (friend) return "friend";
    if (friendReq) return friendReq;
    return "none";

    // return { friend, friendReq };
  }



};

module.exports = FriendService;
