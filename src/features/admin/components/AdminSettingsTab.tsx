import React, { useState } from 'react';
import { Save, Scissors, Sparkles, Award, ChevronDown } from 'lucide-react';
import { useApp } from '../../../store/useApp';
import { getErrorMessage } from '../../../utils/errors';
import { parseBRNumber } from '../../../utils/validation';

interface AdminSettingsTabProps {
  showFeedback: (msg: string, isError: boolean) => void;
}

const WEEK_DAYS = [
  { id: 0, label: 'Dom' },
  { id: 1, label: 'Seg' },
  { id: 2, label: 'Ter' },
  { id: 3, label: 'Qua' },
  { id: 4, label: 'Qui' },
  { id: 5, label: 'Sex' },
  { id: 6, label: 'Sáb' },
];

/**
 * Precisa viver FORA de `AdminSettingsTab` (não dentro do corpo dela).
 * Antes, era definida dentro do componente e, por isso, o React recriava
 * uma FUNÇÃO/COMPONENTE NOVA a cada re-render — e como o formulário
 * re-renderiza a cada tecla digitada (estado controlado), o React tratava
 * cada `<FormSection>` como um componente diferente do anterior a cada
 * letra, desmontando e remontando o card inteiro. Isso derrubava o foco
 * do campo que estava sendo editado e, no celular, fechava o teclado a
 * cada tecla. Definindo aqui fora, a identidade do componente fica
 * estável entre renders e o React só atualiza o conteúdo, sem desmontar.
 */
