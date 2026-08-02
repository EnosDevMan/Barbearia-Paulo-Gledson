# Paulo Gledson Barbearia — Agendamento Online

Aplicação de agendamento para barbearia: landing page pública, fluxo de
reserva (com ou sem conta), painel do cliente, painel do barbeiro e painel
administrativo. Frontend em React 19 + TypeScript + Vite + Tailwind v4,
backend em Supabase (Postgres + Auth + Storage).

## Stack

- **Frontend:** React 19, TypeScript, Vite 6, Tailwind CSS v4, Zustand
- **Backend:** Supabase (Postgres, Auth, Row Level Security, Storage, RPCs em PL/pgSQL)
- **Testes:** Vitest + Testing Library

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # preencha com as credenciais do seu projeto Supabase
npm run dev
```

Variáveis de ambiente necessárias (ver `.env.example`):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Nunca use a **service role key** no frontend — apenas a chave anônima
(`anon`), que é segura para expor no cliente porque toda a autorização é
feita via Row Level Security no banco.

A chave PIX de recebimento é única, fica em **Admin → Configurações do
Salão → Pagamentos** e só pode ser alterada por um usuário com papel
`admin`. Barbeiros não podem editar nem substituir a chave apresentada ao
cliente.

## Banco de dados (Supabase)

As migrations em `supabase/migrations/` devem ser aplicadas em ordem:

1. `0001_initial_schema.sql` — tabelas, enums, RLS inicial
2. `0002_create_booking_rpc.sql` — função de criação de agendamento (com lock/anti-conflito)
3. `0003_storage_avatars.sql` — bucket de avatares e suas policies
4. `0004_security_and_integrity_fixes.sql` — correções de segurança (ver seção abaixo)
5. `0005_special_hours_availability.sql` — disponibilidade real de "Horário Especial" (dia parcial)
6. `0006_booking_rate_limit.sql` — limite de agendamentos por telefone (anti-abuso no agendamento de convidado)
7. `0007_free_booking_status_fix.sql` — agendamento sem taxa de reserva não fica mais preso em "Aguardando pagamento"
8. `0008_gallery_photos.sql` — tabela e bucket de storage para a galeria de cortes exibida na home
9. `0009_barber_self_profile.sql` — permite o barbeiro editar o próprio nome/foto/especialidade/descrição (tela "Meu Perfil")
10. `0010_production_hardening.sql` — fecha bypass do RPC, valida preço/agenda no banco e endurece uploads
11. `0011_single_admin_pix_key.sql` — remove chaves por barbeiro e mantém um único PIX administrativo
12. `0012_serialize_booking_rate_limits.sql` — aplica o lock por telefone também em bancos que já executaram a migration 0010

Via Supabase CLI:

```bash
supabase link --project-ref <seu-project-ref>
supabase db push
```

Depois de aplicar as migrations, rode `supabase/seed.sql` (opcional) para
popular dados de exemplo — **não rode em produção**, é só para desenvolvimento.

### Sobre a migration 0004

Uma auditoria encontrou e corrigiu problemas reais de segurança e
integridade no schema original (detalhes nos comentários do próprio
arquivo `0004_security_and_integrity_fixes.sql`):

- Um cliente autenticado conseguia se auto-promover a `admin` chamando a
  REST API do Supabase diretamente (a policy de UPDATE em `profiles` não
  tinha `WITH CHECK`).
- Faltavam policies de `DELETE` em `profiles` e `bookings` (exclusão
  falhava silenciosamente, sem erro).
- Um cliente conseguia alterar valor/status de pagamento do próprio
  agendamento via API direta.
- `create_booking` permitia criar agendamento em nome de outro usuário.
- Reagendamento não revalidava conflito de horário no servidor (condição de corrida).

Depois de aplicar essa migration em produção, **revise as chaves PIX**
cadastradas nos barbeiros/configuração — o código anteriormente tinha um
fallback de chave PIX fixa que nunca deveria ter existido; se ela chegou a
ser exibida para algum cliente real, avise-o.

## Configuração no painel do Supabase (fora do código, fácil de esquecer)

- **Domínio de produção: `https://barbeariapaulogledson.vercel.app`**
- **Authentication → URL Configuration**: defina o **Site URL** como
  `https://barbeariapaulogledson.vercel.app` e adicione a mesma URL em
  **Redirect URLs**. O código já envia explicitamente a origem da página
  atual como destino do redirecionamento (`emailRedirectTo`/`redirectTo`),
  mas o Supabase só aceita se o domínio estiver nessa lista — por padrão,
  num projeto novo, isso aponta para `localhost` e os links de confirmação
  de e-mail/recuperação de senha ficam quebrados em produção até isso ser
  corrigido.
