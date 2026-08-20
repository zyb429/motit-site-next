export async function sendToHelpDesk(data) {
  const { name, email, phone, message, subject, priority, department } = data;
  
  const helpDeskType = process.env.HELP_DESK_TYPE || 'none';
  
  console.log(`📝 Отправка в Help Desk (${helpDeskType})...`);

  // 🎫 Интеграция с HESK через Mods for HESK API
  if (helpDeskType === 'hesk') {
    try {
      if (!process.env.HESK_API_TOKEN) {
        console.warn('HESK_API_TOKEN не настроен!');
        return {
            success: false,
            error: 'HESK_API_TOKEN не настроен!'
        };
      }

       if (!process.env.HESK_API_URL) {
        console.warn('HESK_API_URL не настроен!');
        return {
          success: false,
          error: 'HESK_API_URL не настроен'
        };
      }

      // Карта приоритетов HESK:
      // 0 = Критический, 1 = Высокий, 2 = Средний, 3 = Низкий
      const priorityMap = {
        'critical': 0,
        'high': 1,
        'normal': 2,
        'low': 3,
      };

      const requestBody = {
        name: name,
        email: email,
        category: parseInt(process.env.HESK_CATEGORY_ID) || 1,
        priority: priorityMap[priority] !== undefined ? priorityMap[priority] : 2,
        subject: subject || `Заявка от ${name}`,
        message: message,
        html: false,
        customFields: {}
      };


          // Если есть телефон, добавляем в кастомное поле (если настроено)
      if (phone) {
        // ID кастомного поля для телефона (настройте под свою систему)
        const phoneFieldId = process.env.HESK_PHONE_FIELD_ID || 1;
        requestBody.customFields[phoneFieldId] = phone;
      }

      console.log('Отправка в HESK:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(`${process.env.HESK_API_URL}/api/v1/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': process.env.HESK_API_TOKEN,
        },
        body: JSON.stringify(requestBody),
      });

      // Парсим ответ
      const result = await response.json();

      if (!response.ok) {
        console.error('Ошибка HESK API:', {
          status: response.status,
          statusText: response.statusText,
          result: result
        });
        throw new Error(`HESK API Error (${response.status}): ${result.message || 'Unknown error'}`);
      }

      console.log('Тикет в HESK создан:', result.id || result.ticket_id || result);
      return { 
        success: true, 
        ticketId: result.id || result.ticket_id,
        data: result
      };
      
    } catch (error) {
      console.error('Ошибка HESK API:', error.message);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  // ... остальные Help Desk системы
}