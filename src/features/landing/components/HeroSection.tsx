import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { BarbershopConfig } from '../../../types';

interface HeroSectionProps {
  config: BarbershopConfig;
  onStartBooking: () => void;
  onOpenLogin: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ config, onStartBooking, onOpenLogin }) => {
  return (
    <section className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white py-24 md:py-36 px-4 overflow-hidden">
      {/* Decorative Grid Lines & Glowing Orbs */}
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 -right-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-5xl mx-auto text-center relative z-10 flex flex-col items-center">
        {/* Subtle real-time live banner */}
        <div className="inline-flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-indigo-300 mb-8 backdrop-blur-md shadow-inner">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-200">Agenda de hoje Aberta</span>
          <span className="text-slate-500">•</span>
          <span className="text-indigo-400 font-extrabold flex items-center gap-1">
            <Sparkles size={12} /> {config.heroSubtitle || 'Tradição e Estilo'}
          </span>
        </div>

        <h1 className="font-sans font-black text-4xl sm:text-6xl md:text-8xl tracking-tight leading-none mb-6">
          {config.heroTitle ? (
            <>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300">
                {config.heroTitle.includes(' ')
                  ? config.heroTitle.substring(0, config.heroTitle.lastIndexOf(' '))
                  : config.heroTitle}
              </span>
              {config.heroTitle.includes(' ') && (
                <span className="block text-indigo-400 mt-2 font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-300">
                  {config.heroTitle.substring(config.heroTitle.lastIndexOf(' ') + 1)}
                </span>
              )}
            </>
          ) : (
            <>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300">PAULO GLEDSON</span>
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-300">BARBEARIA</span>
            </>
          )}
        </h1>
        <p className="max-w-2xl text-slate-400 text-sm sm:text-lg md:text-xl mb-12 leading-relaxed font-light">
          {config.heroDescription || 'Mais que um corte de cabelo, uma experiência de autocuidado e alta performance. Agende seu horário com os maiores especialistas da região em poucos cliques.'}
        </p>

        {/* Master Call-To-Action (Glowing button + Info) */}
        <div className="flex flex-col sm:flex-row gap-4 items-center w-full justify-center max-w-xl">
          <button
            id="hero-book-now-btn"
            onClick={onStartBooking}
            className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-extrabold px-10 py-5 rounded-2xl text-base md:text-lg transition-all hover:scale-[1.03] shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-3 cursor-pointer group active:scale-[0.98]"
          >
            Agendar Meu Horário
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={onOpenLogin}
            className="w-full sm:w-auto bg-slate-900/60 hover:bg-slate-800 text-white border border-slate-700 hover:border-slate-600 font-bold px-8 py-4.5 rounded-2xl text-sm transition-all flex items-center justify-center cursor-pointer shadow-inner backdrop-blur-sm"
          >
            Já tenho cadastro
          </button>
        </div>

        <div className="mt-8 flex items-center gap-2 text-[11px] text-slate-500 font-bold tracking-wide uppercase">
          <span className="flex bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
            Pague pelo celular
          </span>
          <span className="flex bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20">
            Reserva Instantânea
          </span>
        </div>
      </div>
    </section>
  );
};
