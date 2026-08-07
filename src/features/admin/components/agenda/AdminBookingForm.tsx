import React, { useState } from 'react';
import { useApp } from '../../../../store/useApp';
import { BookingStatus } from '../../../../types';
import { getErrorMessage } from '../../../../utils/errors';

interface AdminBookingFormProps {
  showFeedback: (msg: string, isError: boolean) => void;
  onSuccess?: () => void;
}

export const AdminBookingForm: React.FC<AdminBookingFormProps> = ({ showFeedback, onSuccess }) => {
  const { barbers, services, isSlotAvailable, addBooking } = useApp();

  const [adminCustName, setAdminCustName] = useState('');
  const [adminCustPhone, setAdminCustPhone] = useState('');
  const [adminBarberId, setAdminBarberId] = useState('');
  const [adminServiceId, setAdminServiceId] = useState('');
  const [adminDate, setAdminDate] = useState('');
  const [adminTime, setAdminTime] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [adminFeePaid, setAdminFeePaid] = useState(true);
  const [adminStatus, setAdminStatus] = useState<BookingStatus>('Confirmado');
  const [isSaving, setIsSaving] = useState(false);

  const handleAdminBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!adminCustName || !adminCustPhone || !adminBarberId || !adminServiceId || !adminDate || !adminTime) {
      showFeedback('Por favor, preencha todos os campos obrigatórios.', true);
      return;
    }

    const duration = adminServiceId.split(',').reduce((sum, subId) => {
      const s = services.find(x => x.id === subId.trim());
      return sum + (s ? s.duration : 0);
    }, 0);

    const isAvailable = isSlotAvailable(adminBarberId, adminDate, adminTime, duration);

    if (!isAvailable) {
      showFeedback('Erro: Este horário não está mais disponível ou conflita com outro agendamento/bloqueio.', true);
      return;
    }

    const val = adminServiceId.split(',').reduce((sum, subId) => {
      const s = services.find(x => x.id === subId.trim());
      return sum + (s ? s.price : 0);
    }, 0);

    setIsSaving(true);
    try {
      await addBooking({
        // 'guest' é o sentinel que dataService.createBooking já converte para
        // customer_id = null. O valor anterior (`cust-admin-${Date.now()}`)
        // não é um UUID válido e fazia essa gravação falhar sempre, com um
        // erro de tipo do Postgres, todas as vezes que o admin cadastrava um
        // agendamento manualmente (walk-in).
        customerId: 'guest',
        customerName: adminCustName,
        customerPhone: adminCustPhone,
        barberId: adminBarberId,
        serviceId: adminServiceId,
        date: adminDate,
        time: adminTime,
        status: adminStatus,
        value: val,
        feePaid: adminFeePaid,
        notes: adminNotes
      });

      showFeedback('Agendamento confirmado com sucesso', false);

      // Limpa e fecha o formulário somente depois da confirmação do banco.
      setAdminCustName('');
      setAdminCustPhone('');
      setAdminBarberId('');
      setAdminServiceId('');
      setAdminDate('');
      setAdminTime('');
      setAdminNotes('');
      setAdminStatus('Confirmado');

      onSuccess?.();
    } catch (err) {
      showFeedback(getErrorMessage(err, 'Erro ao salvar agendamento. Tente novamente.'), true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleAdminBookingSubmit} className="space-y-4 border-t border-slate-100 pt-4 mb-4 text-xs" noValidate>
      <div className="space-y-3">
        <input type="text" required value={adminCustName} onChange={(e) => setAdminCustName(e.target.value)} placeholder="Nome do Cliente *" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium" />
        <input type="tel" required value={adminCustPhone} onChange={(e) => setAdminCustPhone(e.target.value)} placeholder="WhatsApp *" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium" />
        
        <select required value={adminBarberId} onChange={(e) => setAdminBarberId(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium bg-white">
          <option value="">Selecione o Profissional *</option>
          {barbers.filter(b => b.active !== false).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>

        <select required value={adminServiceId} onChange={(e) => setAdminServiceId(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium bg-white">
          <option value="">Selecione o Serviço *</option>
          {services.map(s => <option key={s.id} value={s.id}>{s.name} - R$ {s.price}</option>)}
        </select>

        <div className="grid grid-cols-2 gap-2">
          <input type="date" required value={adminDate} onChange={(e) => setAdminDate(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium bg-white" />
          <input type="time" required value={adminTime} onChange={(e) => setAdminTime(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium bg-white" />
        </div>

        <input type="text" value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} placeholder="Observações" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium" />
        
        <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
          <input type="checkbox" checked={adminFeePaid} onChange={(e) => setAdminFeePaid(e.target.checked)} className="rounded" />
          Taxa paga pelo cliente
        </label>
        
        <select required value={adminStatus} onChange={(e) => setAdminStatus(e.target.value as BookingStatus)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium bg-white">
          <option value="Confirmado">Confirmado</option>
          <option value="Concluído">Concluído</option>
        </select>

        <button type="submit" disabled={isSaving} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 text-white py-2 rounded-lg font-bold transition-colors shadow-sm">
          {isSaving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  );
};
