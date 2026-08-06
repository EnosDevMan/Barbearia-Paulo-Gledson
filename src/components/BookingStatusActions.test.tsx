import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BookingStatusActions } from './BookingStatusActions';
import { Booking, BookingStatus } from '../types';

const createBooking = (status: BookingStatus): Booking => ({
  id: 'booking-1',
  customerId: 'customer-1',
  customerName: 'Cliente',
  customerPhone: '11999999999',
  barberId: 'barber-1',
  serviceId: 'service-1',
  date: '2026-08-05',
  time: '10:00',
  status,
  feePaid: false,
  value: 50,
  createdAt: '2026-08-01T10:00:00Z',
});

describe('BookingStatusActions', () => {
  it.each([
    ['Aguardando pagamento', 'Confirmar PIX', 'Confirmado'],
    ['Confirmado', 'Atender', 'Em atendimento'],
    ['Em atendimento', 'Concluir', 'Concluído'],
  ] as const)('oferece a próxima transição válida para %s', (current, label, next) => {
    const handleStatusChange = vi.fn();
    render(
      <BookingStatusActions
        booking={createBooking(current)}
        handleStatusChange={handleStatusChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: label }));

    expect(handleStatusChange).toHaveBeenCalledWith('booking-1', next);
    expect(screen.getByRole('button', { name: 'Faltou' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
  });

  it.each(['Concluído', 'Cancelado', 'Não compareceu', 'Reagendado'] as const)(
    'não oferece ações para o status %s',
    (status) => {
      const { container } = render(
        <BookingStatusActions booking={createBooking(status)} handleStatusChange={vi.fn()} />,
      );

      expect(container).toBeEmptyDOMElement();
    },
  );
});
