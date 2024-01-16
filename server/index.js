const http = require('http');
const server = http.createServer();

const io = require('socket.io')(server, {
    cors: { origin: '*' }
});

io.on('connection', (socket) => {
    console.log('Se ha conectado un cliente');

    socket.on('unirse_al_chat', (nombreUsuario) => {
        console.log(`${nombreUsuario} se ha unido al chat.`);

        io.emit('enviar_mensaje', {
            usuario: 'INFO',
            mensaje: `${nombreUsuario} se ha unido al chat.`
        });
    });

    socket.on('enviar_mensaje', (data) => {
        io.emit('enviar_mensaje', data);
    });

    socket.on('disconnect', () => {
        console.log('Usuario desconectado');
    });
});

server.listen(3000, () => {
    console.log('Servidor escuchando en el puerto 3000');
});
