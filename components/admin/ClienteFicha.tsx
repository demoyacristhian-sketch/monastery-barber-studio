"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Star, Camera, Trash2, X, Check, Loader2,
  Phone, Mail, FileText, Calendar, TrendingUp,
  Scissors, Clock, Plus, Crown,
} from "lucide-react";
import {
  actualizarCliente,
  actualizarSellosCliente,
  canjearCorteGratis,
  toggleVipCliente,
  subirFotoCliente,
  eliminarFotoCliente,
} from "@/app/actions/admin";

type CitaCompleta = {
  id: string;
  fecha_hora: string;
  estado: string;
  precio_final: number | null;
  notas?: string | null;
  servicios?: { nombre: string; duracion_minutos: number | null } | null;
  barberos?: { nombre: string } | null;
};

type ClienteCompleto = {
  id: string;
  nombre: string;
  telefono: string | null;
  email: string | null;
  notas: string | null;
  created_at: string;
  nivel?: string | null;
  sellos?: number;
  vip?: boolean;
  citas?: CitaCompleta[];
};

type Foto = { name: string; url: string };

// ── Utilidades ────────────────────────────────────────────────────────────
function iniciales(n: string) {
  return n.split(" ").slice(0, 2).map(p => p[0] ?? "").join("").toUpperCase();
}
function euros(n: number | null) {
  if (n == null) return "—";
  return `${Math.round(n)} €`;
}
function tiempoRelativo(fecha: string | null): string {
  if (!fecha) return "Sin visitas";
  const dias = Math.floor((Date.now() - new Date(fecha).getTime()) / 86_400_000);
  if (dias === 0) return "Hoy";
  if (dias === 1) return "Ayer";
  if (dias < 7) return `Hace ${dias} días`;
  const sem = Math.floor(dias / 7);
  if (sem < 5) return `Hace ${sem} sem.`;
  const mes = Math.floor(dias / 30);
  if (mes < 12) return `Hace ${mes} mes${mes !== 1 ? "es" : ""}`;
  const ano = Math.floor(dias / 365);
  return `Hace ${ano} año${ano !== 1 ? "s" : ""}`;
}
function fechaCorta(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}

const NIVEL_CONFIG: Record<string, { label: string; bg: string; text: string; avatarRing: string }> = {
  Silver: { label: "Silver", bg: "bg-zinc-100",  text: "text-zinc-600",  avatarRing: "ring-zinc-400"  },
  Gold:   { label: "Gold",   bg: "bg-amber-50",  text: "text-amber-700", avatarRing: "ring-[#C9A84C]" },
  Black:  { label: "Black",  bg: "bg-zinc-900",  text: "text-white",     avatarRing: "ring-zinc-900"  },
};

const ESTADO_BADGE: Record<string, string> = {
  completada: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  confirmada: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  pendiente:  "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  cancelada:  "bg-zinc-100 text-zinc-500 ring-1 ring-zinc-200",
  no_show:    "bg-red-50 text-red-600 ring-1 ring-red-200",
};
const ESTADO_LABEL: Record<string, string> = {
  completada: "Completada", confirmada: "Confirmada",
  pendiente: "Pendiente", cancelada: "Cancelada", no_show: "No asistió",
};

