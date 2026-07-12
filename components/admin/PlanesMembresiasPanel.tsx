"use client";

import { useState, useEffect } from "react";
import { Crown, Users, Pencil, X, Check, Loader2, Plus, Trash2 } from "lucide-react";

type Plan = {
  id: string;
  nombre: string;
  precio: number;
  servicios: string[];
  iconColor: string;
  bgCard: string;
  borderCard: string;
  priceColor: string;
};

const PLANES_DEFAULT: Plan[] = [
  {
    id: "silver", nombre: "Silver", precio: 29,
    servicios: ["2 cortes al mes", "Acceso al Espacio VIP", "Ofertas exclusivas"],
    iconColor: "text-zinc-500", bgCard: "bg-white", borderCard: "border-zinc-200",
    priceColor: "text-zinc-700",
  },
  {
    id: "gold", nombre: "Gold", precio: 40,
    servicios: ["2 cortes al mes", "Barba incluida", "Perfilado de cejas", "Prioridad de agenda"],
    iconColor: "text-amber-500", bgCard: "bg-amber-50", borderCard: "border-amber-200",
    priceColor: "text-amber-600",
  },
  {
    id: "black", nombre: "Black", precio: 60,
    servicios: ["2 cortes Premium", "Barba + cejas", "Nariz y oído", "Lavado incluido"],
    iconColor: "text-[#C9A84C]", bgCard: "bg-white", borderCard: "border-[#C9A84C]/30",
    priceColor: "text-[#C9A84C]",
  },
];

function ModalEditServicios({ plan, onClose, onSave }: {
  plan: Plan;
  onClose: () => void;
  onSave: (id: string, servicios: string[]) => void;
}) {
  const [lista, setLista]     = useState<string[]>(plan.servicios);
  const [nuevo, setNuevo]     = useState("");
  const [saving, setSaving]   = useState(false);
  const [ok, setOk]           = useState(false);

  function agregar() {
    const txt = nuevo.trim();
    if (!txt || lista.includes(txt)) return;
    setLista(p => [...p, txt]);
    setNuevo("");
  }

  async function guardar() {
    setSaving(true);
    await new Promise(r => setTimeout(r, 300));
    onSave(plan.id, lista);
    setSaving(false);
    setOk(true);
    setTimeout(() => { setOk(false); onClose(); }, 900);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <Crown className={`w-4 h-4 ${plan.iconColor}`} />
            <h3 className="font-semibold text-zinc-900">Servicios del plan {plan.nombre}</h3>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-3">
          {lista.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="flex-1 text-sm text-zinc-700 bg-zinc-50 rounded-lg px-3 py-2">{s}</span>
              <button
                onClick={() => setLista(p => p.filter((_, idx) => idx !== i))}
                className="p-1.5 rounded-lg text-zinc-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <div className="flex gap-2 pt-1">
            <input
              autoFocus
              value={nuevo}
              onChange={e => setNuevo(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") agregar(); }}
              placeholder="Añadir servicio o beneficio..."
              className="flex-1 px-3 py-2 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/30 text-zinc-900 bg-white"
            />
            <button
              onClick={agregar}
              className="p-2.5 bg-zinc-100 hover:bg-zinc-200 rounded-xl text-zinc-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={guardar} disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#C9A84C] hover:bg-[#B8964A] text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : ok ? <Check className="w-4 h-4" /> : null}
            {ok ? "¡Guardado!" : "Guardar cambios"}
          </button>
          <button onClick={onClose}
            className="px-5 py-2.5 border border-zinc-200 text-zinc-500 text-sm rounded-xl hover:bg-zinc-50 transition-colors">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PlanesMembresiasPanel({
  stats,
}: {
  stats: { silver: number; gold: number; black: number };
}) {
  const [planes, setPlanes]       = useState<Plan[]>(PLANES_DEFAULT);
  const [editando, setEditando]   = useState<Plan | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("monastery_planes_servicios");
    if (saved) { try { setPlanes(JSON.parse(saved)); } catch {} }
  }, []);

  function guardarServicios(id: string, servicios: string[]) {
    const updated = planes.map(p => p.id === id ? { ...p, servicios } : p);
    setPlanes(updated);
    localStorage.setItem("monastery_planes_servicios", JSON.stringify(updated));
  }

  const miembrosMap: Record<string, number> = {
    silver: stats.silver, gold: stats.gold, black: stats.black,
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-semibold text-zinc-900 text-base">Planes de membresía</h2>
      </div>

      {editando && (
        <ModalEditServicios
          plan={editando}
          onClose={() => setEditando(null)}
          onSave={(id, servicios) => { guardarServicios(id, servicios); setEditando(null); }}
        />
      )}

      {planes.map(p => {
        const miembros = miembrosMap[p.id] ?? 0;
        return (
          <div key={p.id}
            className={`rounded-xl border ${p.borderCard} ${p.bgCard} px-4 py-3.5 flex items-center justify-between gap-3 group`}>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Crown className={`w-5 h-5 ${p.iconColor} flex-shrink-0`} />
              <div className="min-w-0">
                <p className={`font-semibold text-sm ${p.iconColor}`}>{p.nombre}</p>
                <p className="text-xs text-zinc-400 truncate">
                  {p.servicios.slice(0, 2).join(" · ")}{p.servicios.length > 2 ? ` +${p.servicios.length - 2}` : ""}
                </p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  <Users className="w-3 h-3 inline-block mr-1 mb-0.5" />
                  {miembros} miembro{miembros !== 1 ? "s" : ""} activo{miembros !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <p className={`text-sm font-bold whitespace-nowrap ${p.priceColor}`}>
                {p.precio} €/mes
              </p>
              <button
                onClick={() => setEditando(p)}
                className="p-1.5 rounded-lg text-zinc-300 hover:text-[#C9A84C] hover:bg-[#C9A84C]/5 transition-all opacity-0 group-hover:opacity-100"
                title="Editar servicios incluidos"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
