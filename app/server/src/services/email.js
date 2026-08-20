import nodemailer from 'nodemailer';

export async function sendEmail(data) {
  const { name, email, phone, message } = data;

  // Проверка наличия SMTP настроек
  if (!process.env.SMTP_HOST) {
    console.warn('⚠️ SMTP не настроен! Письмо не отправлено.');
    return { 
      success: false, 
      message: 'SMTP не настроен',
      testMode: true
    };
  }

  try {

    // Настройка SMTP транспорта
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
        },
        // Для Gmail важно
        tls: {
            rejectUnauthorized: false, // Для теста
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000,
        requireTLS: true,
    });

    // Проверка соединения
    await transporter.verify();

    // Формирование HTML письма
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { 
            background: #0a1920; 
            color: #2dd4bf; 
            padding: 20px; 
            border-radius: 8px 8px 0 0; 
            }
            .content { 
            background: #f8fafc; 
            padding: 20px; 
            border-radius: 0 0 8px 8px; 
            }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #475569; }
            .value { 
            margin-top: 5px; 
            padding: 10px; 
            background: white; 
            border-radius: 4px; 
            border: 1px solid #e2e8f0; 
            }
            .footer { 
            margin-top: 20px; 
            padding-top: 20px; 
            border-top: 1px solid #e2e8f0; 
            font-size: 12px; 
            color: #94a3b8; 
            }
        </style>
        </head>
        <body>
        <div class="container">
            <div class="header">
            <h2>📩 Новая заявка с сайта</h2>
            </div>
            <div class="content">
            <div class="field">
                <div class="label">👤 Имя</div>
                <div class="value">${name}</div>
            </div>
            <div class="field">
                <div class="label">📧 Email</div>
                <div class="value">${email}</div>
            </div>
            ${phone ? `
                <div class="field">
                <div class="label">📱 Телефон</div>
                <div class="value">${phone}</div>
                </div>
            ` : ''}
            <div class="field">
                <div class="label">💬 Сообщение</div>
                <div class="value">${message.replace(/\n/g, '<br>')}</div>
            </div>
            <div class="footer">
                Отправлено: ${new Date().toLocaleString('ru-RU')}
            </div>
            </div>
        </div>
        </body>
        </html>
    `;

    const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || 'Сайт'}" <${process.env.SMTP_FROM_EMAIL}>`,
        to: process.env.CONTACT_EMAIL,
        subject: `Новая заявка от ${name}`,
        html: htmlContent,
        text: `
        Новая заявка с сайта Motit
        
        Имя: ${name}
        Email: ${email}
        ${phone ? `Телефон: ${phone}` : ''}
        Сообщение: ${message}

        ---
        Отправлено: ${new Date().toLocaleString('ru-RU')}
        `,
        replyTo: email,
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Письмо отправлено:', process.env.CONTACT_EMAIL);
    console.log('📧 ID письма:', info.messageId);
    
    return {
        success: true,
        messageId: info.messageId,
        message: `Письмо отправлено на ${process.env.CONTACT_EMAIL}`
    };
    } catch (error) {
        console.error('❌ Ошибка отправки письма:', error.message);
        return { 
        success: false, 
        error: error.message 
        };
    }
}