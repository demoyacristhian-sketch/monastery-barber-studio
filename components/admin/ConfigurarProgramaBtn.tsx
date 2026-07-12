"use client";

import { useState, useEffect } from "react";
import { Settings, X, Check, Loader2 } from "lucide-react";

type Config = {
  sellos: number;
  premio: string;
  caducidad: string;
  mensaje: string;
};

const DEFAULT: Config = {
  sellos: 10,
  premio: "1 corte gratis",
  caducidad: "Sin caducidad",
  mensaje: "¡Felicidades! Has acumulado 10 sellos. Canjea tu corte gratis en tu próxima visita.",
};

export default function ConfigurarProgramaBtn() {
  const [open, setOpen]     = useState(false);
  const [config, setConfig] = useState<Config>(DEFAULT);
  const [saving, setSaving] = useState(false);
  const [ok, setOk]         = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("monastery_fidelizacion_config");
    if (saved) { try { setConfig(JSON.parse(saved)); } catch {} }
  }, []);

  async function guardar() {
    setSaving(true);
    localStorage.setItem("monastery_fidelizacion_config", JSON.stringify(config));
    await new Promise(r => setTimeout(r, 400));
    setSaving(false);
    setOk(true);
    setTimeout(() => { setOk(false); setOpen(false); }, 1200);
  }

  const INPUT = "w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C] text-zinc-900 bg-white";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#C9A84C] hover:bg-[#B8964A] transition-colors flex-shrink-0"
      >
        <Settings className="w-4 h-4" /> Configurar programa
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
              <h3 className="font-semibold text-zinc-900">Configurar programa de fidelización</h3>
              <button onClick={() => setOpen(false)} className="text-zinc-400 hover:text-zinc-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Sellos necesarios para canjear</label>
                <input
                  type="number" min="1" max="50"
                  value={config.sellos}
                  onChange={e => setConfig(p => ({ ...p, sellos: parseInt(e.target.value) || 10 }))}
                  className={INPUT}
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Premio al completar tarjeta</label>
                <input
                  value={config.premio}
                  onChange={e => setConfig(p => ({ ...p, premio: e.target.value }))}
                  className={INPUT}
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Caducidad de la tarjeta</label>
                <select
                  value={config.caducidad}
                  onChange={e => setConfig(p => ({ ...p, caducidad: e.target.value }))}
                  className={INPUT}
                >
                  <option>Sin caducidad</option>
                  <option>6 meses</option>
                  <option>1 año</option>
                  <option>2 años</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Mensaje al canjear el premio</label>
                <textarea
                  rows={3}
                  value={config.mensaje}
                  onChange={e => setConfig(p => ({ ...p, mensaje: e.target.value }))}
                  className={`${INPUT} resize-none`}
                />
              </div>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={guardar} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#C9A84C] hover:bg-[#B8964A] text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : ok ? <Check className="w-4 h-4" /> : null}
                {ok ? "¡Guardado!" : "Guardar configuración"}
              </button>
              <button onClick={() => setOpen(false)}
                className="px-5 py-2.5 border border-zinc-200 text-zinc-500 text-sm rounded-xl hover:bg-zinc-50 transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
