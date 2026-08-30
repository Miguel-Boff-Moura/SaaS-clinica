import { useNavigate } from "react-router-dom";
import { CalendarPlus, FilePlus2, Stethoscope, UserPlus, Wallet } from "lucide-react";
import { cn } from "@/lib/cn";
import { useToast } from "@/components/ui/Toast";

export interface QuickAction {
  key: string;
  label: string;
  desc: string;
  icon: typeof UserPlus;
  run: () => void;
}

export function useQuickActions(afterRun?: () => void): QuickAction[] {
  const navigate = useNavigate();
  const toast = useToast();
  const done = (fn?: () => void) => {
    fn?.();
    afterRun?.();
  };
  return [
    {
      key: "paciente",
      label: "Novo paciente",
      desc: "Cadastro rápido e ficha inicial",
      icon: UserPlus,
      run: () => done(() => { navigate("/pacientes"); toast.success("Cadastro de paciente", "Formulário de novo paciente aberto."); }),
    },
    {
      key: "agendamento",
      label: "Novo agendamento",
      desc: "Marcar horário na agenda",
      icon: CalendarPlus,
      run: () => done(() => { navigate("/agenda?novo=1"); toast.success("Novo agendamento", "Selecione paciente, horário e profissional."); }),
    },
    {
      key: "atendimento",
      label: "Novo atendimento",
      desc: "Iniciar atendimento avulso",
      icon: Stethoscope,
      run: () => done(() => { navigate("/atendimentos"); toast.info("Atendimento", "Escolha o paciente para iniciar."); }),
    },
    {
      key: "orcamento",
      label: "Novo orçamento",
      desc: "Montar proposta comercial",
      icon: FilePlus2,
      run: () => done(() => { navigate("/vendas?novo=1"); toast.success("Novo orçamento", "Adicione procedimentos, produtos e pacotes."); }),
    },
    {
      key: "pagamento",
      label: "Registrar pagamento",
      desc: "Lançar recebimento no caixa",
      icon: Wallet,
      run: () => done(() => { navigate("/financeiro"); toast.success("Pagamento registrado", "Recebimento lançado no fluxo de caixa."); }),
    },
  ];
}

export function QuickActionGrid({
  onRun,
  columns = 5,
}: {
  onRun?: () => void;
  columns?: number;
}) {
  const actions = useQuickActions(onRun);
  return (
    <div
      className="grid gap-2.5"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))` }}
    >
      {actions.map((a) => (
        <button
          key={a.key}
          onClick={a.run}
          className={cn(
            "focusable group flex flex-col items-start gap-2 rounded-xl border border-line bg-white p-3.5 text-left transition-colors hover:border-primary/40 hover:bg-primary-soft/40"
          )}
        >
          <span className="flex size-9 items-center justify-center rounded-[10px] bg-primary-soft text-primary-ink transition-colors group-hover:bg-primary group-hover:text-white">
            <a.icon size={17} />
          </span>
          <span>
            <span className="block text-[13px] font-semibold text-ink">{a.label}</span>
            <span className="mt-0.5 block text-[11px] text-faint">{a.desc}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
