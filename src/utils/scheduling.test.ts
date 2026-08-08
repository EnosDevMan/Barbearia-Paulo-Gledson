import { describe, expect, it } from 'vitest';
import { generateSlotStartMinutes, getAvailability } from './scheduling';

describe('generateSlotStartMinutes', () => {
  it.each([
    { interval: 0, expected: [540, 570, 600, 630] },
    { interval: 5, expected: [540, 575, 610] },
    { interval: 10, expected: [540, 580, 620] },
    { interval: 15, expected: [540, 585] },
    { interval: 20, expected: [540, 590] },
    { interval: 30, expected: [540, 600] },
  ])('avança duração + $interval minutos', ({ interval, expected }) => {
    expect(generateSlotStartMinutes(540, 660, 30, interval)).toEqual(expected);
  });

  it('não oferece um horário cujo serviço e intervalo ultrapassem o fechamento', () => {
    expect(generateSlotStartMinutes(540, 639, 30, 10)).toEqual([540, 580]);
  });

  it('suporta serviços de durações diferentes', () => {
    expect(generateSlotStartMinutes(540, 660, 20, 10)).toEqual([540, 570, 600, 630]);
    expect(generateSlotStartMinutes(540, 660, 45, 15)).toEqual([540, 600]);
  });

  it('rejeita configurações que não podem produzir horários válidos', () => {
    expect(generateSlotStartMinutes(540, 660, 0, 10)).toEqual([]);
    expect(generateSlotStartMinutes(540, 660, 30, -1)).toEqual([]);
    expect(generateSlotStartMinutes(660, 540, 30, 10)).toEqual([]);
  });
});

describe('getAvailability', () => {
  const input = {
    barberId: 'barber-1',
    date: '2026-08-10',
    duration: 30,
    intervalMinutes: 0,
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

  it('respeita fechamento e horários distintos por dia da semana', () => {
    const weeklySchedule = {
      1: { open: '10:00', close: '12:00', breakStart: '10:30', breakEnd: '11:00' },
      2: { open: '09:00', close: '11:00', closed: true },
    };

    const monday = getAvailability({
      ...input,
      bookings: [],
      shopHours: { ...input.shopHours, weeklySchedule },
    });
    expect(monday.map(slot => [slot.time, slot.status])).toEqual([
      ['10:00', 'available'],
      ['10:30', 'break'],
      ['11:00', 'available'],
      ['11:30', 'available'],
    ]);

    expect(getAvailability({
      ...input,
      date: '2026-08-11',
      bookings: [],
      shopHours: { ...input.shopHours, weeklySchedule },
    })).toEqual([]);
  });
});
