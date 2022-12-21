var sql = require("mssql");
const { getUser } = require("./controllers/adminController");

exports.init = function(io) {

    io.on('connection', function(socket) {
        console.log('Connection Setup to socket');

        socket.on('setEMPID', async (id) => {

            console.log(id)
            socket.user = id;
            await sql.query(`update JWT set Online = '1' where EMPID = ${id}`);

            io.sockets.emit('updated-wqs');
        })

    
        socket.on('update-wqs', () => {
            io.sockets.emit('updated-wqs');
        })


        socket.on('update-reminder', () => {
            io.sockets.emit('updated-reminder');
        })

        
        socket.on('disconnect', async  function () { 

            if(socket.user == undefined) {
                return 
            }

        
            io.sockets.emit('updated-wqs');
            sql.query(`update JWT set Online = '0' where EMPID = ${socket.user}`);

            let user =  await getUser(socket.user) 
            await sql.query(`UPDATE IncomingWQ set InProgress = '0' where InProgress = '1' and UserAssigned = '${user.Nickname}'`)
        });


        socket.on('disconnected', async  function () {

            if(socket.user == undefined) {
                return 
            }
                io.sockets.emit('updated-wqs');
                sql.query(`update JWT set Online = '0' where EMPID = ${socket.user}`);

                let user =  await getUser(socket.user) 
                await sql.query(`UPDATE IncomingWQ set InProgress = '0' where InProgress = '1' and UserAssigned = '${user.Nickname}'`)

                console.log('DISCONNECT!!')
        });

        
    })
} 