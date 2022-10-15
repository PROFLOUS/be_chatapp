const router = require('express').Router();
const FriendController = require('../controllers/FriendController');

const friendRouter = (io) => {
    const friendController = new FriendController(io);
    // list friends
    router.get('/list', friendController.getListFriends);
    // accept friend request
    router.post('/:userId', friendController.acceptFriend);
    // delete friend
     router.delete('/:userId', friendController.deleteFriend);
    // // list invites to me
     router.get('/invites', friendController.getListFriendInvites);
    // //delete invite
     router.delete('/invites/:userId', friendController.deleteFriendInvite);
    // // list invites from me 
    // router.get('/invites/me', friendController.getListFriendInvitesWasSend);
    // // send friend invite
     router.post('/invites/me/:userId', friendController.sendFriendInvite);
    // // list friends offer
    // router.get('/suggest', friendController.getSuggestFriends);

    return router;
}

// router.post('/:userId', FriendController.acceptFriend);

module.exports = friendRouter;