import React from 'react';
import { Booking, BookingStatus } from '../../../types';
import { formatBRL } from '../../../utils/validation';

interface BarberHistoryProps {
  pastBookings: Booking[];
  getServiceName: (id: string) => string;
  getServicePrice: (id: string) => number;
  getStatusBadgeColor: (status: BookingStatus) => string;
}

export const BarberHistory: React.FC<BarberHistoryProps> = ({
  pastBookings,
  getServiceName,
  getServicePrice,
  getStatusBadgeColor
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <h3 className="font-sans font-bold text-slate-800 text-xs uppercase tracking-wider mb-4 border-b border-slate-100 pb-3">
        Últimos Trabalhos ({pastBookings.length})
      </h3>
      {pastBookings.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {pastBookings.map(booking => (
            <div key={booking.id} className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 text-xs">
              <div className="flex justify-between">
                <p className="font-bold text-slate-900">{getServiceName(booking.serviceId)}</p>
                <span className="font-mono font-bold text-slate-400 text-[10px]">{booking.date}</span>
              </div>
              <p className="text-slate-400 mt-1 leading-snug">Cliente: {booking.customerName} • {formatBRL(getServicePrice(booking.serviceId))}</p>
              <span className={`inline-block mt-1 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${getStatusBadgeColor(booking.status)}`}>
                {booking.status}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-400 text-xs">Nenhum atendimento anterior registrado.</p>
      )}
    </div>
  );
};