// ── Tarjeta de sellos (10 regulares + 1 especial corte gratis) ────────────
function TarjetaSellos({
  sellos,
  size = "md",
  onClickSello,
  onCanjear,
}: {
  sellos: number;
  size?: "sm" | "md" | "lg";
  onClickSello?: (n: number) => void;
  onCanjear?: () => void;
}) {
  const sz = {
    sm: { circle: "w-6 h-6",   star: "w-3 h-3",    cut: "w-7 h-7",   cutIcon: "w-3.5 h-3.5" },
    md: { circle: "w-8 h-8",   star: "w-4 h-4",    cut: "w-9 h-9",   cutIcon: "w-4 h-4"   },
    lg: { circle: "w-12 h-12", star: "w-6 h-6",    cut: "w-[60px] h-[60px]", cutIcon: "w-7 h-7" },
  }[size];

  const canCanjear   = sellos >= 10;
  const clickable    = !!onClickSello;
  const canClickCut  = canCanjear && !!onCanjear;

  return (
    <div>
      <div className="flex gap-1.5 flex-wrap items-center">
        {/* 10 sellos regulares */}
        {Array.from({ length: 10 }).map((_, i) => {
          const filled = i < sellos;
          const nuevo  = (i + 1 === sellos) ? i : i + 1;
          return (
            <button
              key={i}
              type="button"
              disabled={!clickable}
              onClick={() => onClickSello?.(nuevo)}
              title={clickable ? (filled ? `Quitar sello ${i + 1}` : `Marcar sello ${i + 1}`) : undefined}
              className={`${sz.circle} rounded-full flex items-center justify-center transition-all duration-150 ${
                clickable ? "cursor-pointer hover:scale-110 active:scale-95" : "cursor-default"
              }`}
              style={{ background: filled ? "#18181b" : "#e4e4e7", outline: "none" }}
            >
              {filled && <Star className={`${sz.star} fill-[#C9A84C] pointer-events-none`} style={{ color: "#C9A84C" }} />}
            </button>
          );
        })}

        {/* Separador visual */}
        <div className="w-px self-stretch bg-zinc-200 mx-1 flex-shrink-0" />

        {/* Sello 11 — corte gratis (especial) */}
        <button
          type="button"
          disabled={!canClickCut}
          onClick={() => canClickCut && onCanjear?.()}
          title={canCanjear ? "Marcar corte gratis entregado → reinicia sellos" : "Completa los 10 sellos para desbloquear"}
          className={`${sz.cut} rounded-full flex items-center justify-center transition-all duration-150 flex-shrink-0 ${
            canClickCut ? "cursor-pointer hover:scale-110 active:scale-95 shadow-md shadow-amber-200/60" : "cursor-default"
          }`}
          style={{
            background: canCanjear ? "linear-gradient(135deg, #C9A84C 0%, #f0c060 100%)" : "transparent",
            border: canCanjear ? "none" : "2px dashed #d4d4d8",
            outline: "none",
          }}
        >
          <Scissors
            className={`${sz.cutIcon} pointer-events-none`}
            style={{ color: canCanjear ? "#fff" : "#a1a1aa" }}
          />
        </button>
      </div>

      <div className="mt-2.5">
        {canCanjear ? (
          <p className="text-sm font-bold" style={{ color: "#C9A84C" }}>
            🎁 ¡10 sellos! Toca las tijeras para entregar el corte gratis
          </p>
        ) : (
          <p className="text-xs text-zinc-500">
            {sellos}/10 sellos · {10 - sellos} más para un corte gratis
          </p>
        )}
      </div>
    </div>
  );
}

// ── Panel de edición inline ───────────────────────────────────────────────
function PanelEdicion({
  cliente, onClose, onSave,
}: {
  cliente: ClienteCompleto;
  onClose: () => void;
  onSave: (data: Partial<ClienteCompleto>) => void;
}) {
  const [form, setForm] = useState({
    nombre:   cliente.nombre,
    telefono: cliente.telefono ?? "",
    email:    cliente.email    ?? "",
    notas:    cliente.notas    ?? "",
    nivel:    cliente.nivel    ?? "",
    vip:      cliente.vip      ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const INPUT = "w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/20 text-zinc-900 bg-white";

  async function guardar() {
    setSaving(true);
    const [resVip, resBase] = await Promise.all([
      toggleVipCliente(cliente.id, form.vip),
      actualizarCliente(cliente.id, {
        nombre:   form.nombre,
        telefono: form.telefono || undefined,
        email:    form.email    || undefined,
        notas:    form.notas    || undefined,
        nivel:    form.nivel    || undefined,
      }),
    ]);
    setSaving(false);
    if (!resBase.ok || !resVip.ok) { setError(resBase.error ?? resVip.error ?? "Error"); return; }
    onSave({ nombre: form.nombre, telefono: form.telefono || null, email: form.email || null, notas: form.notas || null, nivel: form.nivel || null, vip: form.vip });
    onClose();
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white border-l border-zinc-200 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <h3 className="font-semibold text-zinc-900">Editar cliente</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Campos básicos */}
          {[
            { field: "nombre",   label: "Nombre completo", type: "text"  },
            { field: "telefono", label: "Teléfono",         type: "tel"   },
            { field: "email",    label: "Email",            type: "email" },
          ].map(({ field, label, type }) => (
            <div key={field}>
              <label className="block text-xs font-medium text-zinc-500 mb-1.5">{label}</label>
              <input type={type} className={INPUT}
                value={(form as Record<string, unknown>)[field] as string}
                onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} />
            </div>
          ))}

          {/* Nivel de membresía */}
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">Nivel de membresía</label>
            <div className="grid grid-cols-4 gap-2">
              {["", "Silver", "Gold", "Black"].map(n => (
                <button key={n} type="button"
                  onClick={() => setForm(p => ({ ...p, nivel: n }))}
                  className={`py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                    form.nivel === n
                      ? n === "Gold"   ? "border-[#C9A84C] bg-amber-50 text-amber-700"
                      : n === "Black"  ? "border-zinc-900 bg-zinc-900 text-white"
                      : n === "Silver" ? "border-zinc-400 bg-zinc-100 text-zinc-700"
                      :                  "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50"
                  }`}>
                  {n === "" ? "Básico" : n}
                </button>
              ))}
            </div>
          </div>

          {/* Estado VIP */}
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">Estado VIP</label>
            <div className="flex gap-2">
              <button type="button"
                onClick={() => setForm(p => ({ ...p, vip: false }))}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border-2 transition-all ${
                  !form.vip ? "border-zinc-300 bg-zinc-100 text-zinc-700" : "border-zinc-200 bg-white text-zinc-400 hover:bg-zinc-50"
                }`}>
                No VIP
              </button>
              <button type="button"
                onClick={() => setForm(p => ({ ...p, vip: true }))}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border-2 transition-all flex items-center justify-center gap-1.5 ${
                  form.vip ? "border-[#C9A84C] bg-amber-50 text-amber-700" : "border-zinc-200 bg-white text-zinc-400 hover:bg-zinc-50"
                }`}>
                <Crown className="w-3 h-3" /> VIP
              </button>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1.5">
              Se activa automáticamente al canjear el corte gratis
            </p>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">Notas internas</label>
            <textarea rows={4} className={`${INPUT} resize-none`}
              placeholder="Preferencias, alergias, observaciones..."
              value={form.notas} onChange={e => setForm(p => ({ ...p, notas: e.target.value }))} />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        <div className="px-6 py-4 border-t border-zinc-100 flex gap-3">
          <button onClick={guardar} disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 bg-zinc-900 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-zinc-700 transition-colors disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {saving ? "Guardando..." : "Guardar"}
          </button>
          <button onClick={onClose} className="px-4 border border-zinc-200 text-zinc-500 text-sm rounded-xl hover:bg-zinc-50">
            Cancelar
          </button>
        </div>
      </div>
    </>
  );
}

