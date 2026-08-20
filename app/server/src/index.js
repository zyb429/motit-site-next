import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import contactRoutes from './routes/contact.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000', 'http://localhost:5173', 'http://localhost:5000',
    process.env.CLIENT_URL
  ].filter(Boolean),
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Логирование всех запросов
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Body:', req.body);
  next();
});

// Маршруты
app.use('/api/contact', contactRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Корневой путь
app.get('/', (req, res) => {
  res.json({
    name: 'Motit Site API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      contact: '/api/contact (POST)'
    }
  });
});

// Обработка ошибок
app.use((req, res) => {
  console.log(`404: ${req.method} ${req.url}`);
  res.status(404).json({
    error: 'Not Found',
    message: `Маршрут ${req.method} ${req.url} не найден`
  });
});

app.use((err, req, res, next) => {
  console.error('Ошибка:', err);
  res.status(500).json({
    error: 'Внутренняя ошибка сервера',
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`API: http://localhost:${PORT}/api`);
  console.log(`SMTP: ${process.env.SMTP_HOST || 'не настроен'}`);
  console.log(`CORS разрешен для: ${process.env.CLIENT_URL}`);
});