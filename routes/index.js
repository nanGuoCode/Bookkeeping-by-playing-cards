var express = require('express');
var router = express.Router();
var config = require('../until/mp');
const request = require('request');
const util = require('../until/util');
const User = require('../models/User');
var jwt = require('jsonwebtoken');
const Room = require('../models/Room');
const { json } = require('body-parser');

config = Object.assign({}, config.mp);

//获取Session
router.get('/getSession', function (req, res) {
  let code = req.query.code;
  if (!code) {
    res.send(123);
  } else {
    let sessionUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${config.appId}&secret=${config.appSecret}&js_code=${code}&grant_type=authorization_code`;
    request(sessionUrl, (err, response, body) => {
      let result = util.handleResponse(err, res, body);
      res.send(result);
    });
  }
});

// 登陆
router.post('/login', async (req, res) => {
  let userInfo = req.body.userInfo;
  let {
    nickName,
    gender,
    language,
    province,
    country,
    avatarUrl,
    openId,
  } = userInfo;
  if (!userInfo) {
    res.send(util.handleFail('用户信息不能为空', 10002));
  } else {
    var token = jwt.sign({ foo: 'bar' }, 'shhhhh');
    await User.insertMany({
      token,
      nickName,
      gender,
      language,
      province,
      country,
      avatarUrl,
      openId,
    });
    res.send({
      code: 0,
      data: {
        token,
      },
      message: '登录成功',
    });
  }
});

//获取个人信息
router.get('/userInfo', async (req, res) => {
  let token = req.headers.token;
  let result = await User.findOne({ token: token }).populate('friends').populate('room_record')
  let data = util.handleSuc(result);
  res.send(data);
});

//创建房间
router.post('/createRoom', async (req, res) => {
  let userInfo = req.body.userInfo;
  let users_info = userInfo._id;
  let time =new Date()
  let big = '5ff46f517c300000ca006592';
  let result = await Room.insertMany({
    users_info: [userInfo._id, big],
    create_time: time
  });

  let data = util.handleSuc(result);
  res.send(data);
});

//加入房间
router.get('/joinRoom', async (req, res) => {
  let userInfo = req.query.userInfo;
  let userId = userInfo._id;
  let roomId = req.query.roomId
  let roomInfo=  await Room.findById(roomId)
   roomInfo.users_info.push(userId)
 let result =  await Room.updateOne({_id:roomId},roomInfo)
  let data = util.handleSuc(result);
  res.send(data);
});

//获取房间信息
router.get('/getRoomInfo', async (req, res) => {
  let roomId = req.query.roomId;
  let result = await Room.findById(roomId).populate('users_info');
  let data = util.handleSuc(result);
  res.send(data);
});

//获取结算单
router.get('/getBill', async (req, res) => {
  let roomId = req.query.roomId;
  let userId = req.query.userId;

  let user = await User.findOne({ _id: userId });

  let result = await Room.findById(roomId).populate('users_info');

  let users_info = result.users_info;
  let usersInfo = users_info.sort((a, b) => {
    return a.total_num - b.total_num;
  });
  usersInfo.forEach((item, key) => {
    if (item.token === user.token) {
      var index = usersInfo.indexOf(item);
      if (index > -1) {
        usersInfo.splice(index, 1);
      }
    }
  });

  let num;
  let arr = [];
  if (user.total_num > 0) {
    if (user.total_num > -usersInfo[usersInfo.length - 1].total_num) {
    } else if (user.total_num < -usersInfo[usersInfo.length - 1].total_num) {
      user.total_num = 0;
      num = -user.total;
      usersInfo[usersInfo.length - 1].total_num = +user.total_num;
    } else {
      user.total_num = 0;
      num = -user.total;
      usersInfo[usersInfo.length - 1].total_num = 0;
    }
  } else if (user.total_num < 0) {
    if (user.total_num > -usersInfo[0].total_num) {
      num = -user.total_num;
      usersInfo[0].total_num = +user.total_num;
      arr.push({ _id: usersInfo[0]._id, num: num });
      let data = util.handleSuc(arr);
      res.send(data);
    } else if (user.total_num < -usersInfo[0].total_num) {
    } else {
      num = -user.total_num;
      usersInfo[0].total_num = 0;
      arr.push({ _id: usersInfo[0]._id, num: num });
      let data = util.handleSuc(arr);
      res.send(data);
    }
  }
});

//结算
router.get('/bill', async (req, res) => {
  let bill = req.query.bill;
  let userId = req.query.userId;
  let roomId = req.query.roomId;
  let user = await User.findById(userId);
  let [nicB, imgB, numB] = [user.nickName, user.avatarUrl, user.total_num];
  // await User.updateOne({_id:userId},{total_num:0})

  bill = JSON.parse(bill);
  let messageB = [];

  for (let i = 0; i < bill.length; i++) {
    bill[i]._id.total_num -= bill[i].num;
    bill[i]._id._num += bill[i].num;
    bill[i]._id.tmp_num -= bill[i].num;

    user.tmp_num -= bill[i].num;
    user._num -= bill[i].num;
    user.total_num += bill[i].num;
    var  index = user.friends.indexOf(bill[i]._id._id);
    if (index <= -1) {
      user.friends.push(bill[i]._id._id);
    }
    
    await User.updateOne({ _id: bill[i]._id._id }, bill[i]._id);
    messageB.unshift({
      nic: bill[i]._id.nickName,
      image: bill[i]._id.avatarUrl,
      num: bill[i].num,
    });
  }
  var  index = user.friends.indexOf(user._id);
  if (index <= -1) {
    user.friends.push(user._id)
  }

  await User.updateOne({ _id: userId }, user);
  let room = await Room.findById(roomId);
  let time = new Date();
  let hour = time.getHours();
  let min = time.getMinutes();
  //结算单
  let message = { nicB: nicB, imgB: imgB, numB: numB, messageB, type: 4 };

  room.msg.unshift(message, { hour: hour, min: min, type: 3 });
  await Room.updateOne({ _id: roomId }, room);
  let result = await Room.findById(roomId).populate('users_info');
  let msg = '结算成功';
  let data = util.handleSuc(result);
  res.send(data);
});

//退出房间
router.get('/signOut', async (req, res) => {
  let userId = req.query.userId;
  let roomId = req.query.roomId;
  let roomInfo = await Room.findById(roomId);
  let user = await User.findById(userId);
  var index = roomInfo.users_info.indexOf(userId);
  if (index > -1) {
    roomInfo.users_info.splice(index, 1);
  }
  if (user._num >= 0) {
    user.win_num += 1;
    let rate = (user.win_num / (user.lose_num + user.win_num)) * 100;
    user.win_rate = Math.round(rate);
    user.tmp_num +=user._num
  } else {
    user.lose_num += 1;
    let rate = (user.win_num / (user.lose_num + user.win_num)) * 100;
    user.win_rate = Math.round(rate);
    user.tmp_num +=user._num
  }

  roomInfo.record.push({ nickName: user.nickName, img:user.avatarUrl,winNum: user._num});
  user._num = 0;
  user.room_record.push(roomId);
  await User.updateOne({ _id: user._id }, user);

  await Room.updateOne({ _id: roomId }, roomInfo);
  let result = await Room.findById(roomId).populate('users_info');
  console.log(result);
  
  let data = util.handleSuc(result);
  res.send(data);
});

//删除房间记录
router.get('/deleteRoomId', async (req, res) => {
  let roomId = req.query.roomId;
  let userId = req.query.userId;
  let userInfo =  await User.findById(userId)
  console.log(userInfo);
  
   var index =userInfo.room_record.indexOf(roomId)
   if(index>-1){
    userInfo.room_record.splice(index,1)
   }
 let result =  await User.updateOne({_id:userId},userInfo)
  let data = util.handleSuc(result);
  res.send(data);
});

//获取世界排名
router.get('/getAllRank', async (req, res) => {

  let result =  await User.find()
 
  let data = util.handleSuc(result);
  res.send(data);
});
module.exports = router;
