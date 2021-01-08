/**
 * 存储数据：
 * Storage 信息存储
 */
module.exports={
  //设置值
  setItem(key,value,moudule_name){
     if(moudule_name){
       let moudule_name_info=this.getItem(moudule_name);
       moudule_name_info[key]=value;
       wx.setStorageSync(moudule_name, moudule_name_info)
     }else{
       wx.setStorageSync(key, value)
     }
  },
  //获取值
   getItem(key,moudule_name){
     if(moudule_name){
       let val=this.getItem(moudule_name);
       if(val) return val[key];
       return '';
     }else{
       return wx.getStorageSync(key)
     }
   },
   //删除
   clear(key){
     key?wx.removeStorageSync(key):wx.clearStorageSync();
   },
   getSystemInfo(){
    return wx.getSystemInfoSync();
  }
}