- **Authentication → Email Templates**: os e-mails padrão do Supabase
  (confirmação de cadastro, recuperação de senha) vêm em inglês, com
  branding genérico do Supabase. Vale personalizar para português e com a
  identidade da barbearia.
- **Authentication → Providers → Email**: confira se "Confirm email" está
  ligado ou desligado conforme o comportamento que você quer (o código já
  trata os dois casos — `pendingConfirmation` em `LoginModal.tsx`).

## Painel Admin: Visão Geral (diária) vs. Relatórios (histórico completo)

- **Visão Geral** agora é estritamente o *Relatório Diário* — todos os
  números (faturamento, agendamentos, pendências, novos clientes) são
  escopados a HOJE. Antes, misturava "hoje" com totais desde a abertura da
  barbearia, o que confundia os dois.
- **Relatórios** é a aba nova, com filtro de período: Diário / Semanal /
  Mensal / Anual / **Personalizado** (data inicial e final, com bucket
  automático — dia a dia se o intervalo for curto, por semana se for médio,
  por mês se for longo, para o gráfico não virar uma faixa ilegível de
  barras minúsculas).
- Ambas as telas (e os filtros) foram desenhadas mobile-first: cards
  empilham em vez de tabela apertada, abas de período quebram em 2 linhas
  em vez de espremer 5 opções numa só.

## Segurança e produção — o que foi adicionado

- **`vercel.json`**: cabeçalhos de segurança (CSP, X-Frame-Options,
  Referrer-Policy, Permissions-Policy). O CSP libera exatamente os domínios
  externos que o app usa (Supabase, fontes do Google Fonts, avatares
  padrão de `ui-avatars.com`/`api.dicebear.com`) — se você adicionar uma
  nova integração externa (ex: outro serviço de avatar, analytics), vai
  precisar atualizar o CSP em `vercel.json`, senão o navegador bloqueia
  silenciosamente a requisição.
- **Limite de agendamentos por telefone** (migration `0006`): no máximo 3
  agendamentos simultâneos aguardando pagamento e 5 criados nas últimas 24h
  por telefone — evita que o agendamento de convidado (sem login, sem
  captcha) seja usado para lotar a agenda com reservas falsas.
- **Política de Privacidade** (`/src/components/PrivacyPolicyPage.tsx`) +
  checkbox de consentimento obrigatório no cadastro. ⚠️ **O texto é um
  ponto de partida, não foi revisado por advogado.** Ajuste às suas
  práticas reais e peça revisão jurídica antes de publicar — a LGPD se
  aplica independente do porte do negócio.
- Fontes (Google Fonts) movidas de `@import` no CSS para `<link
  rel="preconnect">` no `index.html` — carregamento bem mais rápido (evita
  uma cadeia de 3 requisições em série antes da fonte aparecer).

## Limitações conhecidas / próximos passos

- `dataService.loadAllData()` busca **todos** os agendamentos já criados,
  sem limite de data (`bookings.select('*')`, sem `.limit()`/filtro de
  período). Para uma barbearia nova isso não é problema, mas é uma
  degradação de performance previsível conforme o histórico cresce (ex:
  ~10 mil linhas depois de alguns anos de operação) — toda vez que
  qualquer pessoa abre o site, admin/barbeiro carregam essa tabela
  inteira. Não mudei isso agora porque exigiria decidir com cuidado o que
  cada tela realmente precisa (cálculo de disponibilidade só precisa de
  agendamentos futuros/recentes; o histórico do cliente e os totais de
  faturamento do admin precisam do histórico completo) — é uma mudança de
  arquitetura de dados, não um bug pontual, e eu não tenho como testar o
  resultado aqui. Quando o volume de agendamentos crescer bastante, vale
  revisitar: buscar só uma janela recente/futura para o cálculo de
  disponibilidade, e paginar separadamente qualquer relatório histórico.
- Sem testes automatizados de integração para os fluxos de agendamento,
  admin e barbeiro — há testes unitários para `utils/validation.ts`,
  `utils/lookups.ts` e `utils/whatsapp.ts`, mas nada de ponta a ponta.
  Recomendado priorizar testes E2E (Playwright/Cypress) para os fluxos
  críticos: agendar, cancelar, reagendar, confirmar pagamento.
- Sem monitoramento de erros em produção (ex: Sentry) — há um
  `ErrorBoundary` genérico, mas nenhum serviço externo configurado.

## Scripts

```bash
npm run dev          # servidor de desenvolvimento
npm run build        # build de produção
npm run preview      # servir o build localmente
npm run typecheck    # checagem de tipos (tsc --noEmit)
npm run lint         # ESLint
npm test             # testes (vitest run)
```
