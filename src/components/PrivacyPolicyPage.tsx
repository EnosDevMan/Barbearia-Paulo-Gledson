import React from 'react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { useApp } from '../store/useApp';

interface PrivacyPolicyPageProps {
  onBack: () => void;
}

/**
 * Página de Política de Privacidade.
 *
 * IMPORTANTE — leia antes de publicar: o texto abaixo descreve, de forma
 * factual, o que ESTE APLICATIVO realmente coleta e faz com os dados (isso
 * eu sei com certeza, pela leitura do código). NÃO é um parecer jurídico
 * nem foi revisado por um advogado. Antes de publicar de verdade:
 *   1) Ajuste o texto para refletir suas práticas reais (prazo de retenção
 *      de dados, se você usa alguma ferramenta de analytics/terceiro além
 *      do Supabase, etc.).
 *   2) Peça revisão de um advogado — a LGPD (Lei 13.709/2018) se aplica a
 *      qualquer negócio que colete dados pessoais (nome, e-mail, telefone),
 *      independente do porte.
 *   3) Preencha o e-mail/telefone de contato para solicitações sobre dados.
 */
export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onBack }) => {
  const { config } = useApp();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-8"
      >
        <ArrowLeft size={16} /> Voltar
      </button>

      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
          <ShieldCheck size={20} />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Política de Privacidade</h1>
      </div>
      <p className="text-sm text-slate-400 mb-8">Última atualização: a preencher antes de publicar.</p>

      <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 leading-relaxed">
        <strong>Aviso:</strong> este texto é um ponto de partida gerado automaticamente,
        descrevendo o que este sistema efetivamente coleta e faz com os dados.
        Não substitui revisão jurídica. Ajuste-o às suas práticas reais e peça a
        um advogado para revisar antes de publicar — a LGPD (Lei nº 13.709/2018)
        se aplica a qualquer negócio que colete dados pessoais, independente do porte.
      </div>

      <div className="prose prose-slate prose-sm max-w-none space-y-6 text-slate-700 leading-relaxed">
        <section>
          <h2 className="text-base font-bold text-slate-900 mb-2">1. Quem somos</h2>
          <p>
            Esta política se aplica ao site e sistema de agendamento de{' '}
            <strong>{config.name || 'nossa barbearia'}</strong>
            {config.address ? <> ({config.address})</> : null}.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 mb-2">2. Quais dados coletamos</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Ao criar uma conta:</strong> nome, e-mail e telefone.</li>
            <li><strong>Ao agendar um horário</strong> (com ou sem conta): nome, telefone, e-mail (quando informado), serviço escolhido, profissional, data/horário e eventuais observações que você escrever.</li>
            <li><strong>Automaticamente:</strong> data de criação da conta/do agendamento, e o histórico de status do seu agendamento (aguardando pagamento, confirmado, concluído, cancelado).</li>
          </ul>
          <p className="mt-2">Não coletamos dados de pagamento (a taxa de reserva é paga via PIX, diretamente para a chave PIX informada — não processamos nem armazenamos dados de cartão ou do seu aplicativo bancário).</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 mb-2">3. Para que usamos esses dados</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Criar, exibir e gerenciar seus agendamentos;</li>
            <li>Entrar em contato pelo WhatsApp sobre confirmação, pagamento ou lembrete do seu horário;</li>
            <li>Mostrar seu histórico de agendamentos, caso você tenha uma conta;</li>
            <li>Prevenir abuso do sistema de agendamento (ex: limitar o número de agendamentos simultâneos não pagos por telefone).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 mb-2">4. Com quem compartilhamos</h2>
          <p>
            Seus dados ficam armazenados no Supabase (nosso provedor de banco de
            dados e autenticação). A equipe da barbearia (administradores e
            profissionais cadastrados) tem acesso aos dados necessários para
            atender você — profissionais veem apenas os agendamentos da própria
            agenda, não os de outros clientes. Não vendemos nem compartilhamos
            seus dados com terceiros para fins de marketing.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 mb-2">5. Seus direitos</h2>
          <p>
            Você pode solicitar a qualquer momento a correção, exportação ou
            exclusão dos seus dados, entrando em contato pelo telefone/WhatsApp{' '}
            <strong>{config.phone || '(a preencher)'}</strong>.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 mb-2">6. Alterações nesta política</h2>
          <p>
            Podemos atualizar esta política periodicamente. A data no topo desta
            página indica a versão mais recente.
          </p>
        </section>
      </div>
    </div>
  );
};
