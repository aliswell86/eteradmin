var express = require("express");
var request = require("request");
var cheerio = require("cheerio");
var Iconv  = require('iconv').Iconv;
var iconv = new Iconv('euc-kr', 'utf-8//translit//ignore');
var utils  = require("../utils");
var mongoose   = require("mongoose");
var EterItem = require("../models/EterItem.js");
var CacheBox = require("../models/CacheBox.js");
var AdpickInfo = require("../models/AdpickInfo.js");
var Up = require("../models/Up.js");
var CSV = require("comma-separated-values");
var multer = require("multer");
var fs = require("fs");
var router = express.Router();
var list_ary = [];
var order = 0;
var storage = multer.diskStorage({
  destination : function(req, file, cb) {
    cb(null, "./temp");
  },
  filename : function(req, file, cb) {
    require("date-utils");
    var date = new Date();
    var curr_dt = date.toFormat("YYYYMMDDHH24MISS");
    var ext = file.originalname.substr(file.originalname.indexOf("."), file.originalname.length);

    cb(null, curr_dt + ext);
  }
});
var upload = multer({storage : storage});

router.get("/", function(req, res) {
  var ip = getUserIP(req);
  console.log("ip : " + ip);

  res.render("admin/index");
});

router.get("/admin/:id", function(req, res){
  console.log(req.params.id);
  console.log(String(req.params.id));
  EterItem.findOne({_id:String(req.params.id)}) // 3
  .populate("author")               // 3
  .exec(function(err, item){        // 3
   if(err) return res.json(err);
   console.log(item);
   res.render("admin/index");

  });
});

router.post("/setexcelupdate", upload.array("filenm"), function(req, res){
  var files = req.files;
  console.log(req.body.excel_flag);

  for(var i in files) {
    var stat_hist = [];
    var stat_hist_obj = {};
    var file = files[i];
    var buf = fs.readFileSync(file.destination + "/" + file.filename);
    var txt = iconv.convert(buf).toString("utf-8");
    var csv  = new CSV(txt, {header:false});
    var records = csv.parse();
    records.shift(); //한행(제목) 건너뛰기

    for(var j in records) {
      var file_ctt = records[j];
      var file_ctt_obj = {};
      file_ctt_obj.item_nm = file_ctt[0];
      file_ctt_obj.cost = file_ctt[1];
      file_ctt_obj.item_dtl_dv = file_ctt[2];
      file_ctt_obj.tier = file_ctt[3];
      file_ctt_obj.dmg = file_ctt[4];
      file_ctt_obj.dfs = file_ctt[5];
      file_ctt_obj.cri = file_ctt[6];
      file_ctt_obj.con = file_ctt[7];
      file_ctt_obj.accuracy_rate = file_ctt[8];
      file_ctt_obj.point_rate = file_ctt[9];
      file_ctt_obj.weight = file_ctt[10];
      file_ctt_obj.speed = file_ctt[11];
      file_ctt_obj.ctype = file_ctt[12];
      file_ctt_obj.stype1 = file_ctt[13];
      file_ctt_obj.stype2 = file_ctt[14];
      file_ctt_obj.clyn = file_ctt[15];
      file_ctt_obj.order = file_ctt[16];
      file_ctt_obj.img_src = file_ctt[17];
      file_ctt_obj.illegal = file_ctt[18];
      file_ctt_obj.size = file_ctt[19];

      if(req.body.excel_flag == "1") {
        EterItem.create(file_ctt_obj);
      }else if(req.body.excel_flag == "2") {
        file_ctt_obj._id = file_ctt[20]; //update 기준값
        EterItem.findOneAndUpdate({_id:file_ctt_obj._id}, file_ctt_obj, function (err, item) {
          if(err) console.log(err);
          console.log(item);
        });
      }
    }
  }

  res.render("admin/index");
});

