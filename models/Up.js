
var mongoose = require("mongoose");

var Up = mongoose.Schema({
  clyn:{type:String},
  up:{type:String},
  upnm:{type:String}
});

var Up = mongoose.model("Up", Up);
module.exports = Up;
