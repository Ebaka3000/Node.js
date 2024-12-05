const net = require('net');
const readline = require('readline');

// Чтение диапазона чисел из аргументов командной строки
const min = parseInt(process.argv[2], 10);
const max = parseInt(process.argv[3], 10);

// Генерация случайного числа
const secretNumber = Math.floor(Math.random() * (max - min + 1)) + min;

// Создаем интерфейс для ввода
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Подключаемся к серверу
const client = new net.Socket();

client.connect(5555, 'localhost', () => {
  console.log(`Подключено к серверу. Диапазон: от ${min} до ${max}`);
  
  // Отправляем диапазон чисел на сервер
  client.write(JSON.stringify({ range: `${min}-${max}` }) + '\n');
});

client.on('data', (data) => {
  const response = JSON.parse(data.toString());
  console.log(`Ответ от сервера: ${JSON.stringify(response)}`);

  if (response.answer === secretNumber) {
    console.log("Сервер угадал число! Игра завершена.");
    client.end();
    rl.close();
  } else {
    // Отправляем подсказку
    let hint = response.answer < secretNumber ? "more" : "less";
    console.log(`Подсказка: ${hint}`);
    client.write(JSON.stringify({ hint }) + '\n');
  }
});

client.on('close', () => {
  console.log('Соединение с сервером закрыто');
});