router.post("/set_update", async (req, res) => {
  console.log("set_update");
  const eterItem = await EterItem.remove({"ctype":"11"}).exec();
  console.log(eterItem);
  // var ary = [
  //   {
  //     "packageCode": "7",
  //     "packageName": "[CL] 불법무기(근거리) 랜덤",
  //     "cost": "130000",
  //     "imgSrc": "/resource/img/box/BOX041.gif",
  //     "itemInfo": [
  //       {"luck":{"luck":"12.00","min":"0","max":"0"},"seq":"1","imgSrc":"/resource/img/CB001.gif","itemName":"[CL] ChainSaw Edge(Critical)","itemDesc":"[CL] ChainSaw Edge(Critical)","trscYn":"Y"},
  //       {"luck":{"luck":"12.00","min":"0","max":"0"},"seq":"2","imgSrc":"/resource/img/CB002.gif","itemName":"[CL] Armament Axe","itemDesc":"[CL] Armament Axe","trscYn":"Y"},
  //       {"luck":{"luck":"12.00","min":"0","max":"0"},"seq":"3","imgSrc":"/resource/img/CB003.gif","itemName":"[CL] Pinkie Hammer Head","itemDesc":"[CL] Pinkie Hammer Head","trscYn":"Y"},
  //       {"luck":{"luck":"12.00","min":"0","max":"0"},"seq":"4","imgSrc":"/resource/img/CB004.gif","itemName":"[CL] Axis T halberd","itemDesc":"[CL] Axis T halberd","trscYn":"Y"},
  //       {"luck":{"luck":"12.00","min":"0","max":"0"},"seq":"5","imgSrc":"/resource/img/CB005.gif","itemName":"[CL] 암영(暗影)","itemDesc":"[CL] 암영(暗影)","trscYn":"Y"},
  //       {"luck":{"luck":"5.00","min":"0","max":"0"},"seq":"6","imgSrc":"/resource/img/CB006.gif","itemName":"[CL] Deathly Blade Ignition","itemDesc":"[CL] Deathly Blade Ignition","trscYn":"Y"},
  //       {"luck":{"luck":"5.00","min":"0","max":"0"},"seq":"7","imgSrc":"/resource/img/CB007.gif","itemName":"[CL] Western Blade","itemDesc":"[CL] Western Blade","trscYn":"Y"},
  //       {"luck":{"luck":"5.00","min":"0","max":"0"},"seq":"8","imgSrc":"/resource/img/CB008.gif","itemName":"[CL] Giga Metal HeavyAxe","itemDesc":"[CL] Giga Metal HeavyAxe","trscYn":"Y"},
  //       {"luck":{"luck":"5.00","min":"0","max":"0"},"seq":"9","imgSrc":"/resource/img/CB009.gif","itemName":"[CL] Hammer Head","itemDesc":"[CL] Hammer Head","trscYn":"Y"},
  //       {"luck":{"luck":"5.00","min":"0","max":"0"},"seq":"10","imgSrc":"/resource/img/CB010.gif","itemName":"[CL] Moon scythe","itemDesc":"[CL] Moon scythe","trscYn":"Y"},
  //       {"luck":{"luck":"5.00","min":"0","max":"0"},"seq":"11","imgSrc":"/resource/img/CB011.gif","itemName":"[CL] Gungnir","itemDesc":"[CL] Gungnir","trscYn":"Y"},
  //       {"luck":{"luck":"1.66","min":"0","max":"0"},"seq":"12","imgSrc":"/resource/img/CB012.gif","itemName":"[CL] Lightning Sword","itemDesc":"[CL] Lightning Sword","trscYn":"Y"},
  //       {"luck":{"luck":"1.66","min":"0","max":"0"},"seq":"13","imgSrc":"/resource/img/CB013.gif","itemName":"[CL] Brilliance Edge","itemDesc":"[CL] Brilliance Edge","trscYn":"Y"},
  //       {"luck":{"luck":"1.67","min":"0","max":"0"},"seq":"14","imgSrc":"/resource/img/CB014.gif","itemName":"[CL] Photon Axe","itemDesc":"[CL] Photon Axe","trscYn":"Y"},
  //       {"luck":{"luck":"1.67","min":"0","max":"0"},"seq":"15","imgSrc":"/resource/img/CB015.gif","itemName":"[CL] Bron Crusher","itemDesc":"[CL] Bron Crusher","trscYn":"Y"},
  //       {"luck":{"luck":"1.67","min":"0","max":"0"},"seq":"16","imgSrc":"/resource/img/CB016.gif","itemName":"[CL] Bloody Scythe","itemDesc":"[CL] Bloody Scythe","trscYn":"Y"},
  //       {"luck":{"luck":"1.67","min":"0","max":"0"},"seq":"17","imgSrc":"/resource/img/CB017.gif","itemName":"[CL] 월아","itemDesc":"[CL] 월아","trscYn":"Y"}
  //     ]
  //   },
  //   {
  //     "packageCode": "8",
  //     "packageName": "[CL] 불법무기(원거리) 랜덤",
  //     "cost": "130000",
  //     "imgSrc": "/resource/img/box/BOX041.gif",
  //     "itemInfo": [
  //       {"luck":{"luck":"8.57","min":"0","max":"0"},"seq":"1","imgSrc":"	/resource/img/CB018.gif	","itemName":"	[CL] Musketeer	","itemDesc":"	[CL] Musketeer	","trscYn":"Y"},
  //       {"luck":{"luck":"8.57","min":"0","max":"0"},"seq":"2","imgSrc":"	/resource/img/CB019.gif	","itemName":"	[CL] Gyrojet W.I.T.O Custom	","itemDesc":"	[CL] Gyrojet W.I.T.O Custom	","trscYn":"Y"},
  //       {"luck":{"luck":"8.57","min":"0","max":"0"},"seq":"3","imgSrc":"	/resource/img/CB020.gif	","itemName":"	[CL] H&K XM8 Mk2	","itemDesc":"	[CL] H&K XM8 Mk2	","trscYn":"Y"},
  //       {"luck":{"luck":"8.57","min":"0","max":"0"},"seq":"4","imgSrc":"	/resource/img/CB021.gif	","itemName":"	[CL] Erase HMZ Model560	","itemDesc":"	[CL] Erase HMZ Model560	","trscYn":"Y"},
  //       {"luck":{"luck":"8.57","min":"0","max":"0"},"seq":"5","imgSrc":"	/resource/img/CB022.gif	","itemName":"	[CL] Lase Blaster-Green	","itemDesc":"	[CL] Lase Blaster-Green	","trscYn":"Y"},
  //       {"luck":{"luck":"8.57","min":"0","max":"0"},"seq":"6","imgSrc":"	/resource/img/CB023.gif	","itemName":"	[CL] SPAS-11 Recoilless	","itemDesc":"	[CL] SPAS-11 Recoilless	","trscYn":"Y"},
  //       {"luck":{"luck":"8.57","min":"0","max":"0"},"seq":"7","imgSrc":"	/resource/img/CB024.gif	","itemName":"	[CL] Engine BUSTER	","itemDesc":"	[CL] Engine BUSTER	","trscYn":"Y"},
  //       {"luck":{"luck":"5.00","min":"0","max":"0"},"seq":"8","imgSrc":"	/resource/img/CB025.gif	","itemName":"	[CL] Gaia SharpShooter HVAP	","itemDesc":"	[CL] Gaia SharpShooter HVAP	","trscYn":"Y"},
  //       {"luck":{"luck":"5.00","min":"0","max":"0"},"seq":"9","imgSrc":"	/resource/img/CB026.gif	","itemName":"	[CL] Fennec Fox	","itemDesc":"	[CL] Fennec Fox	","trscYn":"Y"},
  //       {"luck":{"luck":"5.00","min":"0","max":"0"},"seq":"10","imgSrc":"	/resource/img/CB027.gif	","itemName":"	[CL] Rain Shooter	","itemDesc":"	[CL] Rain Shooter	","trscYn":"Y"},
  //       {"luck":{"luck":"5.00","min":"0","max":"0"},"seq":"11","imgSrc":"	/resource/img/CB028.gif	","itemName":"	[CL] RAILGUN - P/TYPE(Replica)	","itemDesc":"	[CL] RAILGUN - P/TYPE(Replica)	","trscYn":"Y"},
  //       {"luck":{"luck":"5.00","min":"0","max":"0"},"seq":"12","imgSrc":"	/resource/img/CB029.gif	","itemName":"	[CL] Franchi SPAS-12 Prototype	","itemDesc":"	[CL] Franchi SPAS-12 Prototype	","trscYn":"Y"},
  //       {"luck":{"luck":"5.00","min":"0","max":"0"},"seq":"13","imgSrc":"	/resource/img/CB030.gif	","itemName":"	[CL] The Swallow	","itemDesc":"	[CL] The Swallow	","trscYn":"Y"},
  //       {"luck":{"luck":"1.66","min":"0","max":"0"},"seq":"14","imgSrc":"	/resource/img/CB031.gif	","itemName":"	[CL] Eagle Sniper	","itemDesc":"	[CL] Eagle Sniper	","trscYn":"Y"},
  //       {"luck":{"luck":"1.67","min":"0","max":"0"},"seq":"15","imgSrc":"	/resource/img/CB032.gif	","itemName":"	[CL] H&K XM8 Full Burst	","itemDesc":"	[CL] H&K XM8 Full Burst	","trscYn":"Y"},
  //       {"luck":{"luck":"1.67","min":"0","max":"0"},"seq":"16","imgSrc":"	/resource/img/CB033.gif	","itemName":"	[CL] Rail Burster	","itemDesc":"	[CL] Rail Burster	","trscYn":"Y"},
  //       {"luck":{"luck":"1.67","min":"0","max":"0"},"seq":"17","imgSrc":"	/resource/img/CB034.gif	","itemName":"	[CL] Lase Blaster-Blue	","itemDesc":"	[CL] Lase Blaster-Blue	","trscYn":"Y"},
  //       {"luck":{"luck":"1.67","min":"0","max":"0"},"seq":"18","imgSrc":"	/resource/img/CB035.gif	","itemName":"	[CL] Claymore Blaster(Replica)	","itemDesc":"	[CL] Claymore Blaster(Replica)	","trscYn":"Y"},
  //       {"luck":{"luck":"1.67","min":"0","max":"0"},"seq":"19","imgSrc":"	/resource/img/CB036.gif	","itemName":"	[CL] Eternal Flame	","itemDesc":"	[CL] Eternal Flame	","trscYn":"Y"}   
  //     ]
  //   }
  // ]
  // CacheBox.create(ary);

  //-------------------------------------------------

  // EterItem.find({}).sort("order").sort("tier").exec(function(err, db_list){
  //   for(var i in db_list) {
  //     if(db_list[i].ctype == "1" && db_list[i].stype1 == "1" && db_list[i].order == "0") {
  //     if(db_list[i].item_nm.indexOf("[CL]") > -1) {
        // stat_hist_obj.type = "dmg";
        // stat_hist_obj.update_dt = "20180803";
        // stat_hist_obj.dmg = db_list[i].dmg;
        // console.log("db_list[i].stat_hist.length : " + db_list[i].stat_hist.length);
        // db_list[i].stat_hist[db_list[i].stat_hist.length] = stat_hist_obj;
        // update_obj.stat_hist = db_list[i].stat_hist;
        // update_obj = {$unset:{stat_hist:1}}; //필드삭제
        // update_obj.stat_hist = stat_hist;
        // EterItem.remove({_id:db_list[i]._id}, function(err){
        //   if(err) return res.json(err);
        // });
        // EterItem.findOneAndUpdate({_id:db_list[i]._id}, update_obj, function (err, item) {
        //   if(err) console.log(err);
        // });
        // console.log("["+(Number(i)+1)+"]" + db_list[i].item_nm + " | " + db_list[i]._id);
  //     }
  //     }
  //   }
  // });

  res.render("admin/index");
});

