'use client';

import { useStrapiData, useStrapiItem } from './useStrapiData';
import type { TicketCommentAttributes, FetchOptions } from '@/types/strapi';

export function useTicketComments(ticketId: string | number, options: FetchOptions = {}) {
  const filters = { filters: { ticket: { id: { $eq: ticketId } } } };
  const defaultOptions: FetchOptions = {
    populate: ['user'],
    sort: ['createdAt:asc'],
    ...options,
    ...filters,
  };
  
  return useStrapiData<TicketCommentAttributes>('/ticket-comments', defaultOptions, {
    enabled: !!ticketId,
  });
}

export function useTicketComment(id: string | number, options: FetchOptions = {}) {
  const defaultOptions: FetchOptions = {
    populate: ['ticket', 'user'],
    ...options,
  };
  const { data, ...rest } = useStrapiItem<TicketCommentAttributes>('/ticket-comments', id, defaultOptions);
  return { comment: data?.data, ...rest };
}