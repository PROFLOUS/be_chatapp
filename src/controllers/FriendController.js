const friendService = require("../services/FriendService");

class FriendController {
  constructor(io) {
    this.io = io;
    this.acceptFriend = this.acceptFriend.bind(this);
    // this.sendFriendInvite = this.sendFriendInvite.bind(this);
    this.deleteFriend = this.deleteFriend.bind(this);
    // this.deleteFriendInvite = this.deleteFriendInvite.bind(this);
    // this.deleteInviteWasSend = this.deleteInviteWasSend.bind(this);
  }

  // [GET] /list
  async getListFriends(req, res, next) {
    const id = req.body;
    const { name = "" } = req.query;
    try {
      const friends = await friendService.getList(id, name);
      const listFriend = [];
      for (const friend of friends) {
        const fiendResult = { ...friend };

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
    var _id = req.body.id;
    var friendId = req.params.userId;
    try {
      await friendService.deleteFriend(_id, friendId);
      // this.io.to(friendId).emit('deleteFriend',_id);
      return res.status(200).json();
    } catch (error) {
      console.log(error);
    }
  }

  //[DELETE]  /invites/:userId
  async deleteFriendInvite(req, res, next) {
    var _id = req.body;
    var userId = req.params.userId;

    try {
      await friendService.deleteFriendInvite(_id, userId);
      // this.io.to(userId + '').emit('deleted-friend-invite', _id);

      res.status(204).json();
    } catch (err) {
      next(err);
      console.log(err);
    }
  }
  // [POST] /invites/me/:userId
  async sendFriendInvite(req, res, next) {
    const _id = req.body.id;
    const userId = req.params.userId;
    try {
      await friendService.sendFriendInvite(_id, userId);

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
    const _id = req.body;
    try {
      const friendInvite = await friendService.getListInvite(_id);
      res.json(friendInvite);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = FriendController;
