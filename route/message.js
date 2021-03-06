const router = require("express").Router();
const sd = require("silly-datetime");
//引入自己封装的数据库模块
const db = require("../model/mydb");
//获取其中的Msgmodel
const Message = db.Msg;

//get /message/show 展示所有的留言数据
router.get("/show",function (req,res) {
   //获取某一页的数据
   //获取当前页码
   var page = req.query.page;
   var length;
   var users1;
   //传递的数据
   db.getCount(Message,function (err,count) {
      if(err){
         console.log(err);
         res.render("error",{msg:"get Count error"});
         return;
      }
      length = count;
      //获取所有用户的信息
   });
   db.findAll(db.User,{},function(err,users){
      if(err){
         console.log(err);
         res.render("error",{msg:"获取数据失败"});
         return;
      }
      users1 = users;
   });
   db.find(Message,{page:page},function (err,docs) {
      if (err){
         console.log(err);
         //跳转到错误页面
         res.render("error",{msg:""});
         return;
      }
      //没有出错,将数据传递给index
      res.render("messageIndex",{msgs:docs,length:length,page:page,users:users1,username:req.session.username});
   });

});

//get /message/submit 发表留言
router.get("/submit",function (req,res) {
   // console.log(req.query);
   // res.send("success");
   //获取参数
   var message = req.query;
   //添加登陆的用户名
   message.username = req.session.username;
   //添加留言的时间
   message.time = sd.format(new Date());
   //调用db的方法,将数据保存到数据库中
   db.add(Message,message,function (err) {
      if (err){
         console.log(err);
         //返回错误信息给ajax对象
         res.send({status:1,msg:"网络故障,发表失败"});
         return;
      }
      //成功
      res.send({status:0,msg:"success"});
   });
});

//get /message/del 删除留言
router.get("/del",function (req,res) {
   //获取参数
   var id = req.query.id;
   var filter = {
      //将id转换为objectid
      _id:db.getObjectId(id)
   }
   db.del(Message,filter,function (err) {
      if(err){
         console.log(err);
         res.send({status:1,msg:"网络故障"});
         return ;
      }
      res.send({status:0,msg:"success"});

   });
});

//get /message/update 修改留言
router.get("/update",function (req,res) {
   var id = req.query.id;
   var message = req.query.message;
   var filter = {
      _id:db.getObjectId(id)
   }
   var data  = {
      message :message
   }
   db.modify(Message,filter,data,function (err,raw) {
      if(err){
         console.log(err);
         res.send({status:1,msg:"修改失败"})
         return;
      }
      console.log(raw);
      res.send({status:0,msg:"修改成功"})
   });
});

module.exports = router;
