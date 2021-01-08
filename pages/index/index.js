//index.js
//获取应用实例
const app = getApp()
const store=require('../../utils/store')
let Api=app.Api

Page({
  data: {
    userInfo: {},
    room:[]
  },

 onLoad(){
this.getUserInfo()
},
  //事件处理函数
  getUserInfo(){
  let openId=store.getItem('openId')
  app.get(Api.userInfo).then(res=>{
   this.setData({
     userInfo:res
   })
  })
  },
  createRoom(){
  let userInfo=this.data.userInfo
  app.post(Api.createRoom,{userInfo},{}).then(res=>{
  let result=  res.shift()
   this.setData({
       room:result
   })  
   app.router.push("play",{query:result,openType:"redirect"})

  })

  }
})
