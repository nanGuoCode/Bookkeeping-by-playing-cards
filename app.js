const express = require('express');
var path = require('path');
var cors=require('cors')
var http = require('http');
var bodyParser = require('body-parser')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');


 var app = express();
 require('./db/index')(app)

 app.use(cors())
var server = http.createServer(app);
let io = require('socket.io')(server,{
  pingInterval: 10000,
  pingTimeout: 5000,
});



// require('./ws/client')(app)
require('./ws/ws')(io) 
const port=3000

app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
app.use(express.json());
app.use(express.urlencoded({ extended: false }));



app.use('/api/wx', indexRouter);
app.use('/users', usersRouter);


server.listen(port,()=>{
  console.log("-----------服务启动成功------------");
});

module.exports =app;
