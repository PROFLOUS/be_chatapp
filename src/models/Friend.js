const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const friendSchema = new Schema({
  user: [
    {
      userId: {
        type: String,

        required: true,
      },
      userFistName: {
        type: String,
        required: true,
      },
      userLastName: {
        type: String,
        required: true,
      },
      avaUser: {
        type: String,
        //required: true,
      },
    },
  ],
});

//find isExists two userId
friendSchema.statics.existsByIds = async (userId1, userId2) => {
  const isExists = await Friend.findOne({
    "user.userId": { $all: [userId1, userId2] },
  });
  if (isExists) return true;
  return false;
};

//check userId
friendSchema.statics.checkByIds = async (
  userId1,
  userId2,
  message = "Friend"
) => {
  const isExists = await Friend.findOne({
    "user.userId": { $all: [userId1, userId2] },
  });

  if (!isExists) throw new Error();
};

friendSchema.statics.deleteByIds = async (
  userId1,
  userId2,
  message = "Friend"
) => {
  const rs = await Friend.deleteOne({
    "user.userId": { $all: [userId1, userId2] },
  });

  const { deletedCount } = rs;
  if (deletedCount === 0) throw new NotFoundError(message);
};

const Friend = mongoose.model("Friend", friendSchema);

module.exports = Friend;
