//app.js
let Api=require('./http/api')
let request=require('./http/request')
let config=require('./env/index')
let router = require('./utils/router')
let env="Dev" 
App.config=config[env]  //js文件使用
const store =require('./utils/store');
App({
   config:config[env],  //视图使用
   Api,
   router,
   get:request.fetch,
   post:(url,data,option) =>{
     option.method='POST';
     return request.fetch(url,data,option);
   },
  onLaunch: function () {
    // 展示本地存储能力
    // 登录
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.record']) {
          wx.authorize({
            scope: 'scope.record',
            success () {
              // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
              wx.startRecord()
            }
          })
        }
      }
    })
  },
})