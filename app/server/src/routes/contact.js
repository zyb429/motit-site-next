import { Router } from 'express';
import { sendEmail } from '../services/email.js';
import { sendToHelpDesk } from '../services/helpdesk.js';

const router = Router();

router.get('/', (req, res) => {
  console.log('✅ GET /api/contact - маршрут работает');
  res.json({
    message: '✅ Contact API работает!',
    endpoints: {
      get: 'GET /api/contact - проверка',
      post: 'POST /api/contact - отправка формы'
    }
  });
});

// Валидация данных
const validateContactData = (data) => {
  const errors = [];
  
  if (!data.name || data.name.trim().length < 2) {
    errors.push('Имя обязательно и должно содержать минимум 2 символа');
  }
  
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.push('Некорректный email');
  }
  
  if (!data.message || data.message.trim().length < 5) {
    errors.push('Сообщение слишком короткое');
  }
  
  return errors;
};

router.post('/', async (req, res) => {
  try {
    const rawData = req.body.data || req.body;
    const { name, email, phone, message } = rawData;

    console.log('Получена заявка:', { name, email, phone, message });

    // Валидация
    const validationErrors = validateContactData({ name, email, message });
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: validationErrors[0],
      });
    }

    const results = {
      email: null,
      helpDesk: null
    };

    // 1. Отправка на почту
    if (process.env.CONTACT_EMAIL && process.env.CONTACT_EMAIL !== 'manager@your-company.com') {
      try {
        results.email = await sendEmail({
            name: name.trim(),
            email: email.trim(),
            phone: phone || '',
            message: message.trim(),
            subject: `Новая заявка от ${name.trim()}`,
        });
        console.log('Email отправлен');
        } catch (emailError) {
            console.error('❌ Ошибка email:', emailError.message);
            results.email = { success: false, error: emailError.message };
        }
    } else {
      console.log('Email менеджера не настроен, письмо не отправлено');
      results.email = { success: true, message: 'Email не настроен (тестовый режим)' };
    }

    // 2. Отправка в Help Desk
    let helpDeskResult = null;
    if (process.env.HELP_DESK_TYPE && process.env.HELP_DESK_TYPE !== 'none') {
      helpDeskResult = await sendToHelpDesk({
        name: name.trim(),
        email: email.trim(),
        phone: phone || '',
        message: message.trim(),
        subject: `Заявка от ${name.trim()}`,
        priority: 'medium',
        department: 'support',
      });
      
    }

     // Проверяем, был ли успех хотя бы в одном канале
    const hasSuccess = results.email?.success || results.helpDesk?.success;

    if (!hasSuccess) {
        if (process.env.HELP_DESK_TYPE === 'none' && !process.env.CONTACT_EMAIL) {
            console.warn('Нет настроенных каналов!');
            return res.status(500).json({
                error: "Система отправки не настроена. Обратитесь к администратору."
            });
        }
        throw new Error('Не удалось отправить заявку ни в один канал');
    }

    res.json(
        {
            success: true,
            message: 'Заявка успешно отправлена',
            results,
        }
    );
  } catch (error) {
    console.error('Ошибка в маршруте контактов:', error);
    res.status(500).json({
      error: error.message || 'Не удалось отправить заявку. Попробуйте позже.',
    });
  }
});

export default router;