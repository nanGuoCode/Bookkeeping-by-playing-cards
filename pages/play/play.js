// pages/play/play.js
const app = getApp()
const store = require('../../utils/store')
let Api = app.Api
const io = require('../../utils/weapp.socket.io')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    usersInfo: [],
    roomInfo: {},
    userInfo: {},
    isShow: false, //退出房间模态框ctr
    user:{},
    isShowExp: false, // 支付模态框ctr
    value: null, //支付双向绑定
    socket: null, //socket对象
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getRoom(options)
    this.getUserInfo(options)

  },

  getRoom(options) {
    app.get(Api.getRoomInfo, {
      roomId: options._id
    }).then(res => {
      console.log(res);
      this.setData({
        usersInfo: res.users_info,
        roomInfo: res
      })

    })
  },

  playWs(options) {
    let roomID
    this.data.socket = io(`ws://127.0.0.1:3000`, {
      query: {
        roomID: 123,
        room_num: options.room_num
      }
    });
    this.data.socket.on('connect', () => {
     console.log('已连接');
      this.data.socket.emit('join', 'nanguo');
    });
    // socket.emit('test','南国test')
    this.data.socket.on('sys', (arg, users) => {
      console.log(arg, users);
    })

  },

  getUserInfo(options) {
    let openId = store.getItem('openId')
    app.get(Api.userInfo).then(res => {
      console.log(res);
      this.setData({
        userInfo: res
      })
      this.playWs(options)
    })
  },

  transferA(e) {
    let token = store.getItem('token')
    console.log(e);
     this.setData({
       isShow: true,
     })
  
     
    //  this.setData({
    //   isShowExp:true
    //  })
   
  },

  //modal开关 事件
  isShowModel(event) {
    this.setData({
      isShow: false,
      isShowExp: false,
      value: ''
    })
  },

  //支出事件
  expend(event) {
    // this.data.socket.emit("transfer",'123')
    // this.data.socket.on('msg',(arg)=>{
    //   console.log(arg);
    // })
  }

})