router.post("/getdblist", function(req, res) {
  EterItem.find().exec(function(err, db_list){
    if(err) return res.json(err);
    res.json(db_list);
  });
});

router.post("/getexcellist", function(req, res) {
  var excel = require('excel4node');
  var wb = new excel.Workbook();
  var ws = wb.addWorksheet("sheet1");
  var in_list = get_in_list(req);

  EterItem.find({$and:in_list}).sort("order").sort("tier").exec(
    function(err, db_list){
      var title_ary = [
        "item_nm",
        "cost",
        "item_dtl_dv",
        "tier",
        "dmg",
        "dfs",
        "cri",
        "con",
        "accuracy_rate",
        "point_rate",
        "weight",
        "speed",
        "ctype(분류)",
        "stype1(원근부위)",
        "stype2(성별)",
        "clyn",
        "order",
        "img_src",
        "illegal",
        "size",
        "_id"
      ];

      for(var i=0; i<title_ary.length; i++) {
        ws.cell(1,i+1).string(title_ary[i]);
      }

      for(var x=0; x<db_list.length; x++) {
        ws.cell(x+2,1).string(db_list[x].item_nm);
        ws.cell(x+2,2).string(db_list[x].cost);
        ws.cell(x+2,3).string(db_list[x].item_dtl_dv);
        ws.cell(x+2,4).number(db_list[x].tier);
        ws.cell(x+2,5).string(db_list[x].dmg);
        ws.cell(x+2,6).string(db_list[x].dfs);
        ws.cell(x+2,7).string(db_list[x].cri);
        ws.cell(x+2,8).string(db_list[x].con);
        ws.cell(x+2,9).string(db_list[x].accuracy_rate);
        ws.cell(x+2,10).string(db_list[x].point_rate);
        ws.cell(x+2,11).string(db_list[x].weight);
        ws.cell(x+2,12).string(db_list[x].speed);
        ws.cell(x+2,13).string(db_list[x].ctype);
        ws.cell(x+2,14).string(db_list[x].stype1);
        ws.cell(x+2,15).string(db_list[x].stype2);
        ws.cell(x+2,16).string(db_list[x].clyn);
        ws.cell(x+2,17).number(db_list[x].order);
        ws.cell(x+2,18).string(db_list[x].img_src);
        ws.cell(x+2,19).string(db_list[x].illegal);
        ws.cell(x+2,20).string(db_list[x].size);
        ws.cell(x+2,21).string(String(db_list[x]._id));
      }

      wb.write('eter_item_db.xlsx', res);
    }
  );
});

