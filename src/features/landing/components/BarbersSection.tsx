import React from 'react';
import { Sparkle, Scissors } from 'lucide-react';
import { Barber } from '../../../types';

interface BarbersSectionProps {
  activeBarbers: Barber[];
  onStartBooking: () => void;
}

export const BarbersSection: React.FC<BarbersSectionProps> = ({ activeBarbers, onStartBooking }) => {
  if (activeBarbers.length === 0) return null;

  return (
    <section id="barbers-section" className="py-24 bg-slate-100 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkle size={12} className="text-indigo-500 animate-spin-slow" /> ARTISTAS DA TESOURA
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-950 font-sans tracking-tight">
            Barbeiros Especialistas
          </h2>
          <p className="text-slate-500 text-sm sm:text-base mt-4 leading-relaxed">
            Conheça os profissionais que transformarão seu estilo. Cada profissional tem foco em alta precisão e visagismo moderno.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
          {activeBarbers.map(barber => (
            <div
              key={barber.id}
              className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md hover:border-slate-200 border border-slate-100 transition-all duration-300 flex flex-col items-center p-6 text-center group"
            >
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-indigo-500/10 rounded-full scale-105 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                <img
                  src={barber.avatar}
                  alt={barber.name}
                  referrerPolicy="no-referrer"
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-slate-50 shadow-md relative z-10 transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute bottom-2 right-2 w-4.5 h-4.5 bg-emerald-500 border-4 border-white rounded-full z-20"></span>
              </div>
              <h4 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                {barber.name}
              </h4>
              <p className="text-indigo-600 text-xs font-bold uppercase tracking-widest mt-1.5 bg-indigo-50 px-3 py-1 rounded-full">
                {barber.specialty}
              </p>
              
              <p className="text-xs text-slate-400 mt-4 leading-relaxed line-clamp-2 max-w-xs">
                Especialista em visagismo facial, barbas modeladas e cortes sob medida de última tendência.
              </p>
              <button
                onClick={onStartBooking}
                className="w-full mt-6 bg-slate-950 hover:bg-indigo-600 text-white py-3 px-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm group-hover:shadow"
              >
                <Scissors size={14} /> Agendar com {barber.name.split(' ')[0]}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
