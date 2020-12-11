const router = require("express").Router();
const db = require("../model/mydb");
const md5 = require("md5-node");
const User = db.User;
//get 的/user/login请求,跳转到登陆页面
router.get("/login",function (req,res) {
    res.render("messageLogin");
});

router.get("/regist",function (req,res) {
   res.render("messageRegist");
});

router.post("/login",function (req,res) {
    var username = req.body.username;
    var password = md5(req.body.password);
    //判断用户名密码是否正确
    var filter = {
        username:username,
        password:password
    }
    //根据用户名密码查询是否正确
    db.findAll(User,filter,function (err,users) {
       if(err){
           console.log(err);
           res.send({status:1,msg:"网络波动,稍后再试"});
           return;
       }
       //没找到数据,错误
       if (users.length == 0){
           res.send({status:1,msg:"用户名或密码错误"});
           return;
       }
       req.session.username = username;
       //返回成功的状态
       res.send({status:0,msg:"登录成功"});

    });
});

//post 的/user/check请求,验证用户名是否存在
router.post("/check",function (req,res) {
   var body = req.body;
    //获取查询结果
   db.findAll(User,body,function (err,users) {
      if(err){
          console.log(err);
          res.send({status:2,msg:"网络错误,稍后再试"});
          return;
      }
      if(users.length>0){//users数组中已有数据
          res.send({status:1,msg:"用户名以存在"});
          return ;
      }
      //users是空数组
      res.send({status:0,msg:"用户名可以使用"});
   });
});

router.post("/regist",function (req,res){
    var username = req.body.username;
    var password = md5(req.body.password);
    //二次验证用户名是否存在(防止通过脚本直接发送请求)
    var filter = {
      username:username
    };
    db.findAll(User,filter,function (err,users) {
        if(err){
           console.log(err);
           res.send({status:3,msg:"网络错误"});
           return;
        }
        if(users.length>0){
           res.send({status:1,msg:"用户名已存在"});
           return;
        }
        //用户名不存在,可以使用
        //
        var data = {};
        data.username = username;//用户名
        data.password = password;//密码
        data.nickname = username;//昵称,默认用户名
        //保存数据
        db.add(User,data,function (err) {
            if(err){
                console.log(err);
                res.send({status:3,msg:"网络错误"});
                return;
            }
            //注册成功
            //保存成功
            req.session.username = username;
            res.send({status:0,msg:"注册成功"});
        })
    });
});

// get /user/center,跳转带个人中心页面
router.get("/center",function (req,res) {
   // 获取当前登陆的用户名
    var username = req.session.username;
    var filter = {
        username:username
    }
    //获取当前登陆用户的信息
    db.find(User,filter,function (err,users) {
       if(err){
           console.log(err);
           res.render("error",{msg:"网络错误"});
           return;
       }
       if(users.length == 0){
           //登陆状态已失效
           req.session.destroy(function (err) {
               res.redirect("/messageProj");
           });
           return;
       }
       //返回数据,users是个数组,且只有一个数组
       res.render("messageCenter",{user:users[0]});
    });

});

router.get("/change/:newName",function (req,res) {
   var nickname = req.params.newName;
   var username = req.session.username;
   var filter = {
       username:username
   }
   var data = {
       nickname:nickname
   }
   db.modify(User,filter,data,function (err) {
       if(err){
           console.log(err);
           res.send({status:1,msg:"网络错误,修改失败"});
           return;
       }
       res.send({status:0,msg:"修改成功"});
   });
});

router.get("/logout",function (req,res) {
   //退出登陆,删除session
   req.session.destroy(function (err) {
     res.redirect("/messageProj");
   });
});
module.exports = router;
