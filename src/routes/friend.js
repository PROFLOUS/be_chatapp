const router = require("express").Router();
const FriendController = require("../controllers/FriendController");

const friendRouter = (io) => {
  const friendController = new FriendController(io);
  // get list friends
  router.get("/list/:userId", friendController.getListFriends);
  // search list friends
  router.get("/search/:userId", friendController.searchFriends);
  // accept friend request
  router.post("/:userId", friendController.acceptFriend);
  // delete friend
  router.delete("/:userId", friendController.deleteFriend);
  // // list invites to me
  router.get("/invites/:userId", friendController.getListFriendInvites);
  // //delete invite
  router.delete("/deleteInvite/:userId", friendController.deleteFriendInvite);
  // // list invites from me
  // router.get('/invites/me', friendController.getListFriendInvitesWasSend);
  // // send friend invite
  router.post("/invites/me/:userId", friendController.sendFriendInvite);
  // // list friends offer
  // router.get('/suggest', friendController.getSuggestFriends);
  router.get("/check",friendController.checkStatus);

  return router;
};

// router.post('/:userId', FriendController.acceptFriend);

module.exports = friendRouter;
