// pages/login/login.js
const app =getApp()
const store= require('../../utils/store')
let Api=app.Api
Page({

  data: {
    token: store.getItem('token'),
    buttons: [
        {
            type: 'default',
            className: '',
            text: '取消',
            value: 0
        },
        {
            type: 'primary',
            className: '',
            text: '登录',
            value: 1
        }
    ]
  },

  onLoad: function (options) {
 //登录
   if(!this.data.token){
     this.getSession()
     console.log(this.data.token);    
   }else{
    app.router.push("index",{openType:"redirect"})
   }
  },
  getSession:function(){
   wx.login({
     success:res=>{
       console.log(res);
       
       if(res.code){
         app.get(Api.getSession,{
          code:res.code
        }).then(res=>{
          console.log(res);  
          store.setItem('openId',res.openid)
          
        }).catch(err=>{
          console.log(err);  
        })
       }
     }
   })
  },
  getUserInfo(e){
   console.log(e);
   let userInfo=e.detail.userInfo
   userInfo.openId=store.getItem('openId')
   app.post(Api.login,{
     userInfo
   },{}).then(res=>{
     store.setItem('token',res.token)
    app.router.push("index",{openType:"redirect"})

   })
  },
})