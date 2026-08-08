
import React from 'react';
import { CheckCircle, AlertCircle, Menu, X, ArrowLeft, LogOut, BarChart3 } from 'lucide-react';
import { withRoleGuard } from '../auth/middleware/withRoleGuard';
import { getCompactDisplayName } from '../utils/displayName';
import { useAdminDashboard } from '../features/admin/hooks/useAdminDashboard';
import { AdminOverviewTab } from '../features/admin/components/AdminOverviewTab';
import { AdminReportsTab } from '../features/admin/components/AdminReportsTab';
import { AdminServicesTab } from '../features/admin/components/AdminServicesTab';
import { AdminBarbersTab } from '../features/admin/components/AdminBarbersTab';
import { AdminGalleryTab } from '../features/admin/components/AdminGalleryTab';
import { AdminClientsTab } from '../features/admin/components/AdminClientsTab';
import { AdminAgendaTab } from '../features/admin/components/AdminAgendaTab';
import { AdminSettingsTab } from '../features/admin/components/AdminSettingsTab';
import { AdminBookingForm } from '../features/admin/components/agenda/AdminBookingForm';

interface AdminDashboardProps {
  onLogout: () => void;
  onNavigateHome: () => void;
}

const AdminDashboardInner: React.FC<AdminDashboardProps> = ({ onLogout, onNavigateHome }) => {
  const {
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
  } = useAdminDashboard();

  const compactUserName = currentUser ? getCompactDisplayName(currentUser.name) : '';

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      {/* SIDEBAR DESKTOP */}
      <nav className="hidden md:flex md:w-72 bg-gradient-to-b from-slate-900 to-slate-950 text-slate-300 flex-col shadow-2xl border-r border-slate-800">
        {/* Sidebar Header */}
        <div className="p-8 border-b border-slate-700/50">
          <div className="flex items-center gap-3 mb-3">
            <button 
              onClick={onNavigateHome} 
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white" 
              title="Voltar"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-lg font-black text-white">{config.name}</h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Painel Administrativo</p>
            </div>
          </div>
        </div>

        {/* Navigation Items - com mais espaço */}
        <div className="flex-1 px-4 py-6 space-y-3 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                  : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
              {activeTab === item.id && (
                <div className="ml-auto w-2 h-2 rounded-full bg-indigo-200" />
              )}
            </button>
          ))}
        </div>

        {/* User Section - mais espaço */}
        <div className="p-6 border-t border-slate-700/50 space-y-4">
          <div className="flex items-center gap-4 px-3 py-4 bg-slate-800/30 rounded-xl">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center font-bold text-white flex-shrink-0 shadow-lg">
              {currentUser?.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-sm truncate">{compactUserName}</p>
              <p className="text-xs text-slate-400 truncate">{currentUser?.email}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-slate-800/50 hover:bg-rose-500/10 text-slate-300 hover:text-rose-400 transition-all border border-slate-700/50 hover:border-rose-500/30 flex items-center justify-center gap-2"
          >
            <LogOut size={16} />
            Sair da Conta
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 flex items-center justify-between sticky top-0 z-40 shadow-xl border-b border-slate-700">
          <div className="flex items-center gap-3">
            <button 
              onClick={onNavigateHome} 
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="font-extrabold text-lg flex items-center gap-2">
                <BarChart3 size={20} />
                Admin
              </div>
              <p className="text-xs text-slate-300">{config.name}</p>
            </div>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Messages - Mais espaço e visual */}
        <div className="flex-shrink-0">
          {successMessage && (
            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-b-2 border-emerald-300 px-6 py-4 flex items-center gap-4 shadow-sm">
              <CheckCircle className="text-emerald-600 flex-shrink-0" size={24} />
              <p className="text-emerald-900 font-semibold text-sm flex-1">{successMessage}</p>
              <button 
                onClick={() => setSuccessMessage('')} 
                className="text-emerald-600 hover:text-emerald-800 font-bold text-xl"
              >
                ×
              </button>
            </div>
          )}
          
          {errorMessage && (
            <div className="bg-gradient-to-r from-rose-50 to-rose-100 border-b-2 border-rose-300 px-6 py-4 flex items-center gap-4 shadow-sm">
              <AlertCircle className="text-rose-600 flex-shrink-0" size={24} />
              <p className="text-rose-900 font-semibold text-sm flex-1">{errorMessage}</p>
              <button 
                onClick={() => setErrorMessage('')} 
                className="text-rose-600 hover:text-rose-800 font-bold text-xl"
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* Main Content - MUITO mais espaçado */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {/* Título da Página */}
              <div className="mb-6">
                <h2 className="text-3xl md:text-4xl font-black text-slate-900">
                  {navItems.find(item => item.id === activeTab)?.label}
                </h2>
                <div className="h-1.5 w-16 bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full mt-3" />
                <p className="text-slate-600 text-sm mt-3">{activeTab === 'overview' ? 'Sua operação de hoje, em um só lugar' : 'Encontre e conclua sua tarefa com rapidez'}</p>
              </div>

              {/* Content Container - com background e padding generoso */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
                <div className="p-4 sm:p-6 md:p-8">
                  {activeTab === 'overview' && (
                    <AdminOverviewTab 
                      formatBRL={formatBRL}
                      getBarberName={getBarberName}
                      getServiceName={getServiceName}
                      handleUpdateBookingStatus={handleUpdateBookingStatus}
                      onViewFullReport={() => setActiveTab('reports')}
                      onNewBooking={() => setActiveTab('new-booking')}
                      onViewAgenda={() => setActiveTab('agenda')}
                      showFeedback={showFeedback}
                    />
                  )}

                  {activeTab === 'new-booking' && (
                    <div className="max-w-3xl mx-auto">
                      <div className="mb-6">
                        <h2 className="text-xl font-extrabold text-slate-900">Criar novo agendamento</h2>
                        <p className="text-sm text-slate-500 mt-1">Escolha profissional e serviço para consultar a disponibilidade real.</p>
                      </div>
                      <AdminBookingForm showFeedback={showFeedback} onSuccess={() => setActiveTab('overview')} />
                    </div>
                  )}

                  {activeTab === 'reports' && (
                    <AdminReportsTab
                      formatBRL={formatBRL}
                    />
                  )}

                  {activeTab === 'services' && (
                    <AdminServicesTab
                      formatBRL={formatBRL}
                      setSuccessMessage={setSuccessMessage}
                      setErrorMessage={setErrorMessage}
                    />
                  )}

                  {activeTab === 'barbers' && (
                    <AdminBarbersTab
                      setSuccessMessage={setSuccessMessage}
                      setErrorMessage={setErrorMessage}
                    />
                  )}

                  {activeTab === 'gallery' && (
                    <AdminGalleryTab
                      setSuccessMessage={setSuccessMessage}
                      setErrorMessage={setErrorMessage}
                    />
                  )}

                  {activeTab === 'clients' && (
                    <AdminClientsTab
                      formatBRL={formatBRL}
                    />
                  )}

                  {activeTab === 'agenda' && (
                    <AdminAgendaTab
                      showFeedback={showFeedback}
                    />
                  )}

                  {activeTab === 'settings' && (
                    <AdminSettingsTab
                      showFeedback={showFeedback}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          <nav className="fixed left-0 top-0 h-screen w-72 bg-gradient-to-b from-slate-900 to-slate-950 text-slate-300 flex flex-col z-30 md:hidden shadow-2xl">
            <div className="p-8 border-b border-slate-700/50">
              <h1 className="text-lg font-black text-white mb-1">{config.name}</h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Painel Administrativo</p>
            </div>

            <div className="flex-1 px-4 py-6 space-y-3 overflow-y-auto">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl font-bold text-sm transition-all ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white'
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            <div className="p-6 border-t border-slate-700/50 space-y-4">
              <div className="flex items-center gap-4 px-3 py-4 bg-slate-800/30 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center font-bold text-white flex-shrink-0">
                  {currentUser?.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm truncate">{compactUserName}</p>
                  <p className="text-xs text-slate-400 truncate">{currentUser?.email}</p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-slate-800/50 hover:bg-rose-500/10 text-slate-300 hover:text-rose-400 transition-all border border-slate-700/50 flex items-center justify-center gap-2"
              >
                <LogOut size={16} />
                Sair
              </button>
            </div>
          </nav>
        </>
      )}
    </div>
  );
};

// Segunda camada de proteção RBAC, independente da checagem já feita em
// App.tsx. Não muda nenhum comportamento visível hoje (App.tsx já barra
// quem não é admin antes de chegar aqui) — é só uma rede de segurança
// extra caso este componente venha a ser renderizado por outro caminho no
// futuro.
export const AdminDashboard = withRoleGuard(AdminDashboardInner, 'admin');
