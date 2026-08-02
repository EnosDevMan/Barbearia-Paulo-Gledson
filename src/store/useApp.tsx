import React, { useEffect } from 'react';
import { useAppStore } from './appStore';
import { useDataStore } from './dataStore';
import { useConfigStore } from './configStore';
import { useAuthStore } from '../auth/store/useAuthStore';
import { dataService } from '../services/dataService';

export const useApp = useAppStore;

/**
 * Seletores granulares (opcionais) para otimização de performance.
 *
 * `useApp()` combina 3 stores (dados, config, auth) num hook só, sem
 * seletor — qualquer componente que o use re-renderiza sempre que
 * QUALQUER uma das 3 stores muda, mesmo que só use uma fatia pequena do
 * estado (ex: um componente que só precisa de `config` também re-renderiza
 * quando `bookings` muda). Isto não é um bug (o app funciona corretamente
 * hoje), mas é um desperdício de renderizações em telas com muitos
 * componentes.
 *
 * Estes hooks abaixo são um jeito seguro e ADITIVO de mitigar isso: cada
 * um assina só a fatia específica do estado via seletor do Zustand, então
 * só re-renderiza quando AQUELA fatia muda de verdade. Nenhum consumidor
 * existente de `useApp()` foi alterado — são só ferramentas disponíveis
 * para quem for escrever/otimizar um componente novo (ou revisitar um
 * componente que hoje re-renderiza mais do que precisa).
 */
export const useBarbers = () => useDataStore(state => state.barbers);
export const useServices = () => useDataStore(state => state.services);
export const useBookings = () => useDataStore(state => state.bookings);
export const useScheduleBlocks = () => useDataStore(state => state.scheduleBlocks);
export const useGalleryPhotos = () => useDataStore(state => state.galleryPhotos);
export const useBarbershopConfig = () => useConfigStore(state => state.config);
export const useCurrentUser = () => useAuthStore(state => state.currentUser);

/**
 * Carrega os dados de negócio (barbeiros, serviços, agendamentos, config)
 * uma vez ao montar o app.
 *
 * Este componente NÃO é um React Context Provider (não envolve os filhos
 * em nenhum Context.Provider) — o estado real vive nas stores Zustand em
 * `src/store/*`. Além de carregar os dados de negócio, ele também dispara
 * a inicialização da sessão de autenticação (`src/auth/store/useAuthStore`),
 * já que ambos precisam acontecer uma única vez, na raiz do app.
 */
export const AppDataLoader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const setInitialData = useDataStore(state => state.setInitialData);
  const beginLoad = useDataStore(state => state.beginLoad);
  const setLoadError = useDataStore(state => state.setLoadError);
  const setConfig = useConfigStore(state => state.setConfig);
  const initializeAuth = useAuthStore(state => state.initialize);
  const authLoading = useAuthStore(state => state.loading);
  const currentUserId = useAuthStore(state => state.currentUser?.id);
  const currentUserRole = useAuthStore(state => state.currentUser?.role);

  useEffect(() => {
    const unsubscribe = initializeAuth();
    return unsubscribe;
  }, [initializeAuth]);

  useEffect(() => {
    // Aguarda a restauração da sessão antes de consultar tabelas protegidas
    // por RLS. Recarrega ao entrar/sair porque uma consulta anônima retorna
    // corretamente zero perfis/agendamentos e esse resultado não pode ser
    // reaproveitado no painel recém-autenticado.
    if (authLoading) return;

    let mounted = true;
    beginLoad();
    const loadData = async () => {
      try {
        const data = await dataService.loadAllData();
        if (mounted) {
          setConfig(data.config);
          setInitialData({
            barbers: data.barbers,
            services: data.services,
            bookings: data.bookings,
            users: data.users,
            scheduleBlocks: data.scheduleBlocks || [],
            galleryPhotos: data.galleryPhotos || []
          });
        }
      } catch (err) {
        // BUG CORRIGIDO: antes, um erro aqui (ex: Supabase sem as
        // migrations aplicadas, variáveis de ambiente erradas/ausentes,
        // sem rede) deixava `loading` travado em `true` para sempre — a
        // tela de carregamento nunca saía e nenhum erro aparecia pra quem
        // estivesse usando o site.
        if (mounted) {
          setLoadError(
            err instanceof Error ? err.message : 'Não foi possível carregar os dados da barbearia.'
          );
        }
      }
    };
    loadData();
    return () => { mounted = false; };
  }, [authLoading, beginLoad, currentUserId, currentUserRole, setConfig, setInitialData, setLoadError]);

  return <>{children}</>;
};
