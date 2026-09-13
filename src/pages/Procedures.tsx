import { useState, type FormEvent } from "react";
import { Clock, Plus } from "lucide-react";
import { PageHeader, SkeletonRows, EmptyState } from "@/components/ui/Misc";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useProcedures } from "@/hooks/useProcedures";
import { useAuth } from "@/lib/auth";
import { currency } from "@/lib/format";
import { cn } from "@/lib/cn";

export function Procedures() {
  const toast = useToast();
  const { profile } = useAuth();
  const { data, loading, error, create } = useProcedures();
  const [cat, setCat] = useState("Todas");
  const [modalOpen, setModalOpen] = useState(false);

  const cats = ["Todas", ...Array.from(new Set(data.map((p) => p.categoria).filter(Boolean)))];
  const list = data.filter((p) => cat === "Todas" || p.categoria === cat);
  const isAdmin = profile?.role === "admin";

  return (
    <div className="fade-in">
      <PageHeader
        title="Procedimentos"
        subtitle="Catálogo com duração e preço"
        actions={
          isAdmin && (
            <Button size="sm" onClick={() => setModalOpen(true)}>
              <Plus size={15} /> Novo procedimento
            </Button>
          )
        }
      />

      {cats.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={cn(
                "focusable rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                cat === c ? "border-primary bg-primary text-white" : "border-line bg-white text-muted hover:bg-surface-2"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {loading && <SkeletonRows rows={4} />}
      {!loading && error && <p className="text-sm text-danger">Erro ao carregar procedimentos: {error}</p>}
      {!loading && !error && list.length === 0 && (
        <EmptyState title="Nenhum procedimento cadastrado" description="Cadastre o primeiro procedimento do catálogo." />
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((p) => (
          <Card key={p.id}>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[14px] font-semibold text-ink">{p.nome}</p>
                  {p.categoria && <Badge tone="primary" size="sm" className="mt-1">{p.categoria}</Badge>}
                </div>
                <p className="font-display text-[18px] text-ink">{p.preco > 0 ? currency(p.preco) : "Cortesia"}</p>
              </div>
              <div className="mt-4 text-[12px] text-muted">
                <span className="inline-flex items-center gap-1.5"><Clock size={13} /> {p.duracao_min} min</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <NewProcedureModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={async (input) => {
          const { error } = await create(input);
          if (error) {
            toast.warning("Erro ao criar procedimento");
            return false;
          }
          toast.success("Procedimento criado");
          setModalOpen(false);
          return true;
        }}
      />
    </div>
  );
}

function NewProcedureModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (input: { nome: string; categoria: string; duracao_min: number; preco: number }) => Promise<boolean>;
}) {
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("");
  const [duracao, setDuracao] = useState("");
  const [preco, setPreco] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const ok = await onCreate({
      nome,
      categoria,
      duracao_min: Number(duracao),
      preco: Number(preco),
    });
    setSubmitting(false);
    if (ok) {
      setNome("");
      setCategoria("");
      setDuracao("");
      setPreco("");
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Novo procedimento"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" form="new-procedure-form" disabled={submitting}>
            {submitting ? "Salvando..." : "Salvar"}
          </Button>
        </>
      }
    >
      <form id="new-procedure-form" onSubmit={handleSubmit} className="flex flex-col gap-4 [&_input]:mt-1 [&_input]:w-full [&_input]:rounded-[10px] [&_input]:border [&_input]:border-line [&_input]:px-3 [&_input]:py-2 [&_input]:text-[13px]">
        <label className="text-[12px] font-medium text-muted">
          Nome
          <input required value={nome} onChange={(e) => setNome(e.target.value)} />
        </label>
        <label className="text-[12px] font-medium text-muted">
          Categoria / tipo de sessão
          <input value={categoria} onChange={(e) => setCategoria(e.target.value)} />
        </label>
        <label className="text-[12px] font-medium text-muted">
          Duração (min)
          <input required type="number" min={1} value={duracao} onChange={(e) => setDuracao(e.target.value)} />
        </label>
        <label className="text-[12px] font-medium text-muted">
          Preço (R$)
          <input required type="number" min={0} step="0.01" value={preco} onChange={(e) => setPreco(e.target.value)} />
        </label>
      </form>
    </Modal>
  );
}
