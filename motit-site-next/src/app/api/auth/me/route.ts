import { NextRequest, NextResponse } from 'next/server';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';

export async function GET(request: NextRequest) {
  try {
    // Получаем токен из cookies или заголовков
    const token = request.cookies.get('strapi_jwt')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }

    // Запрашиваем пользователя из Strapi
    const response = await fetch(`${STRAPI_URL}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }

    const user = await response.json();
    return NextResponse.json({ data: user });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка' },
      { status: 500 }
    );
  }
}