const mongoose = require('mongoose');

const {Schema} = mongoose;

const AdpickInfo = new Schema({
  seq: {type:String},
  name: {type:String},
  a_href: {type:String},
  img_src: {type:String},
  tag: {type:String},
  del_yn: {type:String}
});

module.exports = mongoose.model('AdpickInfo', AdpickInfo);
