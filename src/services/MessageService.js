const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const MyError = require("../exception/MyError");

const commonUtils = require("../utils/commonUtils");
const Member = require("../models/Member");
const awsS3Service = require("../services/awsS3Service");
const MessageService = {
  //get list messages of conversationId
  // getList:async(conversationId,userId,page,size)=>{
  //     if (!conversationId || !userId || !size || page < 0 || size <= 0)
  //         throw new ArgumentError();

  //     const conversation = await Conversation.getByIdAndUserId(
  //         conversationId,
  //         userId
  //     );
  //     //tong so message
  //     const totalMessages =
  //         await Message.countDocumentsByConversationIdAndUserId(
  //             conversationId,
  //             userId
  //         );
  //     //phan trang
  //     const { skip, limit, totalPages } = commonUtils.getPagination(
  //         page,
  //         size,
  //         totalMessages
  //     );
  //     //lay danh sach message
  //     let messages;

  //     //neu conversation la group
  //     if (conversation.type) {
  //         const messagesTempt =
  //             await Message.getListByConversationIdAndUserIdOfGroup(
  //                 conversationId,
  //                 userId,
  //                 skip,
  //                 limit
  //             );

  //         messages = messagesTempt.map((messageEle) =>
  //             messageUtils.convertMessageOfGroup(messageEle)
  //         );

  //     } else {
  //         const messagesTempt =
  //             await Message.getListByConversationIdAndUserIdOfIndividual(
  //                 conversationId,
  //                 userId,
  //                 skip,
  //                 limit
  //             );
  //         messages = messagesTempt.map((messageEle) =>
  //             messageUtils.convertMessageOfIndividual(messageEle)
  //         );
  //     }

  //     // await lastViewService.updateLastViewOfConversation(
  //     //     conversationId,
  //     //     userId
  //     // );

  //     return {
  //         data: messages,
  //         page,
  //         size,
  //         totalPages,
  //     };

  // },

  // send text
  addText: async (message, userId) => {
    const { conversationId, content } = message;
    const newMessage = new Message({
      userId,
      content,
      conversationId,
      ...message,
    });

    const saveMessage = await newMessage.save();

    // cap nhat conversation khi co tin nhan moi
    return MessageService.updateWhenHasNewMessage(
      saveMessage,
      conversationId,
      userId
    );
  },

  // send file
  addFile: async (file, type, conversationId, userId) => {
    // upload ảnh
    const content = await awsS3Service.uploadFile(file);

    console.log("content" + content);

    const newMessageTmp = {
      userId,
      content,
      type,
      conversationId,
    };

    const newMessage = new Message({
      ...newMessageTmp,
    });

    // lưu
    const saveMessage = await newMessage.save();

    return MessageService.updateWhenHasNewMessage(
      saveMessage,
      conversationId,
      userId
    );
  },

  // update conversation when has new message
  updateWhenHasNewMessage: async (saveMessage, conversationId, userId) => {
    const { _id } = saveMessage;

    await Conversation.updateOne(
      { _id: conversationId },
      { lastMessageId: _id }
    );

    await Member.updateOne(
      { conversationId, userId },
      { $set: { lastView: new Date() } }
    );
    // const member = await Member.findOne({conversationId, userId});
    //     const { lastView, isNotify } = member;
    //     const countUnread = await Message.countUnread(lastView, conversationId);
    //     await member.updateOne({ $set: { numberUnread: countUnread } });

    return await Message.findById(_id);
  },
  //addReacts
  addReact: async (req) => {
    const { messId, icon, userId, imgUser, nameUser } = req.body;
    Message.findById(messId, function (err, messages) {
      let array = messages.reacts;
      let checkReact = false;
      let checkUser = false;
      array.forEach((element) => {
        if (element.userId == userId) {
          let arrayReact = element.react;
          arrayReact.forEach((elementReact) => {
            if (elementReact.name == icon) {
              elementReact.quantity = elementReact.quantity + 1;
              checkReact = true;
            }
          });
          if (checkReact == false) {
            arrayReact.push({ name: icon, quantity: 1 });
          }
          checkUser = true;
        }
      });
      if (checkUser == false) {
        array.push({
          react: [{ name: icon, quantity: 1 }],
          userId: userId,
          imgUser: imgUser,
          nameUser: nameUser,
        });
      }
      console.log(array);
      Message.findByIdAndUpdate(
        messId,
        { reacts: array },
        { new: true },
        function (err, messages) {
          console.log("Cập nhật thành công!");
        }
      );
    });
  },

  //deleteReacts
  deleteReact: async (req) => {
    const { messId, userId } = req.body;
    Message.findByIdAndUpdate(
      messId,
      { $pull: { reacts: { userId: userId } } },
      function (err, messages) {
        console.log("Xóa thành công");
      }
    );
  },

  //getReacts
  getReact: async (req, res) => {
    const messId = req.params.idMessage;
    Message.findById(messId, function (err, messages) {
      res.json(messages.reacts);
    });
  },

  //thu hoi tin nhan
  reMessage: async (req, res) => {
    const { idMessage } = req.body;
    Message.findByIdAndUpdate(
      idMessage,
      { isDeleted: true },
      { new: true },
      function (err, messages) {
        console.log("Cập nhật thành công!");
      }
    );
  },

  //xoa tin nhan
  deleteMessage: async (req, res) => {
    const { idMessage, userId } = req.body;
    Message.findByIdAndUpdate(
      idMessage,
      { $push: { deletedByUserIds: userId } },
      { new: true },
      function (err, messages) {
        console.log("Cập nhật thành công!");
      }
    );
  },

  //lay tin nhan theo loai
  getMessageByType: async (req, res) => {
    const type = req.params.typeMessage;
    const conversationId = req.params.conversationId;
    Message.find(
      { type: type, conversationID: conversationId },
      function (err, messages) {
        res.json(messages);
      }
    );
  },
};

module.exports = MessageService;
