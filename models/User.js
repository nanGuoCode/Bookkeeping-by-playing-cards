const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  token:{type:String},
  nickName: { type: String },
  gender:{type:String},
  language:{type:String},
  city:{type:String},
  province:{type:String},
  country:{type:String},
  avatarUrl:{type:String},
  openId:{type:String},
  win_num:{
    type:Number,
  default(){
    return 0
  }},
  lose_num:{
    type:Number,
    default(){
      return 0
    }},
  win_rate:{
    type:Number,
    default(){
      return 0
    }}
    ,
  total_num:{
    type:Number,
    default(){
      return 0
    }},
  _num:{
      type:Number,
      default(){
        return 0
      }},
      tmp_num:{
        type:Number,
        default(){
          return 0
        }},
        friends:[{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        room_record:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Room' }],
})

module.exports = mongoose.model('User', schema)