
var express = require('express');
var mtehodOverride = require("method-override");
var bodyParser = require("body-parser");
var mongoose   = require("mongoose");
var app = express();

// DB setting
mongoose.connect(process.env.MONGO_DB); // 1
var db = mongoose.connection;
db.once("open", function(){
 console.log("DB connected");
});
db.on("error", function(err){
 console.log("DB ERROR : ", err);
});

app.set("view engine", "ejs");
app.use(express.static(__dirname+"/public"));
app.use(mtehodOverride("_method"));
app.use(bodyParser.json()); // 2
app.use(bodyParser.urlencoded({extended:true})); // 3

//Routes
app.use("/", require("./routes/wp"));
app.use("/admin", require("./routes/admin"));
app.use("/wp", require("./routes/wp"));
app.use("/custom", require("./routes/custom"));
app.use("/notice", require("./routes/notice"));

app.listen(80, function() {
  console.log("server on");
});
