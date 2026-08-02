import React from 'react';
import { Calendar as CalendarIcon, Clock, Loader2 } from 'lucide-react';
import { getBarbershopTodayStr, getBarbershopMaxBookingDateStr, MAX_BOOKING_DAYS_AHEAD } from '../../../utils/validation';

interface Props {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedTime: string;
  setSelectedTime: (time: string) => void;
  availableTimes: string[];
  loadingTimes?: boolean;
}

export const DateTimeSelectionStep: React.FC<Props> = ({
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  availableTimes,
  loadingTimes
}) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div>
        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
          <CalendarIcon size={16} className="text-indigo-600" />
          Data do Agendamento
        </label>
        <div className="relative">
          <input
            type="date"
            value={selectedDate}
            min={getBarbershopTodayStr()}
            max={getBarbershopMaxBookingDateStr()}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full pl-4 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 font-medium"
          />
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Agendamentos disponíveis para os próximos {MAX_BOOKING_DAYS_AHEAD} dias.
        </p>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
          <Clock size={16} className="text-indigo-600" />
          Horários Disponíveis
        </label>

        {loadingTimes ? (
          <div className="flex items-center justify-center gap-2 py-8 bg-slate-50 rounded-xl border border-slate-100 text-slate-400">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">Verificando horários disponíveis...</span>
          </div>
        ) : availableTimes.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {availableTimes.map(time => (
              <button
                key={time}
                type="button"
                onClick={() => setSelectedTime(time)}
                className={`py-2.5 rounded-xl font-semibold text-sm transition-all border-2 ${
                  selectedTime === time
                    ? 'border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-200'
                    : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
            <Clock size={24} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm text-slate-500">Nenhum horário disponível nesta data</p>
          </div>
        )}
      </div>
    </div>
  );
};
