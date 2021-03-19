module.exports = (io) => {
  const User = require('../models/User');
  const Room = require('../models/Room');
  const util = require('../until/util.js');
  let roomInfo = {};
  io.on('connection', (socket) => {
    var roomID = socket.handshake.query.roomID;
    //
    var user = '';
    socket.on('join', async (userName) => {
      user = userName;
      if (!roomInfo[roomID]) {
        roomInfo[roomID] = [];
      }

      if (roomInfo[roomID].indexOf(user) == -1) {
        roomInfo[roomID].push(user);
        socket.join(roomID); // 加入房间
        let roomsInfo = await Room.findById(roomID).populate('users_info');
        let msgA = roomsInfo.msg;
        msgA.unshift({ msg: `${user}加入了房间`, type: 0 });
        await Room.updateOne({ _id: roomID }, { msg: msgA });
        let joinInfo = await Room.findById(roomID).populate('users_info');
        io.to(roomID).emit('sys', {
          joinInfo: joinInfo,
          room: roomInfo[roomID],
        });
      } else {
        socket.join(roomID); // 加入房间
        let joinInfo = await Room.findById(roomID).populate('users_info');
        io.to(roomID).emit('sys', {
          joinInfo: joinInfo,
          room: roomInfo[roomID],
        });
      }
    });
    // 接收用户消息,发送相应的房间
    let newTime = new Date().getMinutes();
    socket.on('expend', async (msg) => {
      let time = new Date();
      let timeMin = time.getMinutes();
      if (timeMin - newTime >= 1) {
        newTime = new Date().getMinutes();
        let hour = time.getHours();
        let min = timeMin;
        let roomI = await Room.findById(roomID).populate('users_info');
        let mess = roomI.msg;
        mess.unshift({ hour: hour, min: min, type: 3 });
        await Room.updateOne({ _id: roomID }, { msg: mess });
      } else {
        newTime = new Date().getMinutes();
      }

      let roomInfoS = await Room.findById(roomID).populate('users_info');
      let messA = roomInfoS.msg;

      messA.unshift({
        usersInfo: msg.userInfo.nickName,
        user: msg.user.nickName,
        msg: msg.value,
        type: 1,
      });
      let mess = await Room.updateOne({ _id: roomID }, { msg: messA });
      msg.userInfo.total_num = msg.userInfo.total_num - msg.value;
      msg.user.total_num = msg.user.total_num + msg.value;

      await User.updateOne({ _id: msg.user._id }, msg.user);
      await User.updateOne({ _id: msg.userInfo._id }, msg.userInfo);
      let usersInfo = await Room.findById(roomID).populate('users_info');

      // 验证如果用户不在房间内则不给发送
      if (roomInfo[roomID].indexOf(user) === -1) {
        return false;
      }
      io.to(roomID).emit('msg', { usersInfo, mess });
    });

    socket.on('disconnect',async  (msg)=> {
      // 从房间名单中移除
      console.log(123);
      let roomsInfo = await Room.findById(roomID).populate('users_info');
      let msgA = roomsInfo.msg;
      msgA.unshift({ msg: `${user}退出了房间`, type: 0 });
      await Room.updateOne({ _id: roomID }, { msg: msgA });
      let usersInfo = await Room.findById(roomID).populate('users_info');
      console.log(usersInfo);
      
      var index = roomInfo[roomID].indexOf(user);
      if (index !== -1) {
        roomInfo[roomID].splice(index, 1);
      }
  
      socket.leave(roomID);    // 退出房间
      io.to(roomID).emit('msg',{usersInfo});
      io.to(roomID).emit('check')
    });
  });
};
