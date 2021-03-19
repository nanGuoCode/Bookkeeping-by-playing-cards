
const mongoose = require('mongoose')
const util=require('../until/util')
const schema = new mongoose.Schema({
  room_num:{
    type:Number,
   default(){ 
      return util.rand(1000,9999)   
   }
  },
  openId:{type:String},
  users_info:[{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  msg:{type:Array},
  record:{type:Array},
  create_time:{type:Date}
},{
  timestamps: true
})

module.exports = mongoose.model('Room', schema)