import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/Misc";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/Misc";
import { Avatar } from "@/components/ui/Avatar";
import { useToast } from "@/components/ui/Toast";
import { PACKAGE_TEMPLATES, PATIENTS, procedureById } from "@/data";
import { currency, mediumDate } from "@/lib/format";

export function Packages() {
  const toast = useToast();

  const ativos = PATIENTS.flatMap((p) =>
    p.pacotes.map((pk) => ({ patient: p, pk }))
  ).sort((a, b) => (a.pk.sessoesContratadas - a.pk.sessoesUsadas) - (b.pk.sessoesContratadas - b.pk.sessoesUsadas));

  return (
    <div className="fade-in">
      <PageHeader
        title="Pacotes"
        subtitle="Modelos de pacote e controle de sessões utilizadas"
        actions={<Button size="sm" onClick={() => toast.success("Pacote criado")}><Plus size={15} /> Novo modelo</Button>}
      />

      <h2 className="mb-3 text-[13px] font-semibold text-ink">Modelos disponíveis</h2>
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {PACKAGE_TEMPLATES.map((t) => (
          <Card key={t.id}>
            <div className="p-5">
              <p className="text-[14px] font-semibold text-ink">{t.nome}</p>
              <p className="mt-0.5 text-[12px] text-muted">{procedureById(t.procedimentoId)?.nome}</p>
              <p className="mt-4 font-display text-[22px] text-ink">{currency(t.preco)}</p>
              <p className="text-[12px] text-muted">{t.sessoes} sessões · {currency(Math.round(t.preco / t.sessoes))}/sessão</p>
              <p className="mt-2 text-[11px] text-faint">Validade de {t.validadeDias} dias</p>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="p-5">
          <CardHeader title="Pacotes ativos de pacientes" subtitle={`${ativos.filter((a) => a.pk.status === "ativo").length} em andamento`} />
        </div>
        <div className="divide-y divide-line">
          {ativos.map(({ patient, pk }) => {
            const restante = pk.sessoesContratadas - pk.sessoesUsadas;
            return (
              <Link key={pk.id} to={`/pacientes/${patient.id}`} className="focusable flex items-center gap-4 px-5 py-4 hover:bg-surface-2/60">
                <Avatar name={patient.nome} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-medium text-ink">{patient.nome}</p>
                  <p className="truncate text-[12px] text-muted">{pk.nome}</p>
                </div>
                <div className="hidden w-56 sm:block">
                  <div className="flex justify-between text-[11px] text-muted">
                    <span>{pk.sessoesUsadas}/{pk.sessoesContratadas} sessões</span>
                    <span>até {mediumDate(pk.validadeAte)}</span>
                  </div>
                  <ProgressBar className="mt-1" value={pk.sessoesUsadas} total={pk.sessoesContratadas} tone={restante <= 1 ? "warn" : "primary"} />
                </div>
                <Badge tone={pk.status === "ativo" ? "ok" : pk.status === "expirado" ? "danger" : "neutral"} size="sm">
                  {pk.status === "ativo" ? `${restante} restantes` : pk.status === "expirado" ? "Expirado" : "Concluído"}
                </Badge>
              </Link>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
