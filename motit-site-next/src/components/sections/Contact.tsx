import { prisma } from '@/lib/prisma';
import ContactView, { type ContactViewProps } from './ContactView';

export type ContactProps = Omit<ContactViewProps, 'fields'>;

export default async function Contact(props: ContactProps) {
  const fields = await prisma.contactFormField.findMany({
    where: { enabled: true },
    orderBy: { sortOrder: 'asc' },
  });
  return <ContactView {...props} fields={fields} />;
}