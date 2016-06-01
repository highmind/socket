var express = require('express');
var path    = require('path');
var router  = express.Router();
var app     = express();
var server  = require('http').Server(app);
var IO      = require('socket.io')(server);
var io      = require('socket.io');

// 配置public静态文件目录
app.use(express.static(path.join(__dirname, 'public')));

// 设置模版引擎和目录
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');



// 创建socket服务
var socketIO = io(server);
// 房间用户名单
var roomInfo = {};

socketIO.on('connection', function (socket) {

    var user = '';

   // 公共板加入房间，注册房间，获取用户名，公共端用户名可忽略
    socket.on('join', function (obj) {

          var roomID = obj.roomID;   // 获取房间ID
          var date = new Date();
              user = obj.username;
       
        // 将用户昵称加入房间名单中
        if (!roomInfo[roomID]) {
          roomInfo[roomID] = [];
        }
        roomInfo[roomID].push(user);

        socket.join(roomID);    // 加入房间
        
        console.log('公共端 ' + user + '创建了房间 ' + roomID + ' ' + date);
        // 通知房间内人员
        socketIO.to(roomID).emit('msg', user + '加入了房间 ' + roomID, roomInfo[roomID]); 

    });

// 监听客户端用户动作
    socket.on('userEvent', function (obj) {

          var url = socket.request.headers.referer;
          var splited = url.split('/');
          var roomID = splited[splited.length - 1];   // 获取房间ID        
 
          // 通知房间内人员，将客户端数据发送到 公共板
          socketIO.to(roomID).emit('listenUserE', obj); 

    });


    // 监听客户端加入房间
    socket.on('cjoin', function (obj) {
          var date = new Date();
          var url = socket.request.headers.referer;
          var splited = url.split('/');
          var roomID = splited[splited.length - 1];   // 获取房间ID
          user = obj.username;
          
          // 如果房间用户达到2人
          if((roomInfo[roomID]).length >= 3){
            socketIO.to(roomID).emit('count', {count : 0});
            return;
          }
          else{

            // 将用户昵称加入房间名单中
            if (!roomInfo[roomID]) {
              roomInfo[roomID] = [];
            }

            roomInfo[roomID].push(user);

            socket.join(roomID);    // 加入房间

            console.log('客户端用户 ' + user + '加入了房间 ' + roomID + ' ' + date);

            // 通知房间内人员
            socketIO.to(roomID).emit('msg', user + '加入了房间 ' + roomID + ' ' + date, roomInfo[roomID]); 
            //向公共板发送数据
            socketIO.to(roomID).emit('getServer', obj); 

          }


    });

    socket.on('disconnect', function () {
          var url = socket.request.headers.referer;
          var splited = url.split('/');
          var roomID = splited[splited.length - 1];   // 获取房间ID

          //判断是不是公共板，如果是客户端，就端口连接，并且从数据中删除用户
          if(roomID === ''){
            console.log('公共板断开连接')
          }
          //
          else{

            //从房间名单中移除
            var index = roomInfo[roomID].indexOf(user);
            if (index !== -1) {
              roomInfo[roomID].splice(index, 1);
          }

          socket.leave(roomID);    // 退出房间
          socketIO.to(roomID).emit('userLoginOut', {username : user, roomID : roomID});
          console.log(user + '退出了 房间' + roomID);

          }

          
    });
 

});


// 首页路由设置
router.get('/', function(req, res){
     res.render('index', {});
});

// 房间页面路由
router.get('/room/:room', function(req, res){
     var roomID = req.params.room;
     res.render('room', {roomID : roomID});
});


app.use('/', router);

server.listen(8080, function(){
    console.log('server listening on port 8080');
});