router.post("/getdblist_filter", function(req, res) {
  var in_list = get_in_list(req);

  EterItem.find({$and:in_list}).sort("order").sort("tier").exec(
    function(err, db_list){
      if(err) return res.json(err);
      res.json(db_list);
    }
  );
});

router.post("/getparsinglist", function(req, res) {
  var x=0;
  var total_page = 11;
  var ctype,stype1,stype2 = 1;
  list_ary = [];
  order = 0;

  ctype = req.body.item_dv;
  if(ctype==1) {
    stype1 = req.body.item_dv1;
    stype2 = 1;
  }else{
    stype1 = req.body.item_dv2;
    stype2 = req.body.item_dv3;
  }

  console.log("=============START============");
  for(var i=1; i<=total_page; i++) {
    setTimeout(getparsinglist,x,i,ctype,stype1,stype2);
    x+=150;
  }

  setTimeout(getparsingresult,(x+150),res);
});

module.exports = router;

var getparsinglist = function(page,ctype,stype1,stype2) {
  var result = "";
  var options = {
    url:"http://eternalcity.mgame.com/info/item.mgame?rtype=I&ctype="+ctype+"&stype1="+stype1+"&stype2="+stype2+"&Page="+page,
    encoding: "binary"
  };
  // console.log("[URL] " + options.url);
  var iconv = new Iconv('euc-kr', 'utf-8//TRANSLIT//IGNORE');
  var contentType = "";

  request(options, function(err,res,html) {
    contentType = res.headers["content-type"];
    result = html;
  }).on('complete', function() {
    var binaryHtml = new Buffer(result, "binary");
    var parseHtml = utils.convertUTF8(binaryHtml, contentType);
    var $ = cheerio.load(parseHtml);
    var in_list = [];
    var in_obj = {};
    var htmlItemList = $(".itemList");
    var result_obj = {};

    htmlItemList.each(function() {
      var item_nm = $(this).find("h5").text();
      var cost = "0";
      var item_dv = "0";
      var item_dtl_dv = "0";
      var tier = 0;
      var dmg = "0";
      var dfs = "0";
      var cri = "0";
      var accuracy_rate = "0";
      var point_rate = "0";
      var weight = "0";
      var speed = "0";
      var clyn = "N";
      var img_src = $(this).find("img").attr("src");
      var item_info_list = $(this).find("table tbody tr td");
      item_info_list.each(function(i) {
        var td_value = $(this).text();

        if(ctype==1) {
          if(i=='0') cost = td_value.replace(',','');
          else if (i==1) item_dtl_dv = td_value;
          else if (i==2) tier = td_value;
          else if (i==3) dmg = td_value.replace(',','');
          else if (i==4) accuracy_rate = td_value;
          else if (i==5) point_rate = td_value;
          else if (i==6) weight = td_value;
          else if (i==7) {
            if(stype1==1) speed = td_value.substr(0,td_value.indexOf('발'));
            else speed = td_value.substr(0,td_value.indexOf('회'));
          }
        }else{
          if(i=='0') cost = td_value.replace(',','');
          else if (i==1) item_dtl_dv = td_value;
          else if (i==2) tier = td_value;
          else if (i==3) dfs = td_value.replace(',','');
          else if (i==4) weight = td_value;
          else if (i==5) speed = td_value;
        }

      });

      result_obj = {};
      result_obj.item_nm = item_nm;
      result_obj.cost = utils.replace(cost,",","");
      result_obj.item_dtl_dv = item_dtl_dv;
      result_obj.tier = tier;
      result_obj.dmg = utils.replace(dmg,",","");
      result_obj.dfs = utils.replace(dfs,",","");
      result_obj.cri = cri;
      result_obj.accuracy_rate = accuracy_rate;
      result_obj.point_rate = point_rate;
      result_obj.weight = utils.replace(weight,",","");
      result_obj.speed = speed;
      result_obj.ctype = ctype;
      result_obj.stype1 = stype1;
      result_obj.stype2 = stype2;
      result_obj.clyn = clyn;
      result_obj.order = order;
      result_obj.img_src = img_src;
      order += 1;
      list_ary.push(result_obj);
    });
  });
};

