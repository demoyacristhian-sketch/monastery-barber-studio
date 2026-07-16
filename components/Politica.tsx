export default function Politica() {
  const reglas = [
    {
      tipo: "Abono 50% (transferencia / pago online / Bizum)",
      icono: "💳",
      reglas: [
        "Es obligatorio abonar el 50% del servicio al confirmar la cita.",
        "Si el cliente no acude y no avisa con un mínimo de 4 horas de antelación, el importe no será reembolsado.",
        "El importe tampoco será válido como abono para una nueva cita en ese caso.",
      ],
    },
    {
      tipo: "Pago en metálico en barbería",
      icono: "💵",
      reglas: [
        "Se pagará el 100% del servicio directamente en la barbería.",
        "Es obligatorio confirmar la asistencia con al menos 4 horas de antelación.",
        "Sin confirmación previa, la reserva puede ser liberada para otro cliente.",
      ],
    },
  ];

  return (
    <section id="politica" className="py-16 sm:py-28 px-4 sm:px-6 bg-[#050505]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <p className="section-label mb-4">Transparencia</p>
          <h2 className="font-serif text-4xl font-bold">
            Política de <span className="gold-text">reservas y pago</span>
          </h2>
          <div className="divider-gold" />
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {reglas.map((r) => (
            <div key={r.tipo} className="card-premium p-8">
              <div className="text-3xl mb-4">{r.icono}</div>
              <h3 className="font-serif text-lg font-bold mb-1 text-white">{r.tipo}</h3>
              <div className="w-8 h-0.5 bg-[#C9A84C] mb-5" />
              <ul className="space-y-3">
                {r.reglas.map((reg, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#888]">
                    <span className="text-[#C9A84C] mt-0.5 flex-shrink-0">—</span>
                    <span>{reg}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Métodos de pago */}
        <div className="card-premium p-8">
          <h3 className="font-serif text-lg font-bold mb-6 text-center">
            Métodos de pago aceptados
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: "🏦", label: "Transferencia\nbancaria" },
              { icon: "💻", label: "Pago online" },
              { icon: "📲", label: "Bizum" },
              { icon: "💵", label: "Metálico\nen barbería" },
            ].map((m) => (
              <div
                key={m.label}
                className="border border-[#1f1f1f] p-4 text-center hover:border-[#C9A84C]/40 transition-colors"
              >
                <div className="text-2xl mb-2">{m.icon}</div>
                <p className="text-xs text-[#888] whitespace-pre-line leading-snug">{m.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-[#888] text-xs mt-8">
          Para cualquier duda sobre pagos o cancelaciones, escríbenos a{" "}
          <a href="https://instagram.com/monasterybarberia" className="text-[#C9A84C] hover:underline">
            @monasterybarberia
          </a>
        </p>
      </div>
    </section>
  );
}
