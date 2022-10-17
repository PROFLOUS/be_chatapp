const friendService = require("../services/FriendService");
const MeService = require("../services/CommonService");

class FriendController {
  constructor(io) {
    this.io = io;
    this.acceptFriend = this.acceptFriend.bind(this);
    // this.sendFriendInvite = this.sendFriendInvite.bind(this);
    this.deleteFriend = this.deleteFriend.bind(this);
    // this.deleteFriendInvite = this.deleteFriendInvite.bind(this);
    // this.deleteInviteWasSend = this.deleteInviteWasSend.bind(this);
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
      console.log(listFriend);
    } catch (error) {
      next(error);
    }
  }

  // [POST] /:userId
  async acceptFriend(req, res, next) {
    // const {_id,frenAva,frenLastName,frenFirstNam}=req.body;
    // id friend

    const user = {
      userId: req.body.userId,
      userFistName: req.body.userFistName,
      userLastName: req.body.userLastName,
      avaUser: req.body.avaUser,
    };

    const sender = {
      userId: req.params.userId,
      userFistName: req.body.userFistName2,
      userLastName: req.body.userLastName2,
      avaUser: req.body.avaUser2,
    };

    try {
      const result = await friendService.acceptFriend(user, sender);
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  }

  // [DELETE] /:userId
  async deleteFriend(req, res) {
    var { id = "" } = req.body;
    var { friendId = "" } = req.params;
    try {
      await friendService.deleteFriend(id, friendId);
      // this.io.to(friendId).emit('deleteFriend',_id);
      return res.status(200).json();
    } catch (error) {
      console.log(error);
    }
  }

  //[DELETE]  /invites/:userId
  async deleteFriendInvite(req, res, next) {
    var { id } = req.body;
    var { userId } = req.params;

    try {
      await friendService.deleteFriendInvite(id, userId);
      // this.io.to(userId + '').emit('deleted-friend-invite', _id);

      res.status(204).json();
    } catch (err) {
      next(err);
      console.log(err);
    }
  }
  // [POST] /invites/me/:userId
  async sendFriendInvite(req, res, next) {
    const { id = "" } = req.body;
    console.log("iduser", id);
    const userId = req.params.userId;
    try {
      await friendService.sendFriendInvite(id, userId);

      // const { name, avatar } = await redisDb.get(_id);
      // this.io
      //     .to(userId + '')
      //     .emit('send-friend-invite', { _id, name, avatar });

      res.status(201).json();
    } catch (err) {
      next(err);
      console.log(err);
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
}

module.exports = FriendController;
