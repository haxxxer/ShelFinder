const mongoose = require('mongoose');
const {Schema} = mongoose;


const BookSchema = new Schema({
  title: {type: String, required: true},
  imgUrl: {type:String, required: true},
  author: {type: String, required: true},
  ISBN: {type: String, required: true},
  shelfNo: {type: Number, required: true},
  beaconID:  {type: String}
})

const Book = mongoose.model('Book', BookSchema);
module.exports = {Book}