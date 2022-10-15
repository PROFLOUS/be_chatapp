var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const stickerSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  qty: {
    type: Number,
    required: true
  },
  sticker_elements: {
    type: [String],
    default: []
  },
  isDowload: {
    type: Boolean,
    default: false
  },
  userId: {
    type: ObjectId,
    required: true
  }
});

module.exports = mongoose.model('Sticker', stickerSchema);