var socket = io();
var userName = (new Date()).valueOf();
var count = 0;
var myShakeEvent = new Shake({
    threshold: 15, // optional shake strength threshold
    timeout: 1000 // optional, determines the frequency of event generation
});

myShakeEvent.start();
console.log(window.location.host);
window.addEventListener('shake', shakeEventDidOccur, false);

//摇一摇
function shakeEventDidOccur () {
   count ++;
  socket.emit('userEvent', {username : userName, count : count});
}
 // 客户端连接时，向服务器发送 加入房间事件
      socket.on('connect', function () {
        socket.emit('cjoin', {username : userName});
      });

      // 接收服务端消息
      socket.on('msg', function(obj){
        console.log(obj);
      });

   // 监听服务器端 用户数方法
      // socket.on('count', function (obj) {
      //   if(obj.count == 0){
      //     alert('房间人数已满，请刷新pc页面，重新扫描二维码');
      //   }

      // });

 // 点击按钮向服务器端发送动作
      $('.btn').click(function(){
        count ++;
        socket.emit('userEvent', {username : userName, count : count});
      });
 