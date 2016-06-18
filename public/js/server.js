var socket = io();
var userName = '用户1';  //公共板为 pc端，用户名随意
var roomID = (new Date()).valueOf();  //创建房间 随机号码

console.log();
console.log("http://" + window.location.host + "/room/" + roomID);

//生成页面房间链接二维码
var qrcode = new QRCode("qrcode", {
    text: "http://" + window.location.host + "/room/" + roomID,
    width: 200,
    height:200,
    colorDark : "#000000",
    colorLight : "#ffffff",
    correctLevel : QRCode.CorrectLevel.H
});

     // 公共板连接时候，注册并加入房间
      socket.on('connect', function () {
        socket.emit('join', {username : userName, roomID : roomID});
      });
 
      // 接收服务端消息，监听用户加入
      socket.on('getServer', function(obj){
         $('.qrWrap').append('<p class="user' + obj.username + '">' + '用户：' + obj.username + '操作了<span>0</span>' +'次</p>');
      });
 
     //监听服务器端msg方法
      socket.on('msg', function (obj) {
        console.log(obj);
      });


      // 监听服务器端 userEvent动作，客户端用户的动作
       socket.on('listenUserE', function(obj){
       
          $('.user' + obj.username).find('span').html(obj.count);
         
      });

       //监听服务器端 userLoginOut动作,客户端用户退出操作
      socket.on('userLoginOut', function(obj){

        var userStr = '.user' + obj.username;
        console.log('用户：' + obj.username + '退出了房间' + obj.roomID);
        $('.qrWrap').find(userStr).remove();
        
      });
      