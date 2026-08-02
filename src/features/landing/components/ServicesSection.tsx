import React from 'react';
import { Scissors, TrendingUp } from 'lucide-react';
import { Service } from '../../../types';
import { formatBRL } from '../../../utils/validation';

interface ServicesSectionProps {
  categories: string[];
  activeServices: Service[];
  onStartBooking: () => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ categories, activeServices, onStartBooking }) => {
  return (
    <section id="services-section" className="py-24 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <TrendingUp size={12} className="text-indigo-600" /> NOSSA ESPECIALIDADE
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 font-sans tracking-tight">
            Menu de Serviços
          </h2>
          <p className="text-slate-500 text-sm sm:text-base mt-4 leading-relaxed">
            Selecione a categoria desejada. Todos os procedimentos incluem lavagem, finalização e consultoria de estilo.
          </p>
        </div>

        <div className="space-y-16">
          {categories.map((category) => (
            <div key={category} className="scroll-mt-24">
              <div className="flex items-center gap-4 mb-8">
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{category}</h3>
                <div className="h-px bg-slate-200 flex-1"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeServices
                  .filter(s => s.category === category)
                  .map(service => (
                    <div 
                      key={service.id} 
                      className="group flex flex-col sm:flex-row justify-between p-6 bg-slate-50 hover:bg-white rounded-3xl border border-slate-100 hover:border-indigo-100 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-900/5 cursor-pointer relative overflow-hidden"
                      onClick={onStartBooking}
                    >
                      {/* Decorative background element on hover */}
                      <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      
                      <div className="flex-1 pr-4 relative z-10">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-lg font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                            {service.name}
                          </h4>
                        </div>
                        {service.description && (
                          <p className="text-slate-500 text-sm mb-3 line-clamp-2 pr-4">{service.description}</p>
                        )}
                        <div className="flex items-center gap-3">
                          <span className="inline-block bg-white border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md">
                            {service.duration} min
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-4 sm:mt-0 flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0 border-t sm:border-t-0 sm:border-l border-slate-200 pt-4 sm:pt-0 sm:pl-6 relative z-10">
                        <p className="text-2xl font-black text-slate-900 font-mono tracking-tighter">
                          {formatBRL(service.price)}
                        </p>
                        <button className="bg-slate-900 group-hover:bg-indigo-600 text-white p-2.5 rounded-xl transition-colors mt-0 sm:mt-3 shadow-sm">
                          <Scissors size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
