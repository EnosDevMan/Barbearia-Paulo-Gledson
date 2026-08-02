import React from 'react';
import { Shield, Award, Star, Flame, Check } from 'lucide-react';

export const FeaturesSection: React.FC = () => {
  return (
    <section className="bg-slate-950 py-10 border-t border-slate-900 border-b relative z-20">
      <div className="max-w-6xl mx-auto px-4 flex flex-wrap justify-center md:justify-between items-center gap-6 md:gap-4 opacity-70">
        <div className="flex items-center gap-2 text-slate-400">
          <Shield size={20} className="text-emerald-500" />
          <span className="text-xs font-bold uppercase tracking-widest">Pagamento Seguro</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Award size={20} className="text-amber-500" />
          <span className="text-xs font-bold uppercase tracking-widest">Profissionais Certificados</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Star size={20} className="text-yellow-400 fill-yellow-400" />
          <span className="text-xs font-bold uppercase tracking-widest">4.9/5 Avaliações</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Flame size={20} className="text-orange-500" />
          <span className="text-xs font-bold uppercase tracking-widest">Ambiente Climatizado</span>
        </div>
        <div className="hidden lg:flex items-center gap-2 text-slate-400">
          <Check size={20} className="text-indigo-400" />
          <span className="text-xs font-bold uppercase tracking-widest">Estacionamento</span>
        </div>
      </div>
    </section>
  );
};
