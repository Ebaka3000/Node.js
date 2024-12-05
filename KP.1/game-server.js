const net = require('net');

// Слушаем на порту 5555
const server = net.createServer((socket) => {
  let min, max;
  
  // Приветствие и логирование
  console.log('Клиент подключен');
  
  // Чтение данных от клиента
  socket.on('data', (data) => {
    try {
      const message = JSON.parse(data.toString());
      
      if (message.range) {
        // Получаем диапазон
        const range = message.range.split('-');
        min = parseInt(range[0], 10);
        max = parseInt(range[1], 10);
        console.log(`Диапазон: от ${min} до ${max}`);
        
        // Отправляем первое предположение (среднее число диапазона)
        const guess = Math.floor((min + max) / 2);
        socket.write(JSON.stringify({ answer: guess }) + '\n');
        
      } else if (message.hint) {
        // Обработка подсказок от клиента
        if (message.hint === 'more') {
          min = Math.floor((min + max + 1) / 2);
        } else if (message.hint === 'less') {
          max = Math.floor((min + max - 1) / 2);
        }
        
        // Новое предположение
        const guess = Math.floor((min + max) / 2);
        console.log(`Сервер пытается угадать: ${guess}`);
        socket.write(JSON.stringify({ answer: guess }) + '\n');
      }
    } catch (e) {
      console.log('Ошибка при обработке данных: ', e.message);
    }
  });

  // Обработка закрытия соединения
  socket.on('end', () => {
    console.log('Клиент отключился');
  });
});

// Запуск сервера
server.listen(5555, () => {
  console.log('Сервер запущен на порту 5555');
});
