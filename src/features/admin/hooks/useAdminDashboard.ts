import { useState, useEffect } from 'react';
import { useApp } from '../../../store/useApp';
import { LayoutDashboard, BarChart3, CalendarDays, CalendarPlus, Scissors, Users, Settings, Camera } from 'lucide-react';
import { formatBRL } from '../../../utils/validation';
import { getErrorMessage } from '../../../utils/errors';
import { getServiceName as getSharedServiceName, getBarberName as getSharedBarberName } from '../../../utils/lookups';
import { BookingStatus } from '../../../types';

export const useAdminDashboard = () => {
  const { config, currentUser, barbers, services, updateBookingStatus } = useApp();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'new-booking' | 'reports' | 'services' | 'barbers' | 'gallery' | 'clients' | 'agenda' | 'settings'>('overview');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
        setErrorMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  const showFeedback = (msg: string, isError: boolean = false) => {
    if (isError) {
      setErrorMessage(msg);
      setSuccessMessage('');
    } else {
      setSuccessMessage(msg);
      setErrorMessage('');
    }
  };

  const handleUpdateBookingStatus = async (id: string, newStatus: BookingStatus) => {
    try {
      await updateBookingStatus(id, newStatus);
      showFeedback(`Agendamento ${newStatus.toLowerCase()} com sucesso!`, false);
    } catch (err) {
      showFeedback(getErrorMessage(err, 'Erro ao atualizar agendamento.'), true);
    }
  };

  const getBarberName = (id: string) => getSharedBarberName(barbers, id);

  const getServiceName = (id: string) => getSharedServiceName(services, id);

  const navItems = [
    { id: 'overview', label: 'Hoje', icon: LayoutDashboard },
    { id: 'new-booking', label: 'Novo Agendamento', icon: CalendarPlus },
    { id: 'agenda', label: 'Agenda Completa', icon: CalendarDays },
    { id: 'reports', label: 'Relatórios', icon: BarChart3 },
    { id: 'services', label: 'Serviços', icon: Scissors },
    { id: 'barbers', label: 'Profissionais', icon: Users },
    { id: 'gallery', label: 'Galeria', icon: Camera },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ] as const;

  return {
    config,
    currentUser,
    activeTab,
    setActiveTab,
    successMessage,
    setSuccessMessage,
    errorMessage,
    setErrorMessage,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    showFeedback,
    handleUpdateBookingStatus,
    getBarberName,
    getServiceName,
    formatBRL,
    navItems
  };
};
