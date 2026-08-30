import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Search } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/ui/Misc";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { PATIENTS } from "@/data";
import { fullDate } from "@/lib/format";

interface Row {
  patientId: string;
  patientNome: string;
  data: Date;
  profissional: string;
  tipo: string;
  queixa: string;
}

export function Records() {
  const [q, setQ] = useState("");

  const rows = useMemo<Row[]>(() => {
    const all: Row[] = [];
    PATIENTS.forEach((p) =>
      p.prontuario.forEach((e) =>
        all.push({ patientId: p.id, patientNome: p.nome, data: e.data, profissional: e.profissional, tipo: e.tipo, queixa: e.queixa })
      )
    );
    return all
      .filter((r) => !q.trim() || r.patientNome.toLowerCase().includes(q.toLowerCase()) || r.tipo.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => +b.data - +a.data);
  }, [q]);

  return (
    <div className="fade-in">
      <PageHeader title="Prontuários" subtitle="Evoluções clínicas de todos os pacientes" />

      <div className="mb-4 flex w-full max-w-xs items-center gap-2 rounded-[10px] border border-line bg-white px-3 py-2">
        <Search size={15} className="text-faint" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por paciente ou tipo" className="w-full bg-transparent text-[13px] outline-none placeholder:text-faint" />
      </div>

      <Card className="divide-y divide-line">
        {rows.map((r, i) => (
          <Link key={i} to={`/pacientes/${r.patientId}`} className="focusable flex items-center gap-4 px-5 py-3.5 hover:bg-surface-2/60">
            <Avatar name={r.patientNome} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13.5px] font-medium text-ink">{r.patientNome}</p>
              <p className="truncate text-[12px] text-muted">{r.queixa}</p>
            </div>
            <Badge tone="primary" size="sm" className="hidden sm:inline-flex">{r.tipo}</Badge>
            <div className="hidden text-right md:block">
              <p className="text-[12px] text-ink">{fullDate(r.data)}</p>
              <p className="text-[11px] text-faint">{r.profissional}</p>
            </div>
            <ChevronRight size={16} className="text-faint" />
          </Link>
        ))}
        {rows.length === 0 && <EmptyState title="Nenhuma evolução encontrada" />}
      </Card>
    </div>
  );
}
