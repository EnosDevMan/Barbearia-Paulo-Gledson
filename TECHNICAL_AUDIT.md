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
