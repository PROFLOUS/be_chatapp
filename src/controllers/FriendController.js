const friendService = require('../services/FriendService');

class FriendController {
    constructor(io) {
        this.io=io;
        this.acceptFriend = this.acceptFriend.bind(this);
        this.sendFriendInvite = this.sendFriendInvite.bind(this);
        // this.deleteFriend = this.deleteFriend.bind(this);
        // this.deleteFriendInvite = this.deleteFriendInvite.bind(this);
        // this.deleteInviteWasSend = this.deleteInviteWasSend.bind(this);
    }

    // [GET] /?name
    // async getListFriends(req, res, next) {

    // }

    // [POST] /:userId
    async acceptFriend (req, res, next){
        // const {_id,frenAva,frenLastName,frenFirstNam}=req.body;
        // id friend

        const user ={
            userId:req.body.userId,
            userFistName:req.body.userFistName,
            userLastName:req.body.userLastName,
            avaUser:req.body.avaUser
        }

        const sender ={
            userId:req.params.userId,
            userFistName:req.body.userFistName2,
            userLastName:req.body.userLastName2,
            avaUser:req.body.avaUser2
        }

        try {
            const result = await friendService.acceptFriend(user, sender);
            res.status(201).json(result);

        }catch (e) {
            next(e);
        }
    }

    // send friend invite
    async sendFriendInvite(req, res, next) {
        const { _id } = req;
        const { userId } = req.params;
        try {
            await friendService.sendFriendInvite(_id, userId);

            const { name, avatar } = await redisDb.get(_id);
            this.io
                .to(userId + '')
                .emit('send-friend-invite', { _id, name, avatar });

            res.status(201).json();
        } catch (err) {
            next(err);
        }
    }
    

}

module.exports = FriendController;