module.exports=app=>{
  const io =require('socket.io-client')
  const socket = io('http://127.0.0.1:3000',{
    query:{
      roomID:123,
    }
  });

  socket.on('connect', () => {
    console.log('建立连接');
    socket.emit('join', 'zhihu');
  });
  
  socket.on('login',(arg)=>{
    console.log(arg);
  })
  
      socket.on('login',(arg)=>{
        console.log(arg);
      })
      socket.on('sys',(arg,users)=>{ 
        console.log(arg);
      })
}