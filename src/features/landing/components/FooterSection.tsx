import React from 'react';
import { Scissors, Instagram, Facebook, MapPin, Phone, Sparkles } from 'lucide-react';
import { BarbershopConfig } from '../../../types';
import { summarizeWorkingDays } from '../../../utils/validation';

interface FooterSectionProps {
  config: BarbershopConfig;
  onOpenPrivacy: () => void;
}

export const FooterSection: React.FC<FooterSectionProps> = ({ config, onOpenPrivacy }) => {
  return (
    <footer className="bg-slate-950 text-slate-400 py-20 px-4 border-t border-slate-900">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Column 1 - Brand */}
        <div className="space-y-5">
          <h4 className="text-white font-extrabold text-xl tracking-wider uppercase flex items-center gap-2">
            <Scissors size={20} className="text-indigo-400" /> {config.name}
          </h4>
          <p className="text-xs md:text-sm leading-relaxed max-w-xs text-slate-400 font-light">
            {config.aboutText || 'Cortes, barba e cuidado masculino com atendimento profissional, qualidade e atenção aos detalhes.'}
          </p>
          {/* Social icons */}
          <div className="flex gap-3 pt-2">
            {config.socialLinks.instagram && (
              <a
                href={config.socialLinks.instagram}
                target="_blank"
                rel="noreferrer"
                className="p-3 bg-slate-900 hover:bg-slate-850 text-indigo-400 hover:text-white rounded-xl transition-colors border border-slate-800"
              >
                <Instagram size={18} />
              </a>
            )}
            {config.socialLinks.facebook && (
              <a
                href={config.socialLinks.facebook}
                target="_blank"
                rel="noreferrer"
                className="p-3 bg-slate-900 hover:bg-slate-850 text-indigo-400 hover:text-white rounded-xl transition-colors border border-slate-800"
              >
                <Facebook size={18} />
              </a>
            )}
          </div>
        </div>

        {/* Column 2 - Working hours */}
        <div className="space-y-5">
          <h4 className="text-white font-extrabold text-sm uppercase tracking-widest text-slate-200">Atendimento</h4>
          <ul className="space-y-3 text-xs md:text-sm">
            {summarizeWorkingDays(config.workingHours.daysOpen, config.workingHours.open, config.workingHours.close).map(({ label, value }) => (
              <li key={label} className={`flex justify-between border-b border-slate-900 pb-2 ${value === 'Fechado' ? 'text-slate-500' : ''}`}>
                <span className="text-slate-400">{label}:</span>
                {value === 'Fechado' ? (
                  <span className="font-bold bg-slate-900/40 px-2 py-0.5 rounded text-[10px] uppercase">Fechado</span>
                ) : (
                  <span className="text-slate-200 font-semibold">{value}</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3 - Contact Info */}
        <div className="space-y-5">
          <h4 className="text-white font-extrabold text-sm uppercase tracking-widest text-slate-200">Localização e Contato</h4>
          <div className="space-y-4 text-xs md:text-sm">
            {config.address && (
              <p className="flex items-start gap-3">
                <MapPin size={18} className="text-indigo-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{config.address}</span>
              </p>
            )}
            <p className="flex items-center gap-3">
              <Phone size={18} className="text-indigo-400 shrink-0" />
              <span>{config.phone}</span>
            </p>
            <p className="flex items-center gap-3">
              <Sparkles size={18} className="text-emerald-400 shrink-0" />
              <span className="text-emerald-400 font-bold">Primeiro Agendamento Sem Taxa!</span>
            </p>
          </div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-slate-900 text-center text-xs text-slate-500 space-y-2">
        <button onClick={onOpenPrivacy} className="block mx-auto text-slate-400 hover:text-white underline underline-offset-2 transition-colors">
          Política de Privacidade
        </button>
        <div>&copy; {new Date().getFullYear()} {config.name}. Todos os direitos reservados.</div>
      </div>
    </footer>
  );
};
