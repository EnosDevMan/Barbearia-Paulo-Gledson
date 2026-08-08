import { describe, expect, it } from 'vitest';
import { generateSlotStartMinutes, getAvailability } from './scheduling';

describe('generateSlotStartMinutes', () => {
  it.each([
    { interval: 5, expected: [540, 545, 550, 555, 560, 565, 570, 575, 580, 585, 590, 595, 600, 605, 610, 615, 620, 625] },
    { interval: 10, expected: [540, 550, 560, 570, 580, 590, 600, 610, 620] },
    { interval: 15, expected: [540, 555, 570, 585, 600, 615] },
    { interval: 20, expected: [540, 560, 580, 600] },
    { interval: 30, expected: [540, 570, 600] },
  ])('avança somente o intervalo de $interval minutos definido no admin', ({ interval, expected }) => {
    expect(generateSlotStartMinutes(540, 660, 30, interval)).toEqual(expected);
  });

  it('não oferece um horário cujo serviço e intervalo ultrapassem o fechamento', () => {
    expect(generateSlotStartMinutes(540, 639, 30, 10)).toEqual([540, 550, 560, 570, 580, 590]);
  });

  it('mantém a mesma grade para serviços de durações diferentes', () => {
    expect(generateSlotStartMinutes(540, 660, 20, 15)).toEqual([540, 555, 570, 585, 600, 615]);
    expect(generateSlotStartMinutes(540, 660, 45, 15)).toEqual([540, 555, 570, 585, 600]);
  });

  it('rejeita configurações que não podem produzir horários válidos', () => {
    expect(generateSlotStartMinutes(540, 660, 0, 10)).toEqual([]);
    expect(generateSlotStartMinutes(540, 660, 30, 0)).toEqual([]);
    expect(generateSlotStartMinutes(540, 660, 30, -1)).toEqual([]);
    expect(generateSlotStartMinutes(660, 540, 30, 10)).toEqual([]);
  });
});

describe('getAvailability', () => {
  const input = {
    barberId: 'barber-1',
    date: '2026-08-10',
    duration: 30,
    intervalMinutes: 30,
    shopHours: { open: '09:00', close: '11:00', daysOpen: [1] },
    bookings: [{
      id: 'booking-1', customerId: 'customer-1', customerName: 'Cliente',
      customerPhone: '85999999999', barberId: 'barber-1', serviceId: 'service-1',
      date: '2026-08-10', time: '09:00', status: 'Confirmado' as const,
      feePaid: true, value: 30, createdAt: '2026-08-01T00:00:00Z',
    }],
    blocks: [],
    services: [{ id: 'service-1', name: 'Corte', duration: 30, price: 30, description: '', category: 'Corte' }],
  };

  it('mantém o horário ocupado nos fluxos de criação', () => {
    expect(getAvailability(input).find(slot => slot.time === '09:00')?.status).toBe('occupied');
  });

  it('ignora somente o próprio agendamento durante o reagendamento', () => {
    expect(getAvailability({ ...input, excludeBookingId: 'booking-1' }).find(slot => slot.time === '09:00')?.status).toBe('available');
  });

  it('oferece candidatos na grade do admin, não na duração do serviço', () => {
    const slots = getAvailability({
      ...input,
      bookings: [],
      duration: 45,
      intervalMinutes: 30,
    });

    expect(slots.map(slot => slot.time)).toEqual(['09:00', '09:30']);
  });
});
