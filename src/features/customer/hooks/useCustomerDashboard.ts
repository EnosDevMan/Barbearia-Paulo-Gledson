import { useState } from 'react';
import { useApp } from '../../../store/useApp';
import { Booking } from '../../../types';
import { getErrorMessage } from '../../../utils/errors';
import { getServiceName as getSharedServiceName, getBarberName as getSharedBarberName } from '../../../utils/lookups';
import { formatBRL } from '../../../utils/validation';

export const useCustomerDashboard = () => {
  const {
    bookings,
    services,
    barbers,
    currentUser,
    updateBookingStatus,
    confirmBookingAttendance,
    rescheduleBooking,
    getAvailableSlots,
    config,
  } = useApp();

  const [reschedulingBookingId, setReschedulingBookingId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const clientBookings = currentUser ? bookings.filter(b => b.customerId === currentUser.id) : [];

  const upcomingBookings = clientBookings.filter(
    b => b.status !== 'Concluído' && b.status !== 'Cancelado' && b.status !== 'Não compareceu'
  ).sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.time.localeCompare(b.time);
  });

  const pastBookings = clientBookings.filter(
    b => b.status === 'Concluído' || b.status === 'Cancelado' || b.status === 'Não compareceu'
  ).sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return b.time.localeCompare(a.time);
  });

  const getBarberName = (id: string) => getSharedBarberName(barbers, id);

  const getServiceName = (id: string) => getSharedServiceName(services, id);

  const getServiceDuration = (id: string) => {
    if (!id) return 30;
    return id.split(',').reduce((sum, subId) => sum + (services.find(s => s.id === subId.trim())?.duration || 0), 0);
  };

  const handleConfirmAttendance = async (id: string) => {
    if (!window.confirm("Deseja confirmar sua presença neste agendamento?")) return;
    try {
      await confirmBookingAttendance(id);
      setSuccessMsg("Presença confirmada!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg(getErrorMessage(err, 'Não foi possível confirmar a presença. Tente novamente.'));
      setTimeout(() => setErrorMsg(""), 4000);
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja cancelar este agendamento?')) return;
    try {
      await updateBookingStatus(id, 'Cancelado');
      setSuccessMsg('Agendamento cancelado com sucesso.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(getErrorMessage(err, 'Não foi possível cancelar o agendamento. Tente novamente.'));
      setTimeout(() => setErrorMsg(""), 4000);
    }
  };

  const loadSlotsForReschedule = async (barberId: string, serviceId: string, date: string, currentTime: string, sameDayAsOriginal: boolean) => {
    setLoadingTimes(true);
    try {
      const slots = await getAvailableSlots(barberId, serviceId, date);
      // Inclui o horário atual do agendamento na lista, já que ele está
      // "ocupado" pelo próprio agendamento que está sendo reagendado.
      if (sameDayAsOriginal && !slots.includes(currentTime)) {
        slots.push(currentTime);
        slots.sort();
      }
      setAvailableTimes(slots);
    } catch {
      setAvailableTimes([]);
    } finally {
      setLoadingTimes(false);
    }
  };

  const handleOpenReschedule = (booking: Booking) => {
    setReschedulingBookingId(booking.id);
    setNewDate(booking.date);
    setNewTime(booking.time);
    setErrorMsg('');
    loadSlotsForReschedule(booking.barberId, booking.serviceId, booking.date, booking.time, true);
  };

  const handleDateChange = (date: string, booking: Booking) => {
    setNewDate(date);
    setNewTime('');
    loadSlotsForReschedule(booking.barberId, booking.serviceId, date, booking.time, date === booking.date);
  };

  const handleConfirmReschedule = async (id: string) => {
    if (!newDate || !newTime) {
      setErrorMsg('Por favor, selecione data e horário válidos.');
      return;
    }
    try {
      await rescheduleBooking(id, newDate, newTime);
      setSuccessMsg('Agendamento reagendado com sucesso.');
      setReschedulingBookingId(null);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(getErrorMessage(err, 'Não foi possível reagendar. O horário pode ter sido reservado por outra pessoa.'));
    }
  };

  return {
    currentUser,
    upcomingBookings,
    pastBookings,
    reschedulingBookingId,
    setReschedulingBookingId,
    newDate,
    newTime,
    setNewTime,
    availableTimes,
    loadingTimes,
    successMsg,
    errorMsg,
    handleCancel,
    handleConfirmAttendance,
    handleOpenReschedule,
    handleDateChange,
    handleConfirmReschedule,
    getBarberName,
    getServiceName,
    getServiceDuration,
    formatBRL
  };
};
