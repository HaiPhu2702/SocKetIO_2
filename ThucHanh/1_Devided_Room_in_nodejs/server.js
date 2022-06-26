
const {createServer}=require('http');
const {Server}=require('socket.io');
const fs = require("fs");
const port=8080;
const mimeTypes={
    "html":"text/html",
    'css':"text/css",
    'js':"text/javascript"
}

const httpServer= createServer((req, res) => {
    if(req.url === '/'){
        res.writeHead(200,{"Content-Type": "text/html"})
        fs.createReadStream('./templates/list.html').pipe(res);
    }else {

        const findFileTail=req.url.match(/\.js|.css/);
        if(findFileTail){
            const tail= mimeTypes[findFileTail[0].toString().split('.')[1]]
            res.writeHead(200,{"Content-Type":tail})
            fs.createReadStream(__dirname+"/"+req.url).pipe(res);
        }
    }
})

const io=new Server(httpServer)
let userNames={};
const listRooms=['Lobby'];

io.sockets.on('connection',socket=>{

    socket.on('adduser',(userName,nameRoom)=>{
        socket.username=userName;
        socket.room=nameRoom;

        userNames[userName]=userName;

        socket.join(nameRoom);

        if(nameRoom !==null && listRooms.indexOf(nameRoom)<0){
            listRooms.push(nameRoom);
        }

        socket.emit('connect-room',`you: have connected to ${nameRoom} success`)
        socket.broadcast.to(nameRoom).emit('connect-room',`${userName}: has connected to listRooms`)

        socket.emit('update-room',listRooms,nameRoom)

    })

    socket.on('sendChat',dataMessage=>{
        io.sockets.to(socket.room).emit('connect-room',`${socket.username}:${dataMessage}`)
    })


    socket.on('switchRoom',newRoom=>{
        socket.leave(socket.room)
        socket.join(newRoom)
        socket.emit('connect-room',`you have connected to ${newRoom} success`)
        socket.broadcast.to(socket.room).emit('connect-room',`${socket.username} has left this room`)
        socket.room=newRoom;
        socket.broadcast.to(newRoom).emit("connect-room",`${socket.username} has joined this room`) ;
        socket.emit('update-room',listRooms,newRoom)
    })


    socket.on("disconnect",()=>{
        delete userNames[socket.username]


        socket.broadcast.emit("connect-room",`${socket.username} has disconnected`)
        socket.leave(socket.room)
    })
    
})

httpServer.listen(port,()=>{
    console.log(`server listening http://localhost:${port}`)
})