
var express = require("express");
var router = express.Router();
var mongoose   = require("mongoose");
var EterItem = require("../models/EterItem.js");
var Up = require("../models/Up.js");

router.get("/", function(req, res) {
  res.render("custom/index");
});

router.post("/selectitem", function(req, res) {
  var in_list = get_in_list(req);
  var out_result = {};
  var out_list = [];
  var out_obj = {};
  var cl_upnm = ["[CL]","[CL] +1","[CL] +2","[CL] +3","[CL] +4","[CL] +5","[CL] +6","[CL] +7","[CL] +8","[CL] +9","[CL-MAX]","[CL-MAX] +1","[CL-MAX] +2","[CL-MAX] +3","[CL-MAX] +4","[CL-MAX] +5","[CL-MAX] +6","[CL-MAX] +7","[CL-MAX] +8","[CL-MAX] +9"];

  EterItem.find({$and:in_list}).sort("order").sort("tier").exec(
    function(err, db_list){
      if(err) return res.json(err);
      var upnm = "";
      for(var i in db_list) {
        out_obj = db_list[i];
        out_obj.dmg = calcWp(db_list[i].dmg,req.body.max_dv,req.body.up_dv);
        out_obj.item_nm = cl_upnm[req.body.max_dv] + db_list[i].item_nm.substr(db_list[i].item_nm.indexOf("[CL]")+4);
        out_list.push(out_obj);
      }
      out_result.db_list = out_list;
      out_result.ctype = req.body.ctype;
      res.json(out_result);
    }
  );
});

router.post("/getspecinfo", function(req, res) {
  var dmg = Number(req.body.dmg);
  var stat = Number(req.body.stat);
  var item_dmg = Number(req.body.item_dmg);
  var default_inven_dmg = Math.floor(dmg+dmg*(stat/100)+stat);
  var item_inven_dmg = (default_inven_dmg/100)*item_dmg;
  var inven_dmg = Math.floor(default_inven_dmg + item_inven_dmg);
  // console.log("default_inven_dmg : " + default_inven_dmg);
  // console.log("item_inven_dmg : " + item_inven_dmg);
  // console.log("dmg : " + dmg + "\nstat : " + stat + "\nitem_dmg : " + item_dmg);

  console.log("inven_dmg : " + inven_dmg);
  res.json([]);
});

module.exports = router;

var get_in_list = function(req) {
  var in_obj = {};
  var in_obj1 = {};
  var in_obj2 = {};
  var in_obj3 = {};
  var in_list = [];

  if(req.body.ctype == "1") {
    in_obj.clyn = "Y";
    in_obj.ctype = req.body.ctype;
    in_list.push(in_obj);
    if(req.body.item_dv1==3 || req.body.item_dv1==4) {

      if(req.body.item_dv1==3) req.body.item_dv1=1;
      else req.body.item_dv1=2;

      in_obj2.illegal="Y";
      in_list.push(in_obj2);
    }
    in_obj1.stype1 = req.body.item_dv1;
    in_list.push(in_obj1);

    if(req.body.item_dv4.length != '0') {
      in_obj3.tier = req.body.item_dv4;
      in_list.push(in_obj3);
    }
  }
  console.log(in_list);
  return in_list;
};

var calcWp = function(item_val,max_dv,up_dv) {
  var up_rate = [0,1,2,3,4,5,6,7,8,9,1,1,1,3,3,3,6,6,6,10];
  var dmg = 0;
  var calc_num = Number(item_val);
  var result_num = Number(item_val);

  for(var i in up_rate) {
    calc_num = (calc_num/100*up_rate[i]) + calc_num;
    result_num = Math.round(calc_num);
    if(max_dv == i) break;
  }

  if(up_dv==1) dmg = Math.floor(result_num);
  if(up_dv==2) dmg = Math.floor(result_num*1.1);
  if(up_dv==3) dmg = Math.floor(result_num*1.3);
  if(up_dv==4) dmg = Math.floor(result_num*1.5);
  if(up_dv==5) dmg = Math.floor(result_num*2);
  if(up_dv==6) dmg = Math.floor(result_num*3);
  if(up_dv==7) dmg = Math.floor(result_num*4);

  return dmg;
};

var getupnm = function(clyn,up) {
  var upnm = "";
  Up.find().sort("upnm").exec(function(err,result) {
    for(var i in result) {
      console.log(result[i].upnm);
    }
  });

};
