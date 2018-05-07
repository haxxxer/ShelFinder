const mongoose = require('mongoose');
const {Schema} = mongoose;


const BeaconSchema = new Schema({
  uuid: {type: String, required: true},
  loc: {type: String},
  topic: {type: String, required: true},
  color: {type: String, required: true},
  imgUrl: {type: String, required: true}
});

const Beacon = mongoose.model('Beacon', BeaconSchema);
module.exports = {Beacon}