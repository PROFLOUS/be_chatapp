const friendService = require("../services/FriendService");
const MeService = require("../services/CommonService");
const FirebaseService = require("../services/FirebaseService");

class FriendController {
  constructor(io) {
    this.io = io;
    this.acceptFriend = this.acceptFriend.bind(this);
    this.sendFriendInvite = this.sendFriendInvite.bind(this);
    this.deleteFriend = this.deleteFriend.bind(this);
    this.deleteFriendInvite = this.deleteFriendInvite.bind(this);
    //this.deleteInviteWasSend = this.deleteInviteWasSend.bind(this);
  }

  // [GET] /list/:userId
  async searchFriends(req, res, next) {
    const { userId } = req.params;
    const { name = "" } = req.query;
    console.log("id", userId);
    try {
      const friends = await friendService.searchFriend(userId, name);
      const listFriend = [];
      for (const friend of friends) {
        const fiendResult = {
          ...friend,
          numCommonGroup: await MeService.getNumberCommonGroup(
            userId,
            friend.userId
          ),

          numCommonFriend: await MeService.getNumberCommonFriend(
            userId,
            friend.userId
          ),
        };

        listFriend.push(fiendResult);
        console.log("friend :" + fiendResult.userId);
      }
      res.json(listFriend);
      //res.end();
      console.log(listFriend);
    } catch (error) {
      next(error);
    }
  }

  async getListFriends(req, res, next) {
    const { userId } = req.params;
    console.log("id", userId);
    try {
      const friends = await friendService.getList(userId);
      const listFriend = [];
      for (const friend of friends) {
        const fiendResult = {
          ...friend,
          numCommonGroup: await MeService.getNumberCommonGroup(
            userId,
            friend.userId
          ),

          numCommonFriend: await MeService.getNumberCommonFriend(
            userId,
            friend.userId
          ),
        };

        listFriend.push(fiendResult);
        console.log("friend :" + fiendResult.userId);
      }
      res.json(listFriend);
      res.end();
      console.log(listFriend);
    } catch (error) {
      next(error);
    }
  }

  // [POST] /:userId
  async acceptFriend(req, res, next) {
    //senderId
    const { userId } = req.params;
    //receviceId
    const { id } = req.body;
    const user = await FirebaseService.getById(id).then((result) => {
      return { ...result, userId: id };
    });
    console.log("user: ", user);
    const sender = await FirebaseService.getById(userId).then((result) => {
      return { ...result, userId: userId };
    });

    try {
      // reurn conversationId, message
      const result = await friendService.acceptFriend(user, sender);
      const { conversationId, message } = result;

      this.io.to(sender.userId).emit("acceptFriend", user);

      //send to senderUser , receviceUser, conversation
      this.io
        .to(userId)
        .to(id)
        .to(conversationId)
        .emit(" create-conversation-was-friend", conversationId, message);
      // this.io.to(conversationId).emit("get-message", {message});

      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  }

  // [DELETE] /:userId
  async deleteFriend(req, res) {
    var { id = "" } = req.body;
    var { userId = "" } = req.params;
    try {
      await friendService.deleteFriend(id, userId);
      this.io.to(userId).emit("delete-friend", id);
      return res.status(200).json();
    } catch (error) {
      console.log(error);
    }
  }

  //[DELETE]  /invites/:userId
  async deleteFriendInvite(req, res, next) {
    var { id } = req.body;

    //user invite
    var { userId } = req.params;

    try {
      await friendService.deleteFriendInvite(id, userId);

      //send idUser delete invite to invite user
      this.io.to(userId).emit("deleted-invite", id);

      res.status(204).json();
    } catch (err) {
      next(err);
      console.log(err);
    }
  }
  // [POST] /invites/me/:userId
  async sendFriendInvite(req, res, next) {
    //user sender invite
    const { id = "" } = req.body;
    console.log("iduser", id);

    //user receive
    const userId = req.params.userId;

    //infUser sender
    const user = await FirebaseService.getById(id).then((result) => {
      return { ...result, userId: id };
    });
    try {
      await friendService.sendFriendInvite(id, userId);
      ///them cai coi
      //send InfUser sender {firstName,lastName,avatar,id} to user recevice
      this.io.to(userId).emit("send-friend-invite", user);

      res.status(201).json();
    } catch (err) {
      // next(err);
      res.status(201).json({
        message:"Friend IsExits"
      });
    }
  }
  async getListFriendInvites(req, res, next) {
    const { userId } = req.params;
    try {
      const friendInvite = await friendService.getListInvite(userId);
      res.json(friendInvite);
    } catch (error) {
      next(error);
    }
  }

  async checkStatus(req,res,next){
    const {userId,friendId} = req.query;
    try {
      const friendInvite = await friendService.checkStatus(userId,friendId);
      res.json(friendInvite);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = FriendController;
