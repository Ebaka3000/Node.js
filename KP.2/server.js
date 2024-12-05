const express = require('express');
const axios = require('axios');
const path = require('path');

// Создаем экземпляр Express
const app = express();
const port = 3000;

// Устанавливаем путь к папке с шаблонами EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Обработчик маршрутов
app.get('/:number/news/for/:category', async (req, res) => {
  const { number, category } = req.params;

  // Проверка на корректность числа
  if (isNaN(number) || number <= 0) {
    return res.status(400).send('Неверный формат числа');
  }

  // Определяем RSS-URL для нужной категории
  const categoryUrls = {
    business: 'https://www.vedomosti.ru/rss/rubric/business',
    economic: 'https://www.vedomosti.ru/rss/rubric/economic',
    finances: 'https://www.vedomosti.ru/rss/rubric/finances',
    politics: 'https://www.vedomosti.ru/rss/rubric/politics',
  };

  const rssUrl = categoryUrls[category];

  if (!rssUrl) {
    return res.status(404).send('Категория не найдена');
  }

  try {
    // Формируем запрос для rss2json
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

    // Получаем данные с внешнего сервиса
    const response = await axios.get(apiUrl);
    const newsItems = response.data.items.slice(0, number); // Ограничиваем количество новостей

    // Отправляем HTML-шаблон
    res.render('news', {
      number,
      category: category.charAt(0).toUpperCase() + category.slice(1), // Преобразуем первую букву в заглавную
      newsItems,
    });

  } catch (error) {
    console.error(error);
    res.status(500).send('Ошибка при получении данных');
  }
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер работает на http://localhost:${port}`);
});
