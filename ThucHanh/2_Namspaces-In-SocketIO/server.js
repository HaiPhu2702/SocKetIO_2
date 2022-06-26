const {createServer}=require('http');
const {Server}=require('socket.io')
const fs = require("fs");

const httpServer=createServer((req, res) => {
    res.writeHead(200,{"Content-Type": "text/html"})
    fs.createReadStream('list.html').pipe(res)
})

const io=new Server(httpServer)
const gameRooms=['room1','room2','room3']

io.of('/games')
    .on('connection',socket=>{

    socket.on('joinRoom',room=>{
        if(gameRooms.includes(room)){
            socket.join(room);
            io.of('/games').in(room).emit('newUser','new Player has join '+room)
            return  socket.emit('success','join success'+room)
        }else {
            socket.emit('err',room+'do not exits')
        }
        socket.disconnect()
    })
})
httpServer.listen(8080,()=>{
    console.log("server listening at 8080")
})