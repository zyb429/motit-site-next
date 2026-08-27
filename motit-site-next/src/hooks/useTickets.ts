'use client';

import { useStrapiData, useStrapiItem } from './useStrapiData';
import type { TicketAttributes, FetchOptions } from '@/types/strapi';

export function useTickets(options: FetchOptions = {}) {
  // По умолчанию загружаем все связи
  const defaultOptions: FetchOptions = {
    populate: ['client', 'assigned_to', 'ticket_status', 'priority', 'category'],
    ...options,
  };
  return useStrapiData<TicketAttributes>('/tickets', defaultOptions);
}

export function useTicket(id: string | number, options: FetchOptions = {}) {
  const defaultOptions: FetchOptions = {
    populate: ['client', 'assigned_to', 'ticket_status', 'priority', 'category', 'comments'],
    ...options,
  };
  const { data, ...rest } = useStrapiItem<TicketAttributes>('/tickets', id, defaultOptions);
  return { ticket: data?.data, ...rest };
}

export function useTicketsByStatus(statusId: number, options: FetchOptions = {}) {
  const filters = { filters: { ticket_status: { id: { $eq: statusId } } } };
  return useStrapiData<TicketAttributes>('/tickets', {
    populate: ['client', 'assigned_to', 'priority', 'category'],
    ...options,
    ...filters,
  });
}

export function useTicketsByClient(clientId: number, options: FetchOptions = {}) {
  const filters = { filters: { client: { id: { $eq: clientId } } } };
  return useStrapiData<TicketAttributes>('/tickets', {
    populate: ['assigned_to', 'ticket_status', 'priority', 'category'],
    ...options,
    ...filters,
  });
}