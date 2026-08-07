import { useCallback } from 'react';
import { useAuth } from '../auth/hooks/useAuth';
import { useConfigStore } from './configStore';
import { useDataStore } from './dataStore';
import { timeToMinutes, minutesToTime, getBarbershopNow, getWeekdayFromISODate } from '../utils/validation';
import { generateSlotStartMinutes } from '../utils/scheduling';
import { Booking } from '../types';

/**
 * Verifica se dois intervalos [aStart, aEnd) e [bStart, bEnd) se sobrepõem.
 */
function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && aEnd > bStart;
}

export const useAppStore = () => {
  const authState = useAuth();
  const configState = useConfigStore();
  const dataState = useDataStore();

  /**
   * Verifica conflitos de horário usando os agendamentos já carregados
   * localmente, mais uma lista opcional de intervalos ocupados extra.
   *
   * IMPORTANTE: esta função é usada apenas para a experiência do usuário
   * (mostrar quais horários parecem livres). A garantia real contra
   * conflitos de agendamento (condição de corrida) deve acontecer no
   * backend quando ele existir.
   */
  const isSlotAvailable = useCallback((
    barberId: string,
    date: string,
    time: string,
    duration: number,
    extraBookedIntervals: { time: string; duration: number }[] = [],
    excludeBookingId?: string
  ): boolean => {
    const startMins = timeToMinutes(time);
    const endMins = startMins + duration + configState.config.intervalMinutes; // Added buffer

    const bookingDurationOf = (booking: Booking) =>
      booking.serviceId.split(',').reduce((sum, subId) => {
        const s = dataState.services.find(x => x.id === subId.trim());
        return sum + (s ? s.duration : 30);
      }, 0);

    const hasBookingConflict = dataState.bookings.some(booking => {
      if (booking.id === excludeBookingId) return false;
      if (booking.date !== date) return false;
      if (booking.status === 'Cancelado') return false;
      if (barberId && booking.barberId !== barberId) return false;

      const bookingStart = timeToMinutes(booking.time);
      const bookingEnd = bookingStart + bookingDurationOf(booking);
      return overlaps(startMins, endMins, bookingStart, bookingEnd);
    });

    if (hasBookingConflict) return false;

    const hasExtraConflict = extraBookedIntervals.some(interval => {
      const bookingStart = timeToMinutes(interval.time);
      const bookingEnd = bookingStart + (interval.duration || 30);
      return overlaps(startMins, endMins, bookingStart, bookingEnd);
    });

    if (hasExtraConflict) return false;

    // Check blocks
    const hasBlockConflict = dataState.scheduleBlocks.some(block => {
      // Dia com horário especial (ex: véspera de feriado com expediente
      // reduzido): bloqueia apenas fora da janela especial (e no
      // intervalo de pausa, se houver) — diferente de um bloqueio de dia
      // inteiro. Antes desta correção, TODO bloqueio 'special' fechava o
      // dia inteiro, mesmo quando tinha um horário customizado configurado.
      if (block.type === 'special' && block.specialHours && block.date === date) {
        if (block.barberId !== 'all' && barberId && block.barberId !== barberId) return false;

        const specialOpenMins = timeToMinutes(block.specialHours.open);
        const specialCloseMins = timeToMinutes(block.specialHours.close);
        if (startMins < specialOpenMins || endMins > specialCloseMins) return true;

        if (block.specialHours.breakStart && block.specialHours.breakEnd) {
          const breakStart = timeToMinutes(block.specialHours.breakStart);
          const breakEnd = timeToMinutes(block.specialHours.breakEnd);
          if (overlaps(startMins, endMins, breakStart, breakEnd)) return true;
        }
        return false;
      }

      // Bloqueios de dia inteiro: folga (offday), férias (vacation) e
      // feriado/data especial sem horário customizado.
      if (block.type === 'vacation' || (block.type === 'special' && !block.specialHours) || block.type === 'offday') {
        if (block.barberId !== 'all' && barberId && block.barberId !== barberId) return false;

        if (block.date && block.date === date) return true;

        if (block.startDate && block.endDate) {
          if (date >= block.startDate && date <= block.endDate) return true;
        }
        return false;
      }

      // Specific time block
      if (block.type === 'block') {
        if (block.date !== date) return false;
        if (block.barberId !== 'all' && barberId && block.barberId !== barberId) return false;

        const blockStart = timeToMinutes(block.startTime || '00:00');
        const blockEnd = timeToMinutes(block.endTime || '23:59');

        return overlaps(startMins, endMins, blockStart, blockEnd);
      }

      return false;
    });

    return !hasBlockConflict;
  }, [dataState.bookings, dataState.scheduleBlocks, dataState.services, configState.config.intervalMinutes]);

  /** Bloqueio 'special' com horário customizado para esta data/barbeiro, se houver. */
  const findSpecialHoursOverride = useCallback((barberId: string, date: string) => {
    return dataState.scheduleBlocks.find(block =>
      block.type === 'special' &&
      block.specialHours &&
      block.date === date &&
      (block.barberId === 'all' || !barberId || block.barberId === barberId)
    );
  }, [dataState.scheduleBlocks]);

  /**
   * Calcula os horários disponíveis para um barbeiro/serviço/data.
   */
  const getAvailableSlots = useCallback(async (barberId: string, serviceId: string, date: string): Promise<string[]> => {
    if (!serviceId || !barberId || !date) return [];

    const duration = serviceId.split(',').reduce((sum, subId) => {
      const s = dataState.services.find(x => x.id === subId.trim());
      return sum + (s ? s.duration : 0);
    }, 0);

    if (duration === 0) return [];

    const slots: string[] = [];
    const barber = dataState.barbers.find(b => b.id === barberId);
    const barberHours = barber?.workingHours || configState.config.workingHours;

    // Se houver um "horário especial" configurado para esta data/barbeiro,
    // a janela de horário do dia é a especial, não a regular.
    const specialOverride = findSpecialHoursOverride(barberId, date);
    const weekday = getWeekdayFromISODate(date);

    // Horários especiais abrem/alteram explicitamente a data. Fora deles,
    // respeite daysOpen; antes, domingos e folgas semanais exibiam todos os
    // horários regulares como disponíveis.
    if (!specialOverride && (weekday === null || !barberHours.daysOpen.includes(weekday))) {
      return [];
    }
    const effectiveOpen = specialOverride?.specialHours?.open ?? barberHours.open;
    const effectiveClose = specialOverride?.specialHours?.close ?? barberHours.close;
    const effectiveBreakStart = specialOverride?.specialHours?.breakStart ?? barberHours.breakStart;
    const effectiveBreakEnd = specialOverride?.specialHours?.breakEnd ?? barberHours.breakEnd;

    const openMins = timeToMinutes(effectiveOpen);
    const closeMins = timeToMinutes(effectiveClose);
    const interval = configState.config.intervalMinutes;

    // "Agora" no fuso horário da barbearia (não o fuso do dispositivo do
    // cliente), para que a regra de "não permitir agendar nos próximos 30
    // minutos" funcione corretamente para qualquer visitante.
    const { dateStr: todayStr, hours: nowHours, minutes: nowMinutes } = getBarbershopNow();
    const nowMins = nowHours * 60 + nowMinutes;

    // Cada candidato começa somente depois da duração do serviço anterior e
    // do intervalo de preparação configurado. Antes, o laço avançava apenas
    // `interval`, criando candidatos em uma cadência incorreta.
    const candidateStarts = generateSlotStartMinutes(openMins, closeMins, duration, interval);
    for (const current of candidateStarts) {
      const timeStr = minutesToTime(current);

      if (date === todayStr && current <= nowMins + 30) {
        continue;
      }

      if (effectiveBreakStart && effectiveBreakEnd) {
        const breakStart = timeToMinutes(effectiveBreakStart);
        const breakEnd = timeToMinutes(effectiveBreakEnd);
        if (overlaps(current, current + duration + interval, breakStart, breakEnd)) continue;
      }

      if (isSlotAvailable(barberId, date, timeStr, duration)) {
        slots.push(timeStr);
      }
    }
    return slots;
  }, [dataState.services, dataState.barbers, configState.config, isSlotAvailable, findSpecialHoursOverride]);

  const { loading: authLoading, error: authError, ...restAuthState } = authState;

  return {
    ...restAuthState,
    authLoading,
    authError,
    ...configState,
    ...dataState,
    isSlotAvailable,
    getAvailableSlots,
  };
};
