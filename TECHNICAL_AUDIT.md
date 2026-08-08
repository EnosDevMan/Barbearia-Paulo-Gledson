# Relatório de auditoria técnica

Data da revisão: 8 de agosto de 2026.

## Escopo revisado

Foram inspecionados os fluxos de agendamento e reagendamento, o motor único de
disponibilidade, bloqueios e horários especiais, stores e persistência no
Supabase, autenticação/RLS, painéis de administrador, barbeiro e cliente,
relatórios financeiros, configurações, navegação, estados de erro e os layouts
responsivos. A revisão também incluiu lint, TypeScript, testes automatizados e
build de produção.

## Bugs corrigidos nesta revisão

1. **Autoconflito no reagendamento.** A tela do cliente calculava a agenda sem
   excluir o agendamento editado e depois reinseria manualmente somente seu
   horário original. Isso escondia horários legítimos que se sobrepunham ao
   agendamento atual. O identificador agora percorre a API da store até o motor
   compartilhado de disponibilidade.
2. **Resposta assíncrona obsoleta.** Trocas rápidas de data podiam fazer uma
   requisição antiga terminar por último e substituir os horários da data mais
   recente. Cada carga agora possui uma sequência e somente a última resposta
   pode atualizar o estado.
3. **Falha silenciosa ao consultar horários.** Erros eram convertidos em uma
   lista vazia, fazendo indisponibilidade técnica parecer agenda lotada. A tela
   agora apresenta uma mensagem acionável e mantém o estado de loading coerente.
4. **Mutação do estado global durante renderização.** A ordenação dos barbeiros
   chamava `sort` diretamente no array do Zustand. A tela agora ordena uma cópia,
   evitando alteração silenciosa da fonte de verdade e renderizações
   imprevisíveis em outros consumidores.
5. **Autenticação travada após falha de rede.** Login e cadastro podiam rejeitar
   a Promise fora do fluxo esperado e deixar o estado global em carregamento
   indefinido. As ações agora encerram o loading e mostram erro acionável em
   qualquer falha; o cadastro só anuncia sessão autenticada quando o perfil
   também foi carregado.
6. **Recuperação de senha duplicada.** O formulário não possuía estado de envio,
   permitindo vários cliques e requisições simultâneas. O botão agora fica
   bloqueado, informa o progresso e trata também falhas inesperadas.
7. **Tela protegida remanescente após logout.** Ao sair pelo cabeçalho, a pessoa
   permanecia na rota interna e via uma mensagem de acesso restrito. A aplicação
   agora retorna automaticamente ao início assim que uma sessão protegida acaba.
8. **Divisão de bundle ineficaz.** O provedor de autenticação era importado de
   forma estática pela store e dinâmica pelo modal, gerando aviso no build sem
   benefício de carregamento. O modal agora usa a importação estática coerente.
9. **Falha de agenda apresentada como lotação.** No agendamento público, uma
   indisponibilidade de rede/banco era convertida silenciosamente em lista
   vazia. Agora a tela diferencia erro operacional de um dia realmente sem
   vagas e orienta uma nova tentativa, evitando informação enganosa.
10. **Erro de perfil tratado como usuário inexistente.** A consulta de perfil
    descartava qualquer erro do Supabase, inclusive falhas de rede e permissão.
    Somente a ausência real do registro agora retorna `null`; erros operacionais
    percorrem o fluxo de tratamento existente.
11. **Corrida entre navegações.** Cliques rápidos criavam timers concorrentes e
    uma transição antiga podia abrir uma tela diferente da última selecionada.
    A aplicação agora cancela a transição pendente e também limpa o timer ao
    desmontar.
12. **Configurações inválidas e envios duplicados.** Era possível persistir taxa
    negativa/ilegível, tolerância inválida e expediente com abertura posterior
    ao fechamento, além de disparar salvamentos simultâneos. O formulário agora
    valida esses estados, normaliza campos básicos e bloqueia reenvio enquanto
    aguarda a confirmação do banco.

## Controles existentes validados

- Criação e reagendamento são confirmados pelo banco por RPC transacional, com
  lock por barbeiro/data, revalidação de conflitos e rollback visual em falha.
- Cancelamento, confirmação, presença e conclusão aguardam persistência e
  restauram o estado otimista quando a operação falha.
- Disponibilidade de cliente, administrador e barbeiro usa o mesmo motor para
  duração composta, intervalo, pausa, bloqueio global/individual, férias,
  folga, horário especial e horário semanal por profissional.
- Receita considera apenas serviços concluídos; cancelamentos e não
  comparecimentos não entram como pendência. Filtros e gráficos compartilham o
  mesmo intervalo civil.
- Dados protegidos são removidos antes da troca de sessão, leituras extensas são
  paginadas e RLS restringe perfis, agendamentos e operações administrativas.
- Telas tabulares críticas possuem alternativa em cards no celular ou overflow
  controlado em larguras maiores.

## Arquivos alterados e justificativa

- `src/store/appStore.ts`: propagação opcional do agendamento excluído, mantendo
  compatibilidade com todos os chamadores atuais.
- `src/features/customer/hooks/useCustomerDashboard.ts`: consulta correta de
  reagendamento, proteção contra corrida entre respostas e feedback de erro.
- `src/features/admin/components/AdminBarbersTab.tsx`: ordenação imutável.
- `src/utils/scheduling.test.ts`: regressões automatizadas para ocupação normal e
  exclusão explícita no reagendamento.
- `src/auth/store/useAuthStore.ts`: recuperação consistente de falhas assíncronas,
  validação conjunta de sessão/perfil e limpeza local garantida no logout.
- `src/components/LoginModal.tsx`: envio único e resiliente da recuperação de
  senha, com feedback visual durante a requisição.
- `src/App.tsx`: redirecionamento seguro para o início após perda da sessão.
- `src/features/booking/hooks/useBookingFlow.ts` e
  `src/features/booking/components/DateTimeSelectionStep.tsx`: estado de erro
  explícito na consulta de disponibilidade, sem confundi-lo com agenda lotada.
- `src/features/booking/components/DateTimeSelectionStep.test.tsx`: cobertura de
  regressão para a distinção entre erro operacional e ausência real de vagas.
- `src/components/BookingFlow.tsx`: propagação do estado de falha até a etapa de
  seleção de data e horário.
- `src/services/dataService.ts`: preservação de erros operacionais na consulta
  de perfil.
- `src/features/admin/components/AdminSettingsTab.tsx`: validação preventiva de
  configurações e proteção contra persistências simultâneas.
- `src/App.tsx`: cancelamento determinístico de transições concorrentes.

## Riscos e melhorias futuras

- Validar migrations em uma cópia recente do banco, com backup/PITR, continua
  obrigatório antes de qualquer `supabase db push` em produção.
- Recomenda-se teste E2E em dispositivos reais (Safari/iPhone, Chrome/Android e
  Samsung Internet), pois jsdom e o build não reproduzem teclado virtual,
  viewport dinâmica nem particularidades de WebKit.
- O envio de WhatsApp é intencionalmente iniciado pelo usuário; para notificações
  automáticas seria necessário backend e provedor externo, o que seria uma nova
  funcionalidade e ficou fora desta auditoria.
- Exclusão de conta em `auth.users` requer backend seguro com service role. O
  cliente atual remove apenas o perfil, por desenho; qualquer mudança exige uma
  política formal de retenção e não deve ser feita apenas no navegador.
