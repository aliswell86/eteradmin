
var mongoose = require("mongoose");

var EterItem = mongoose.Schema({
  item_nm:{type:String},
  cost:{type:String},
  item_dtl_dv:{type:String},
  tier:{type:Number},
  dmg:{type:String},
  dfs:{type:String},
  cri:{type:String},
  con:{type:String},
  accuracy_rate:{type:String},
  point_rate:{type:String},
  weight:{type:String},
  speed:{type:String},
  ctype:{type:String},
  stype1:{type:String},
  stype2:{type:String},
  clyn:{type:String},
  order:{type:Number},
  img_src:{type:String},
  illegal:{type:String},
  size:{type:String}
});

var EterItem = mongoose.model("EterItem", EterItem);
module.exports = EterItem;
