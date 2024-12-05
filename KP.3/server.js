const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 8080 });
const clients = new Map();

server.on('connection', (socket) => {
    let userData = null;

    socket.on('message', (data) => {
        try {
            const parsed = JSON.parse(data);

            if (parsed.type === 'intro') {
                userData = { username: parsed.username, color: parsed.color };
                clients.set(socket, userData);

                socket.send(JSON.stringify({
                    type: 'system',
                    text: `Добро пожаловать, ${userData.username}! В чате уже присутствуют: ${
                        [...clients.values()]
                            .filter((u) => u !== userData)
                            .map((u) => u.username)
                            .join(', ') || 'никто'
                    }.`,
                }));

                broadcast({
                    type: 'system',
                    text: `${userData.username} присоединился к чату.`,
                }, socket);

            } else if (parsed.type === 'message') {
                broadcast({
                    type: 'message',
                    username: userData.username,
                    text: parsed.text,
                    color: userData.color,
                });

            } else if (parsed.type === 'private') {
                const recipient = [...clients.entries()].find(
                    ([, u]) => u.username === parsed.to
                );
                if (recipient) {
                    recipient[0].send(JSON.stringify({
                        type: 'private',
                        username: userData.username,
                        text: parsed.text,
                        color: userData.color,
                    }));
                } else {
                    socket.send(JSON.stringify({
                        type: 'system',
                        text: `Пользователь ${parsed.to} не найден.`,
                    }));
                }
            }
        } catch (error) {}
    });

    socket.on('close', () => {
        if (userData) {
            clients.delete(socket);
            broadcast({
                type: 'system',
                text: `${userData.username} покинул чат.`,
            });
        }
    });
});

function broadcast(message, exclude = null) {
    for (const [client] of clients) {
        if (client !== exclude && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    }
}

console.log('WebSocket сервер запущен на ws://localhost:8080');
