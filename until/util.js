/**
 * 公共函数定义
 */
let createHash = require('create-hash');
module.exports = {
  // 生成随机数
   rand(min,max) {
    return Math.floor(Math.random()*(max-min))+min;
},
  // 生成时间戳
  createTimeStamp(){
    return parseInt(new Date().getTime() / 1000) + ''
  },
  // 生成签名

  // Object 转换成json并排序
  raw(args){
    let keys = Object.keys(args).sort();
    let obj = {};
    keys.forEach((key)=>{
      obj[key] = args[key];
    })
    // {a:1,b:2} =>  &a=1&b=2
    // 将对象转换为&分割的参数
    let val = '';
    for(let k in obj){
      val += '&' + k + '=' +obj[k];
    }
    return val.substr(1);
  },
  // 对请求结果统一封装处理
  handleResponse(err, response, body){
    if (!err && response.statusCode == '200') {
      let data = JSON.parse(body);

      if (data && !data.errcode){
        return this.handleSuc(data);
      }else{
        return this.handleFail(data.errmsg, data.errcode);
      }
    }else {
      return this.handleFail(err, 10009);
    }
  },
  handleSuc(data=''){
    return {
      code: 0,
      data,
      message: ''
    }
  },
  handleFail(message = '',code = 10001){
    return {
      code,
      data:'',
      message
    }
  },


}