var getparsingresult = function(res) {
  console.log("=============RESULT============");
  EterItem.create(list_ary);
  res.json(list_ary);
};

var get_in_list = function(req) {
  var in_obj = {};
  var in_obj1 = {};
  var in_obj2 = {};
  var in_obj3 = {};
  var in_obj4 = {};
  var in_list = [];

  if(req.body.item_dv==1) {
    if(req.body.clyn !=='') in_obj.clyn = req.body.clyn;
    in_obj.ctype = req.body.item_dv;
    in_list.push(in_obj);

    if(req.body.item_dv1==3 || req.body.item_dv1==4) {
      if(req.body.item_dv1==3) req.body.item_dv1=1;
      else req.body.item_dv1=2;
      in_obj4.illegal="Y";
      in_list.push(in_obj4);
    }
    in_obj1.stype1 = req.body.item_dv1;
    in_obj1.illegal = 'Y'; //수동옵션
    in_list.push(in_obj1);
  }else if(req.body.item_dv==2) {
    if(req.body.clyn !=='') in_obj.clyn = req.body.clyn;
    in_obj.ctype = req.body.item_dv;
    in_list.push(in_obj);

    if(req.body.item_dv2.length != '0') {
      in_obj1.stype1 = req.body.item_dv2;
      in_list.push(in_obj1);
    }
    in_obj2.stype2 = req.body.item_dv3;
    in_list.push(in_obj2);
  }else if(req.body.item_dv==3 || req.body.item_dv==4) {
    if(req.body.clyn !=='') in_obj.clyn = req.body.clyn;
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

function getUserIP(req){
    var ipAddress;

    if(!!req.hasOwnProperty('sessionID')){
        ipAddress = req.headers['x-forwarded-for'];
    } else{
        if(!ipAddress){
            var forwardedIpsStr = req.header('x-forwarded-for');

            if(forwardedIpsStr){
                var forwardedIps = forwardedIpsStr.split(',');
                ipAddress = forwardedIps[0];
            }
            if(!ipAddress){
                ipAddress = req.connection.remoteAddress;
            }
        }
    }
    return ipAddress;
}