// ── Galería de fotos ──────────────────────────────────────────────────────
function Galeria({ clienteId, fotosIniciales }: { clienteId: string; fotosIniciales: Foto[] }) {
  const [fotos, setFotos]           = useState<Foto[]>(fotosIniciales);
  const [subiendo, setSubiendo]     = useState(false);
  const [errorFoto, setErrorFoto]   = useState("");
  const [fotoAmpliada, setFotoAmpliada] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [, startT] = useTransition();

  async function handleFiles(files: FileList) {
    setSubiendo(true); setErrorFoto("");
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("foto", file);
      const res = await subirFotoCliente(clienteId, fd);
      if (res.ok && res.url) setFotos(prev => [{ name: Date.now().toString(), url: res.url! }, ...prev]);
      else setErrorFoto(res.error ?? "Error al subir");
    }
    setSubiendo(false);
  }

  function borrar(nombre: string) {
    startT(async () => {
      const res = await eliminarFotoCliente(clienteId, nombre);
      if (res.ok) setFotos(prev => prev.filter(f => f.name !== nombre));
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-bold text-zinc-900">Galería de fotos</h2>
          <p className="text-xs text-zinc-400 mt-0.5">{fotos.length} foto{fotos.length !== 1 ? "s" : ""} · Sin límite de tamaño</p>
        </div>
        <button onClick={() => inputRef.current?.click()} disabled={subiendo}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          style={{ background: "#C9A84C" }}>
          {subiendo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
          {subiendo ? "Subiendo…" : "Añadir foto"}
        </button>
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
          onChange={e => e.target.files && handleFiles(e.target.files)} />
      </div>

      {errorFoto && <p className="text-xs text-red-500 mb-3">{errorFoto}</p>}

      {fotos.length === 0 ? (
        <div onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-zinc-200 rounded-2xl py-14 flex flex-col items-center gap-3 cursor-pointer hover:border-[#C9A84C] transition-colors group">
          <Camera className="w-10 h-10 text-zinc-300 group-hover:text-[#C9A84C] transition-colors" />
          <p className="text-sm text-zinc-400 group-hover:text-zinc-600">Toca para añadir fotos del corte</p>
          <p className="text-xs text-zinc-300">JPG, PNG, HEIC · Sin límite de tamaño</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <div onClick={() => inputRef.current?.click()}
            className="aspect-square border-2 border-dashed border-zinc-200 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#C9A84C] transition-colors group">
            <Plus className="w-6 h-6 text-zinc-300 group-hover:text-[#C9A84C]" />
            <span className="text-xs text-zinc-400 group-hover:text-zinc-600">Añadir</span>
          </div>
          {fotos.map(f => (
            <div key={f.name + f.url} className="relative aspect-square group rounded-xl overflow-hidden bg-zinc-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.url} alt="Foto corte"
                className="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105"
                onClick={() => setFotoAmpliada(f.url)} />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              <button onClick={e => { e.stopPropagation(); borrar(f.name); }}
                className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-lg text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {fotoAmpliada && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setFotoAmpliada(null)}>
          <button className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20">
            <X className="w-5 h-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fotoAmpliada} alt="Foto ampliada"
            className="max-w-full max-h-full object-contain rounded-xl"
            onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────
export default function ClienteFicha({
  cliente: clienteInicial, fotos: fotosIniciales,
}: {
  cliente: ClienteCompleto;
  fotos: Foto[];
}) {
  const [cliente,      setCliente]      = useState(clienteInicial);
  const [editando,     setEditando]     = useState(false);
  const [sellosCount,  setSellosCount]  = useState<number>(clienteInicial.sellos ?? 0);
  const [esVip,        setEsVip]        = useState<boolean>(clienteInicial.vip ?? false);
  const [savingSellos, setSavingSellos] = useState(false);
  const router = useRouter();

  const citas       = (cliente.citas ?? []) as CitaCompleta[];
  const completadas = citas.filter(c => c.estado === "completada");
  const gasto       = completadas.reduce((s, c) => s + (c.precio_final ?? 0), 0);
  const ordenadas   = [...citas].sort((a, b) => b.fecha_hora.localeCompare(a.fecha_hora));
  const ultimaCita  = ordenadas[0]?.fecha_hora ?? null;
  const primeraCita = [...citas].sort((a, b) => a.fecha_hora.localeCompare(b.fecha_hora))[0]?.fecha_hora ?? null;

  const nivelCfg    = cliente.nivel ? NIVEL_CONFIG[cliente.nivel] : null;
  const miembroDesde = new Date(cliente.created_at).toLocaleDateString("es-ES", { month: "long", year: "numeric" });

  async function handleSelloClick(nuevo: number) {
    const prev = sellosCount;
    setSellosCount(nuevo);
    setSavingSellos(true);
    const res = await actualizarSellosCliente(cliente.id, nuevo);
    setSavingSellos(false);
    if (!res.ok) setSellosCount(prev);
  }

  async function handleCanjear() {
    setSavingSellos(true);
    const res = await canjearCorteGratis(cliente.id);
    setSavingSellos(false);
    if (res.ok) {
      setSellosCount(0);
      setEsVip(true);
      setCliente(prev => ({ ...prev, vip: true }));
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50">

      {/* ── Header ── */}
      <div className="bg-white border-b border-zinc-100">
        <div className="h-1" style={{ background: "linear-gradient(90deg, #C9A84C 0%, #f0c060 60%, #e4e4e7 100%)" }} />

        <div className="px-6 pt-4 pb-4 flex items-center justify-between">
          <button onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" /> Volver
          </button>
          <button onClick={() => setEditando(true)}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-700 text-white text-sm font-semibold rounded-xl transition-colors">
            Editar perfil
          </button>
        </div>

        <div className="px-6 pb-6 flex items-center gap-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div
              className={`w-[72px] h-[72px] rounded-full flex items-center justify-center text-2xl font-bold ring-4 ${nivelCfg?.avatarRing ?? (esVip ? "ring-[#C9A84C]" : "ring-zinc-200")}`}
              style={{
                background:
                  cliente.nivel === "Gold"   ? "linear-gradient(135deg,#C9A84C,#f0c060)"
                : cliente.nivel === "Black"  ? "linear-gradient(135deg,#18181b,#3f3f46)"
                : cliente.nivel === "Silver" ? "linear-gradient(135deg,#a1a1aa,#d4d4d8)"
                : esVip                      ? "linear-gradient(135deg,#C9A84C,#f0c060)"
                : "#e4e4e7",
                color: cliente.nivel === "Silver" ? "#52525b" : (cliente.nivel || esVip) ? "#fff" : "#71717a",
              }}
            >
              {iniciales(cliente.nombre)}
            </div>
            {/* Badge nivel o VIP */}
            {nivelCfg ? (
              <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[9px] font-bold whitespace-nowrap border-2 border-white shadow-sm ${nivelCfg.bg} ${nivelCfg.text}`}>
                {nivelCfg.label}
              </div>
            ) : esVip ? (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[9px] font-bold whitespace-nowrap border-2 border-white shadow-sm bg-amber-50 text-amber-700 flex items-center gap-1">
                <Crown className="w-2.5 h-2.5" /> VIP
              </div>
            ) : null}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-zinc-900 leading-tight">{cliente.nombre}</h1>
              {esVip && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 ring-1 ring-amber-200">
                  <Crown className="w-3 h-3" /> VIP
                </span>
              )}
            </div>
            <div className="mt-1.5 space-y-1">
              {cliente.telefono && (
                <p className="flex items-center gap-2 text-sm text-zinc-600">
                  <Phone className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" /> {cliente.telefono}
                </p>
              )}
              {cliente.email && (
                <p className="flex items-center gap-2 text-sm text-zinc-500">
                  <Mail className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" /> {cliente.email}
                </p>
              )}
              <p className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                <Calendar className="w-3 h-3 flex-shrink-0" /> Miembro desde {miembroDesde}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="px-4 pt-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon={Scissors}   color="#C9A84C" label="Visitas totales" value={String(completadas.length)}           />
          <StatCard icon={TrendingUp} color="#10b981" label="Gasto total"     value={euros(gasto)}                         />
          <StatCard icon={Calendar}   color="#3b82f6" label="1ª visita"       value={primeraCita ? fechaCorta(primeraCita) : "—"} />
          <StatCard icon={Clock}      color="#8b5cf6" label="Última visita"   value={tiempoRelativo(ultimaCita)}           />
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-4 py-4 space-y-4">

        {/* Tarjeta de fidelidad */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-zinc-900">Tarjeta de fidelidad</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Toca un sello para marcarlo · Las tijeras = corte gratis</p>
            </div>
            <div className="flex items-center gap-2">
              {savingSellos && <Loader2 className="w-3.5 h-3.5 text-zinc-400 animate-spin" />}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl" style={{ background: "rgba(201,168,76,0.1)" }}>
                <Star className="w-4 h-4 fill-[#C9A84C]" style={{ color: "#C9A84C" }} />
                <span className="text-sm font-bold" style={{ color: "#C9A84C" }}>{sellosCount}/10</span>
              </div>
            </div>
          </div>
          <TarjetaSellos
            sellos={sellosCount}
            size="lg"
            onClickSello={handleSelloClick}
            onCanjear={handleCanjear}
          />
        </div>

        {/* Notas internas */}
        {cliente.notas && (
          <div className="bg-white border border-zinc-200 rounded-2xl p-6">
            <h2 className="font-bold text-zinc-900 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-zinc-400" /> Notas internas
            </h2>
            <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-wrap">{cliente.notas}</p>
          </div>
        )}

        {/* Historial de servicios */}
        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-100">
            <h2 className="font-bold text-zinc-900">Historial de servicios</h2>
            <p className="text-xs text-zinc-400 mt-0.5">{citas.length} cita{citas.length !== 1 ? "s" : ""} en total</p>
          </div>
          {ordenadas.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-zinc-400">Sin citas registradas</div>
          ) : (
            <div className="divide-y divide-zinc-50">
              {ordenadas.map(c => (
                <div key={c.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-zinc-50/50 transition-colors">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(201,168,76,0.08)" }}>
                    <Scissors className="w-4 h-4" style={{ color: "#C9A84C" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900">{c.servicios?.nombre ?? "Servicio"}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {fechaCorta(c.fecha_hora)}
                      {c.barberos?.nombre && ` · ${c.barberos.nombre}`}
                      {c.servicios?.duracion_minutos && ` · ${c.servicios.duracion_minutos} min`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {c.precio_final != null && (
                      <span className="text-sm font-semibold text-zinc-900 tabular-nums">{euros(c.precio_final)}</span>
                    )}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${ESTADO_BADGE[c.estado] ?? ESTADO_BADGE.pendiente}`}>
                      {ESTADO_LABEL[c.estado] ?? c.estado}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Galería de fotos */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6">
          <Galeria clienteId={cliente.id} fotosIniciales={fotosIniciales} />
        </div>

      </div>

      {/* Panel edición */}
      {editando && (
        <PanelEdicion
          cliente={{ ...cliente, vip: esVip }}
          onClose={() => setEditando(false)}
          onSave={data => {
            setCliente(prev => ({ ...prev, ...data }));
            if (data.vip !== undefined) setEsVip(data.vip);
          }}
        />
      )}
    </div>
  );
}

// ── StatCard ─────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, color, label, value }: {
  icon: React.ElementType; color: string; label: string; value: string;
}) {
  return (
    <div className="bg-white border border-zinc-200 rounded-2xl px-4 py-4 shadow-sm">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2.5" style={{ background: `${color}18` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <p className="text-lg font-bold text-zinc-900 leading-tight">{value}</p>
      <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
    </div>
  );
}
