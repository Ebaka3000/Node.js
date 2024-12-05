const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const bodyParser = require('body-parser');

// Создаем экземпляр приложения
const app = express();
const port = 3000;

// Подключаемся к SQLite базе данных
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'notes.db'  // База данных будет храниться в этом файле
});

// Создаем модель для заметки
const Note = sequelize.define('Note', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  content: {
    type: DataTypes.STRING,
    allowNull: false
  },
  created: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW
  },
  lastChanged: {  // Переименовали поле 'changed', чтобы избежать конфликта
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW
  }
});

// Middleware
app.use(bodyParser.json());

// Создаем таблицы (если они еще не существуют)
sequelize.sync();

// Получить все заметки
app.get('/notes', async (req, res) => {
  try {
    const notes = await Note.findAll();
    if (notes.length > 0) {
      res.status(200).json(notes);
    } else {
      res.status(404).json([]);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Получить заметку по id
app.get('/note/:id', async (req, res) => {
  try {
    const note = await Note.findByPk(req.params.id);
    if (note) {
      res.status(200).json(note);
    } else {
      res.status(404).json({ error: 'Note not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Получить заметку по названию
app.get('/note/read/:title', async (req, res) => {
  try {
    const note = await Note.findOne({ where: { title: req.params.title } });
    if (note) {
      res.status(200).json(note);
    } else {
      res.status(404).json({ error: 'Note not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Создать новую заметку
app.post('/note', async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(409).json({ error: 'Title and content are required' });
    }

    const newNote = await Note.create({ title, content });
    res.status(201).json(newNote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Удалить заметку по id
app.delete('/note/:id', async (req, res) => {
  try {
    const note = await Note.findByPk(req.params.id);
    if (note) {
      await note.destroy();
      res.status(204).send();
    } else {
      res.status(409).json({ error: 'Note not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Обновить заметку по id
app.put('/note/:id', async (req, res) => {
  try {
    const note = await Note.findByPk(req.params.id);
    if (note) {
      const { title, content } = req.body;

      // Обновление данных заметки
      note.title = title || note.title;
      note.content = content || note.content;
      note.lastChanged = Sequelize.NOW;

      await note.save();
      res.status(204).send();
    } else {
      res.status(409).json({ error: 'Note not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Запускаем сервер
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
