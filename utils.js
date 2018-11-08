var utils = {};
var cheerio = require("cheerio");
var Iconv  = require('iconv').Iconv;

utils.replace = function(str,findstr,replacestr) {
  if(!str) return str;
  return str.replace(new RegExp(findstr,"g"),replacestr);
};

utils.convertUTF8 = function(html, contentType) {
  var $ = cheerio.load(html.toString());
  var iconv = new Iconv("EUC-KR", "UTF-8//TRANSLIT//IGNORE");
  var charset = $("meta[http-equiv='Content-Type']").attr("content") || contentType;

  if (charset && charset.toUpperCase().indexOf("EUC-KR") > -1) {
    return iconv.convert(html).toString();
  }else{
    return html;
  }
};

utils.calcWp = function(item_val) {
  var up_rate = [0,1,2,3,4,5,6,7,8,9,1,1,1,3,3,3,6,6,6,10];
  var up_list = [];
  var up_obj = {};
  var calc_num = Number(item_val);
  var result_num = Number(item_val);

  for(var i in up_rate) {
    calc_num = (calc_num/100*up_rate[i]) + calc_num;
    result_num = Math.round(calc_num);

    up_obj = {};
    up_obj.up1 = Math.floor(result_num);
    up_obj.up2 = Math.floor(result_num*1.1);
    up_obj.up3 = Math.floor(result_num*1.3);
    up_obj.up4 = Math.floor(result_num*1.5);
    up_obj.up5 = Math.floor(result_num*2);
    up_obj.up6 = Math.floor(result_num*3);
    up_obj.up7 = Math.floor(result_num*4);
    up_list.push(up_obj);

  }
  return up_list;
};

module.exports = utils;
