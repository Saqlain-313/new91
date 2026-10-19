import connection from '../config/connectDB';
require('dotenv').config();

const sendMessageAdmin = (io) => {
    io.on('connection', (socket) => {
        // ==================== EVENT HANDLERS ====================
        // Wrapper to safely handle events + optional logging
        const relay = (eventName) => {
            socket.on(eventName, (msg) => {
                try {
                    io.emit(eventName, msg);
                } catch (err) {
                    console.error(`[socket] error relaying "${eventName}":`, err.message);
                }
            });
        };

        relay('data-server');
        relay('data-server_2');
        relay('data-server-5');
        relay('data-server-3');

        // Optional: log disconnects for debugging
        // socket.on('disconnect', (reason) => {
        //     console.log(`[socket] disconnected: ${socket.id} (${reason})`);
        // });
    });
};

module.exports = {
    sendMessageAdmin,
};