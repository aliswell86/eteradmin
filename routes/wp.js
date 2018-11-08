
var express = require("express");
var router = express.Router();
var mongoose   = require("mongoose");
var EterItem = require("../models/EterItem.js");
var utils  = require("../utils");

router.get("/", function(req, res) {
  res.render("wp/index");
});

router.post("/getitemdblist", function(req, res) {
  var in_list = get_in_list(req);

  EterItem.find({$and:in_list}).sort("order").sort("tier").exec(
    function(err, db_list){
      if(err) return res.json(err);
      res.json(db_list);
    }
  );
});

router.post("/getitemdbdtl", function(req, res) {
  var item_nm = req.body.item_nm;
  var result_list = [];
  var result_obj = {};
  var up_list = [];

  EterItem.find({item_nm:item_nm}).exec(
    function(err, db_list) {
      if(err) return res.json(err);

      var item_val = "";
      for(var i in db_list) {
        if(db_list[i].ctype == "1" || db_list[i].ctype == "3") item_val = db_list[i].dmg;
        else if(db_list[i].ctype == "2") item_val = db_list[i].dfs;
        result_obj.item_nm = db_list[i].item_nm;
        result_obj.img_src = db_list[i].img_src;
        result_obj.up_list = utils.calcWp(item_val);
        result_list.push(result_obj);
      }

      res.json(result_list);
    }
  );
});

module.exports = router;

var get_in_list = function(req) {
  var in_obj = {};
  var in_obj1 = {};
  var in_obj2 = {};
  var in_obj3 = {}; //등급
  var in_obj4 = {}; //불무여부
  var in_list = [];

  if(req.body.item_dv==1) {
    in_obj.clyn = req.body.clyn;
    in_obj.ctype = req.body.item_dv;
    in_list.push(in_obj);

    if(req.body.item_dv1==3 || req.body.item_dv1==4) {
      if(req.body.item_dv1==3) req.body.item_dv1=1;
      else req.body.item_dv1=2;
      in_obj4.illegal="Y";
      in_list.push(in_obj4);
    }
    in_obj1.stype1 = req.body.item_dv1;
    in_list.push(in_obj1);
  }else if(req.body.item_dv==2) {
    in_obj.clyn = req.body.clyn;
    in_obj.ctype = req.body.item_dv;
    in_list.push(in_obj);

    if(req.body.item_dv2.length != '0') {
      in_obj1.stype1 = req.body.item_dv2;
      in_list.push(in_obj1);
    }
    in_obj2.stype2 = req.body.item_dv3;
    in_list.push(in_obj2);
  }else if(req.body.item_dv==3 || req.body.item_dv==4) {
    in_obj.clyn = req.body.clyn;
    in_obj.ctype = req.body.item_dv;
    in_list.push(in_obj);

    in_obj2.stype2 = req.body.item_dv3;
    in_list.push(in_obj2);
  }else{
    in_obj.ctype = req.body.item_dv;
    in_list.push(in_obj);
  }

  if(req.body.item_dv4.length != '0') {
    in_obj3.tier = req.body.item_dv4;
    in_list.push(in_obj3);
  }
  console.log(in_list);
  return in_list;
};
