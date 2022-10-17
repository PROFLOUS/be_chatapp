const ConversationService = require("../services/ConversationService");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const NotFoundError = require("../exception/NotFoundError");
const redisDb = require("../app/redis");
const ObjectId = require("mongodb").ObjectId;
const mongoose = require("mongoose");

class ConversationController {
  constructor(io) {
    this.io = io;
    this.createIndividualConversation =
      this.createIndividualConversation.bind(this);
  }

  // [GET] /:id
  async getOne(req, res, next) {
    const { id } = req.params;
    // const { userId } = req.params;
    const userId = req.query.receiverId;

    var page = 0;
    var size = 20;
    // const {page=0, size=20} = req.query;

    try {
      const conversationService = new ConversationService();
      const conversation = await conversationService.getConversationById(
        id,
        userId,
        parseInt(page),
        parseInt(size)
      );
      res.json(conversation);
    } catch (err) {
      next(err);
    }
  }

  // [GET] /
  async getAll(req, res, next) {
    let userId = req.params.userId;
    // const userId = req.query.userID;
    // console.log("userId");

    // const {page=0, size=20} = req.query;
    var page = 0;
    var size = 20;
    console.log(userId);

    try {
      const conversationService = new ConversationService();
      const conversations = await conversationService.getAllConversation(
        userId,
        parseInt(page),
        parseInt(size)
      );
      res.json(conversations);
    } catch (err) {
      next(err);
    }

    try {
      const conversationService = new ConversationService();
      const conversations = await conversationService.getAllConversation(
        userId
      );
      res.json(conversations);
    } catch (err) {
      next(err);
    }
  }

  // [POST] /individuals/:userId
  async createIndividualConversation(req, res, next) {
    const { userId } = req.params;
    const { userFriendId } = req.body;
    // var myId = JSON.parse(userI);

    // var objectId = mongoose.Types.ObjectId(myId);
    // console.log(objectId);

    // const idSelt = new ObjectId(userId.trim());
    // console.log(typeof idSelt);
    // const idUserFren = new ObjectId(userFriendId);
    // console.log(typeof idUserFren);

    const userSelt = await redisDb.client
      .get("" + userId)
      .then((data) => {
        return JSON.parse(data);
      })
      .catch((err) => {
        console.log(err);
      });
    const userFriend = await redisDb.client
      .get("" + userFriendId)
      .then((data) => {
        return JSON.parse(data);
      })
      .catch((err) => {
        console.log(err);
      });

    // var myId = JSON.parse(userSelt.uid);
    // console.log("id"+_eid);

    // let myid =userSelt.uid;
    // let idd = myid.slice( 0, -4 ) ;
    // const objectId = new  ObjectId(idd);
    // console.log("ob"+objectId);

    // var objectId = mongoose.Types.ObjectId(idd);
    // console.log(objectId);

    // const idUserFren = new ObjectId(userFriend.uid);
    // console.log(typeof idUserFren);

    // console.log(idSelt,idUserFren);

    // console.log( typeof id._id);
    const user1 = {
      userId: userSelt.uid,
      userFistName: userSelt.first_name,
      userLastName: userSelt.last_name,
      avaUser: userSelt.avatar,
    };

    const user2 = {
      userId: userFriend.uid,
      userFistName: userFriend.first_name,
      userLastName: userFriend.last_name,
      avaUser: userFriend.avatar,
    };

    const conversationService = new ConversationService();

    try {
      const rs = await conversationService.createIndividualConversation(
        user1,
        user2
      );
      res.status(201).json(rs);
    } catch (err) {
      res.status(500).json({ message: err.message });
      // console.log(err);
      // next(err);
    }
  }

  async createGroupConversation(req, res, next) {
    const { userO, name = "", userList = [] } = req.body;
    const conversationService = new ConversationService();

    try {
      const rs = await conversationService.createGroupConversation(
        userO,
        name,
        userList
      );
      res.status(201).json(rs);
    } catch (err) {
      next(err);
    }
  }

  async getMembers(req, res, next) {
    const { id } = req.params;
    const conversationService = new ConversationService();

    try {
      const members = await conversationService.getMembers(id);
      res.json(members);
    } catch (err) {
      next(err);
    }
  }

  async addMembers(req, res, next) {
    const { id } = req.params;
    const { members = [], userId } = req.body;
    console.log(members);

    const conversationService = new ConversationService();

    try {
      const rs = await conversationService.addMembers(id, members, userId);
      res.json(rs);
    } catch (err) {
      next(err);
    }
  }

  async deleteMembers(req, res, next) {
    const { id, memberId } = req.params;
    const { userId } = req.body;

    const conversationService = new ConversationService();

    try {
      const rs = await conversationService.deleteMembers(id, memberId, userId);
      res.json(rs);
    } catch (err) {
      next(err);
    }
  }

  async leaveGroup(req, res, next) {
    const { id } = req.params;
    const { userId } = req.body;

    const conversationService = new ConversationService();

    try {
      const rs = await conversationService.leaveGroup(id, userId);
      res.json(rs);
    } catch (err) {
      next(err);
    }
  }

  async deleteGroup(req, res, next) {
    const { id } = req.params;
    console.log(id);

    const conversationService = new ConversationService();

    try {
      const rs = await conversationService.deleteGroup(id);
      res.json(rs);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ConversationController;
