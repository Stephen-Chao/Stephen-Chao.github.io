const express = require("express");
const app = express();
const session = require("express-session");
const route = require("./route");


app.listen(4000);

app.set("view engine","ejs");

app.use(session({
   secret:"message",
   resave:false,
   saveUninitialized:true,
   cookie:{
      maxAge:24*60*60*1000
   }
}));



app.use(express.urlencoded({extended:true}));

app.use(express.static("./public"));

app.get("/",function (req,res) {
   res.render("index");
});

app.use("/messageProj",route.checkisLogin);

app.get("/messageProj",function (req,res) {
   res.redirect("/messageProj/message/show?page=1");
});

app.use("/messageProj/message",route.message);

app.use("/messageProj/user",route.user);

app.use("/messageProj",function (req,res) {
   res.render("error",{msg:"请求地址错误"});
});

//设置根目录
app.use(express.static("./public"))
app.use(express.static("./uploads"))
//访问localhost:4000
app.get("/photo",function (req,res) {
   //请求跳转到相册的请求中去(重定向)
   res.redirect("/photo/album");
});

//请求主要分为两大类:
//相册(文件夹)相关的请求,相片(文件)相关的请求

//处理所有以/album开头的请求
app.use("/photo/album",route.album);

//处理所有以/pic开头的请求
app.use("/photo/pic",route.pic);
