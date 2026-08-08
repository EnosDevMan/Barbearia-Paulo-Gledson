# Paulo Gledson Barbearia — Agendamento Online

Aplicação React 19, TypeScript, Vite, Zustand e Supabase para agendamento convidado/autenticado e painéis de cliente, barbeiro e administrador.

## Requisitos e execução

- Node.js 22 LTS (veja `.nvmrc` e `package.json`)
- Projeto Supabase existente; nenhuma `service_role` deve ir para o navegador

```bash
npm ci
cp .env.example .env.local
npm run lint && npm run typecheck && npm test && npm run build
```

Preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`. O lockfile deve ser usado com `npm ci` em CI/Vercel.

## Banco e migrations

`supabase/schema.sql` é o bootstrap completo para um projeto novo e vazio. Ele não fica em `supabase/migrations`, porque o Supabase Branching cria previews a partir do banco já existente e depois executa as migrations pendentes; tratar o bootstrap como migration tentaria recriar tipos e tabelas existentes.

As migrations em `supabase/migrations` são somente incrementais e devem ser executadas em ordem, sem editar arquivos já aplicados:

1. `202608020001_secure_guest_booking_and_profile_phone.sql`: identidade do convidado e telefone do perfil;
2. `202608020002_gallery_order_and_query_indexes.sql`: `display_order`, índices de paginação e grants explícitos de RPC;
3. `202608040001_avatars_barber_self_upload.sql`: upload do próprio avatar pelo profissional;
4. `202608080001_weekly_schedule_business_validation.sql`: validação autoritativa dos horários específicos de cada dia da semana.

```bash
supabase link --project-ref <project-ref>
supabase db push
```

Para criar um projeto vazio, aplique primeiro `supabase/schema.sql`. Em bancos existentes e nos previews do Supabase Branching, execute apenas `supabase db push`; nunca reaplique o bootstrap.

O `seed.sql` é exclusivamente local. Antes de produção, valide as migrations em uma cópia do banco e mantenha backup/PITR. Rollback deve restaurar o backup ou usar uma nova migration reversa; nunca altere migration aplicada.

## Configuração de produção

No Supabase, configure Site URL e Redirect URLs com o domínio final, confirme o provedor de e-mail e traduza os templates. Configure SMTP de produção, políticas de senha e backups. Os buckets públicos `avatars` e `gallery` são criados pelas migrations, limitados a JPG/PNG/WEBP e 5 MB; escrita é protegida por RLS.

Na Vercel, use Node 22, `npm ci`, `npm run build`, diretório `dist` e apenas as duas variáveis `VITE_*`. Marque ambas as variáveis para os ambientes **Production** e **Preview**; variáveis habilitadas somente em Production não são injetadas nos deploys de branches e pull requests. Depois de alterar o escopo, faça um redeploy do branch. Os headers de segurança estão em `vercel.json`.

## Notas operacionais

- Datas civis e regras de agenda usam `America/Fortaleza`; valores são BRL e telefones são normalizados como brasileiros.
- Criação e reagendamento usam RPCs transacionais, locks e validação de conflito no banco. A criação de convidado possui limite por telefone.
- A carga pública evita tabelas protegidas. Dados autenticados são lidos em páginas de 500 registros, respeitando RLS.
- Galeria: upload, ordem persistida por `display_order`, drag-and-drop nativo, controles por teclado e remoção do Storage antes do registro.
- O WhatsApp é apenas um link iniciado pelo usuário.
- Os textos legais representam **aderência técnica e documental**, não declaração de conformidade jurídica. Prazos reais de retenção e contato do controlador precisam ser formalizados e revisados juridicamente antes do deploy.