const FormSection: React.FC<{
  id: string;
  title: string;
  expandedSection: string | null;
  setExpandedSection: (id: string | null) => void;
  children: React.ReactNode;
}> = ({ id, title, expandedSection, setExpandedSection, children }) => {
  const isExpanded = expandedSection === id;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <button
        onClick={() => setExpandedSection(isExpanded ? null : id)}
        className="hidden md:block w-full text-left"
      >
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
          <h3 className="font-extrabold text-slate-900 text-lg">{title}</h3>
        </div>
      </button>

      <div className="md:hidden">
        <button
          onClick={() => setExpandedSection(isExpanded ? null : id)}
          className="w-full text-left p-4 border-b border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between"
        >
          <h3 className="font-bold text-slate-900">{title}</h3>
          <ChevronDown
            size={18}
            className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      <div className={`overflow-hidden transition-all duration-300 md:block ${isExpanded ? 'max-h-none' : 'max-h-0 md:max-h-none'}`}>
        <div className="p-6 space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export const AdminSettingsTab: React.FC<AdminSettingsTabProps> = ({ showFeedback }) => {
  const { config, updateConfig } = useApp();

  const [confName, setConfName] = useState(config.name);
  const [confAddress, setConfAddress] = useState(config.address);
  const [confPhone, setConfPhone] = useState(config.phone);
  const [confOpen, setConfOpen] = useState(config.workingHours.open);
  const [confClose, setConfClose] = useState(config.workingHours.close);
  const [confFee, setConfFee] = useState(config.bookingFee.toString());
  const [confPixKey, setConfPixKey] = useState(config.pixKey || '');
  const [confTolerance, setConfTolerance] = useState(config.toleranceMinutes.toString());
  const [confInterval, setConfInterval] = useState(config.intervalMinutes.toString());
  const [confInsta, setConfInsta] = useState(config.socialLinks.instagram || '');
  const [confFb, setConfFb] = useState(config.socialLinks.facebook || '');
  const [confDays, setConfDays] = useState<number[]>(config.workingHours.daysOpen);
  const [confHeroTitle, setConfHeroTitle] = useState(config.heroTitle || '');
  const [confHeroSubtitle, setConfHeroSubtitle] = useState(config.heroSubtitle || '');
  const [confHeroDescription, setConfHeroDescription] = useState(config.heroDescription || '');
  const [confAboutText, setConfAboutText] = useState(config.aboutText || '');
  const [confLogo, setConfLogo] = useState(config.logo || 'scissors');

  // Estado para abas expansíveis (mobile)
  const [expandedSection, setExpandedSection] = useState<string | null>('basic');

  const toggleDay = (day: number) => {
    if (confDays.includes(day)) {
      setConfDays(confDays.filter(d => d !== day));
    } else {
      setConfDays([...confDays, day].sort());
    }
  };

  const handleSaveConfig = async () => {
    try {
      await updateConfig({
        name: confName,
        address: confAddress,
        phone: confPhone,
        workingHours: {
          open: confOpen,
          close: confClose,
          daysOpen: confDays
        },
        bookingFee: parseBRNumber(confFee),
        pixKey: confPixKey,
        toleranceMinutes: Number(confTolerance),
        intervalMinutes: Number(confInterval),
        socialLinks: {
          instagram: confInsta,
          facebook: confFb
        },
        heroTitle: confHeroTitle,
        heroSubtitle: confHeroSubtitle,
        heroDescription: confHeroDescription,
        aboutText: confAboutText,
        logo: confLogo
      });
      showFeedback('Configurações salvas com sucesso!', false);
    } catch (err) {
      showFeedback(getErrorMessage(err, 'Erro ao salvar configurações.'), true);
    }
  };



  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header com Botão Salvar */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-0 z-10">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Configurações do Salão</h2>
            <p className="text-sm text-slate-500 mt-1">Ajuste as preferências globais do sistema</p>
          </div>
          <button
            onClick={handleSaveConfig}
            className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-slate-900/10 w-full sm:w-auto"
          >
            <Save size={18} />
            Salvar
          </button>
        </div>
      </div>

      {/* Formulário - Grid responsivo */}
      <div className="space-y-6">
        {/* Seção 1: Informações Básicas */}
        <FormSection id="basic" title="📋 Informações Básicas" expandedSection={expandedSection} setExpandedSection={setExpandedSection}>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Nome do Estabelecimento</label>
              <input 
                type="text" 
                value={confName} 
                onChange={e => setConfName(e.target.value)} 
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-medium text-sm" 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Ícone Principal (Logo)</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'scissors', icon: Scissors, label: 'Tesoura' },
                  { value: 'razor', icon: Sparkles, label: 'Estilo' },
                  { value: 'beard', icon: Award, label: 'Prêmio' }
                ].map(({ value, icon: Icon, label }) => (
                  <button 
                    key={value}
                    type="button" 
                    onClick={() => setConfLogo(value)}
                    className={`p-3 rounded-lg border-2 flex flex-col items-center justify-center gap-1.5 transition-all ${
                      confLogo === value 
                        ? 'border-slate-900 bg-slate-50 text-slate-900' 
                        : 'border-slate-200 text-slate-400 hover:border-slate-300'
                    }`}
                    title={label}
                  >
                    <Icon size={20} />
                    <span className="text-[10px] font-bold">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Endereço Completo</label>
              <input 
                type="text" 
                value={confAddress} 
                onChange={e => setConfAddress(e.target.value)} 
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-medium text-sm" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Telefone (WhatsApp)</label>
              <input 
                type="text" 
                value={confPhone} 
                onChange={e => setConfPhone(e.target.value)} 
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-medium text-sm" 
              />
            </div>
          </div>
        </FormSection>

        {/* Seção 2: Horários e Agendamento */}
        <FormSection id="schedule" title="⏰ Horários e Agendamento" expandedSection={expandedSection} setExpandedSection={setExpandedSection}>
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Dias de Funcionamento</label>
              <div className="grid grid-cols-7 gap-2 md:flex md:flex-wrap md:gap-2">
                {WEEK_DAYS.map((day) => (
                  <button
                    key={day.id} 
                    type="button" 
                    onClick={() => toggleDay(day.id)}
                    className={`flex-1 md:w-12 h-12 rounded-lg font-bold text-sm transition-all ${
                      confDays.includes(day.id)
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-400'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Abertura</label>
                <input 
                  type="time" 
                  value={confOpen} 
                  onChange={e => setConfOpen(e.target.value)} 
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-medium text-sm bg-white" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Fechamento</label>
                <input 
                  type="time" 
                  value={confClose} 
                  onChange={e => setConfClose(e.target.value)} 
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-medium text-sm bg-white" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tolerância (min)</label>
                <input 
                  type="number" 
                  value={confTolerance} 
                  onChange={e => setConfTolerance(e.target.value)} 
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-medium text-sm" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Intervalo (min)</label>
                <input 
                  type="number" 
                  value={confInterval} 
                  onChange={e => setConfInterval(e.target.value)} 
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-medium text-sm" 
                />
              </div>
            </div>
          </div>
        </FormSection>

        {/* Seção 3: Pagamento e Taxas */}
        <FormSection id="payment" title="💳 Pagamento e Taxas" expandedSection={expandedSection} setExpandedSection={setExpandedSection}>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Taxa de Reserva (R$)</label>
              <input 
                type="text" 
                inputMode="decimal" 
                value={confFee} 
                onChange={e => setConfFee(e.target.value)} 
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-medium text-sm" 
                placeholder="0,00"
              />
              <p className="text-xs text-slate-500">Coloque 0 para desativar a cobrança</p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Chave PIX Recebedora</label>
              <input 
                type="text" 
                value={confPixKey} 
                onChange={e => setConfPixKey(e.target.value)} 
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-medium text-sm" 
                placeholder="CNPJ, Email, Celular..." 
              />
              <p className="text-xs text-slate-500">
                Chave única usada em todos os agendamentos. Somente administradores podem alterá-la.
              </p>
            </div>
          </div>
        </FormSection>

        {/* Seção 4: Customização do Site */}
        <FormSection id="customization" title="🎨 Customização do Site" expandedSection={expandedSection} setExpandedSection={setExpandedSection}>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Título Principal</label>
              <input 
                type="text" 
                value={confHeroTitle} 
                onChange={e => setConfHeroTitle(e.target.value)} 
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-medium text-sm" 
                placeholder="Ex: Elevando o padrão..." 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Subtítulo</label>
              <input 
                type="text" 
                value={confHeroSubtitle} 
                onChange={e => setConfHeroSubtitle(e.target.value)} 
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-medium text-sm" 
                placeholder="Ex: Barbearia Premium em São Paulo" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Descrição Curta</label>
              <textarea 
                value={confHeroDescription} 
                onChange={e => setConfHeroDescription(e.target.value)} 
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-medium text-sm min-h-[80px]" 
                placeholder="Mais que um corte de cabelo..." 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Texto &quot;Sobre Nós&quot;</label>
              <textarea 
                value={confAboutText} 
                onChange={e => setConfAboutText(e.target.value)} 
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-medium text-sm min-h-[100px]" 
                placeholder="Nossa história..." 
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Link Instagram</label>
                <input 
                  type="url" 
                  value={confInsta} 
                  onChange={e => setConfInsta(e.target.value)} 
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-medium text-sm" 
                  placeholder="https://instagram.com/..." 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Link Facebook</label>
                <input 
                  type="url" 
                  value={confFb} 
                  onChange={e => setConfFb(e.target.value)} 
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-medium text-sm" 
                  placeholder="https://facebook.com/..." 
                />
              </div>
            </div>
          </div>
        </FormSection>
      </div>
    </div>
  );
};
