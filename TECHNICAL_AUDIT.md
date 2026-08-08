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
5. **Sucesso antes da persistência na agenda.** Inclusão e exclusão de bloqueios,
   assim como alterações de status na agenda global, disparavam Promises sem
   aguardar seu resultado. A interface podia anunciar sucesso mesmo quando o
   Supabase rejeitava a operação. Todas essas ações agora aguardam confirmação,
   tratam a falha e bloqueiam submissões duplicadas enquanto estão em andamento.
6. **Configuração semanal divergente no banco.** A interface e o motor de slots
   já utilizavam `weeklySchedule`, porém a validação autoritativa do Postgres
   verificava somente os campos legados `daysOpen/open/close`. Uma reserva válida
   na terça poderia ser rejeitada — ou uma inválida, fora do horário daquele dia,
   aceita. O bootstrap e uma migration incremental agora resolvem o horário do
   dia antes de validar abertura, fechamento e pausa, mantendo fallback integral
   para configurações antigas.
7. **Bloqueios estruturalmente inválidos.** O formulário aceitava fim anterior
   ao início, períodos invertidos e pausas fora do horário especial. A validação
   impede esses dados antes da persistência, sem mudar as regras de agenda.
8. **Autenticação travada após falha de rede.** Login e cadastro podiam rejeitar
   a Promise fora do fluxo esperado e deixar o estado global em carregamento
   indefinido. As ações agora encerram o loading e mostram erro acionável em
   qualquer falha; o cadastro só anuncia sessão autenticada quando o perfil
   também foi carregado.
9. **Recuperação de senha duplicada.** O formulário não possuía estado de envio,
   permitindo vários cliques e requisições simultâneas. O botão agora fica
   bloqueado, informa o progresso e trata também falhas inesperadas.
10. **Tela protegida remanescente após logout.** Ao sair pelo cabeçalho, a pessoa
   permanecia na rota interna e via uma mensagem de acesso restrito. A aplicação
   agora retorna automaticamente ao início assim que uma sessão protegida acaba.
11. **Divisão de bundle ineficaz.** O provedor de autenticação era importado de
   forma estática pela store e dinâmica pelo modal, gerando aviso no build sem
   benefício de carregamento. O modal agora usa a importação estática coerente.

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
  exclusão explícita no reagendamento, horário semanal, pausa e dia fechado.
- `src/features/admin/components/agenda/ScheduleBlockForm.tsx`: persistência
  aguardada, prevenção de submissão duplicada, tratamento de erros e validação
  cronológica.
- `src/features/admin/components/AdminAgendaTab.tsx`: feedback de status somente
  depois da confirmação do Supabase.
- `supabase/schema.sql` e a migration incremental de 08/08/2026: paridade entre
  a disponibilidade semanal do frontend e a validação obrigatória do banco.
- `README.md`: ordem real e finalidade das migrations documentadas.
- `src/auth/store/useAuthStore.ts`: recuperação consistente de falhas assíncronas,
  validação conjunta de sessão/perfil e limpeza local garantida no logout.
- `src/components/LoginModal.tsx`: envio único e resiliente da recuperação de
  senha, com feedback visual durante a requisição.
- `src/App.tsx`: redirecionamento seguro para o início após perda da sessão.

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
