import { Barber, Booking, ScheduleBlock, Service, WorkingHours } from '../types';
import { minutesToTime, timeToMinutes, getWeekdayFromISODate } from './validation';

export type SlotStatus = 'available' | 'occupied' | 'blocked' | 'break' | 'closed';

export interface AvailabilitySlot {
  time: string;
  status: SlotStatus;
  reason?: string;
}

export interface AvailabilityInput {
  barberId: string;
  date: string;
  duration: number;
  intervalMinutes: number;
  shopHours: WorkingHours;
  barber?: Barber;
  bookings: Booking[];
  blocks: ScheduleBlock[];
  services: Service[];
  excludeBookingId?: string;
  /** Use this only in customer flows; admin schedules should also show elapsed slots. */
  unavailableBeforeMinutes?: number;
}

const overlaps = (aStart: number, aEnd: number, bStart: number, bEnd: number) =>
  aStart < bEnd && aEnd > bStart;

/** Resolves a weekday without discarding the legacy open/close/daysOpen format. */
export function resolveDailyHours(hours: WorkingHours, weekday: number) {
  const configured = hours.weeklySchedule?.[weekday];
  if (configured) return configured;
  return { open: hours.open, close: hours.close, closed: !hours.daysOpen.includes(weekday), breakStart: hours.breakStart, breakEnd: hours.breakEnd };
}

export function generateSlotStartMinutes(open: number, close: number, duration: number, interval: number): number[] {
  if (duration <= 0 || interval < 0 || close <= open) return [];
  const length = duration + interval;
  const starts: number[] = [];
  for (let current = open; current + length <= close; current += length) starts.push(current);
  return starts;
}

const bookingDuration = (booking: Booking, services: Service[]) =>
  booking.serviceId.split(',').reduce((total, id) => total + (services.find(service => service.id === id.trim())?.duration ?? 30), 0);

/**
 * Single, side-effect-free availability engine used by public, customer and
 * administrative scheduling. It is deliberately independent from React and
 * persistence so the exact same business rules can be tested and reused.
 */
export function getAvailability(input: AvailabilityInput): AvailabilitySlot[] {
  const weekday = getWeekdayFromISODate(input.date);
  if (weekday === null || input.duration <= 0) return [];

  const baseHours = input.barber?.workingHours ?? input.shopHours;
  const daily = resolveDailyHours(baseHours, weekday);
  const special = input.blocks.find(block => block.type === 'special' && block.date === input.date && block.specialHours && (block.barberId === 'all' || block.barberId === input.barberId));
  const hours = special?.specialHours ?? daily;
  if (!special && daily.closed) return [];

  const open = timeToMinutes(hours.open);
  const close = timeToMinutes(hours.close);
  return generateSlotStartMinutes(open, close, input.duration, input.intervalMinutes).map(start => {
    const time = minutesToTime(start);
    const end = start + input.duration + input.intervalMinutes;
    if (input.unavailableBeforeMinutes !== undefined && start <= input.unavailableBeforeMinutes) return { time, status: 'closed', reason: 'Horário encerrado' };
    if (hours.breakStart && hours.breakEnd && overlaps(start, end, timeToMinutes(hours.breakStart), timeToMinutes(hours.breakEnd))) return { time, status: 'break', reason: 'Intervalo' };

    const block = input.blocks.find(item => {
      if (item.barberId !== 'all' && item.barberId !== input.barberId) return false;
      if (item.type === 'special' && item.specialHours) return false;
      const applies = item.date === input.date || (!!item.startDate && !!item.endDate && input.date >= item.startDate && input.date <= item.endDate);
      if (!applies) return false;
      if (item.type !== 'block') return true;
      return overlaps(start, end, timeToMinutes(item.startTime ?? '00:00'), timeToMinutes(item.endTime ?? '23:59'));
    });
    if (block) return { time, status: 'blocked', reason: block.reason || 'Bloqueado' };

    const occupied = input.bookings.some(booking => {
      if (booking.id === input.excludeBookingId || booking.status === 'Cancelado' || booking.barberId !== input.barberId || booking.date !== input.date) return false;
      const bookedStart = timeToMinutes(booking.time);
      return overlaps(start, end, bookedStart, bookedStart + bookingDuration(booking, input.services) + input.intervalMinutes);
    });
    return occupied ? { time, status: 'occupied', reason: 'Ocupado' } : { time, status: 'available' };
  });
}

export const getAvailableSlotTimes = (input: AvailabilityInput) =>
  getAvailability(input).filter(slot => slot.status === 'available').map(slot => slot.time);
