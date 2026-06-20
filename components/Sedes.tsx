export default function Sedes() {
  const sedes = [
    {
      id: 1,
      nombre: "Sede Centro Histórico",
      direccion: "Calle de S. Quirce, 6, local 4",
      ciudad: "47003 Valladolid",
      equipo: "2 barberos",
      mapsUrl:
        "https://maps.google.com/?q=Calle+de+S.+Quirce+6+Valladolid",
    },
    {
      id: 2,
      nombre: "Sede Paseo Recoletos",
      direccion: "C. Acera de Recoletos, 14",
      ciudad: "47004 Valladolid",
      equipo: "1 barbero",
      mapsUrl:
        "https://maps.google.com/?q=Acera+de+Recoletos+14+Valladolid",
    },
  ];

  return (
    <section id="sedes" className="py-16 sm:py-28 px-4 sm:px-6 bg-[#050505]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-20">
          <p className="section-label mb-4">Encuéntranos</p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold">
            Nuestras <span className="gold-text">sedes</span>
          </h2>
          <div className="divider-gold" />
          <p className="text-[#666] text-sm mt-4">Dos ubicaciones premium en el corazón de Valladolid</p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {sedes.map((sede) => (
            <div key={sede.id} className="card-premium p-0 overflow-hidden">
              {/* Photo placeholder */}
              <div
                className="relative h-56 flex items-center justify-center overflow-hidden"
                style={{
                  background:
                    "linear-gradient(145deg, #111 0%, #0a0a0a 100%)",
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center opacity-20">
                    <div className="text-6xl mb-2">✂</div>
                    <p className="text-xs tracking-widest uppercase text-[#C9A84C]">
                      Foto próximamente
                    </p>
                  </div>
                </div>
                {/* Corner accent */}
                <div className="absolute top-0 left-0 w-16 h-1 bg-gradient-to-r from-[#C9A84C] to-transparent" />
                <div className="absolute top-0 left-0 w-1 h-16 bg-gradient-to-b from-[#C9A84C] to-transparent" />
                <div className="absolute bottom-0 right-0 w-16 h-1 bg-gradient-to-l from-[#C9A84C] to-transparent" />
                <div className="absolute bottom-0 right-0 w-1 h-16 bg-gradient-to-t from-[#C9A84C] to-transparent" />
              </div>

              {/* Info */}
              <div className="p-8">
                <p className="section-label mb-3">Sede {sede.id}</p>
                <h3 className="font-serif text-2xl font-bold mb-1">{sede.nombre}</h3>
                <div className="gold-line my-4" />

                <div className="space-y-3 mb-8">
                  <div className="flex items-start gap-3">
                    <span className="text-[#C9A84C] text-lg mt-0.5">📍</span>
                    <div>
                      <p className="text-white font-medium">{sede.direccion}</p>
                      <p className="text-[#666] text-sm">{sede.ciudad}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#C9A84C] text-lg">✂</span>
                    <p className="text-[#aaa] text-sm">{sede.equipo}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={sede.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex btn-outline text-xs flex-1 justify-center"
                  >
                    Cómo llegar →
                  </a>
                  <a
                    href="/reservas"
                    className="inline-flex btn-gold text-xs flex-1 justify-center"
                  >
                    Reservar aquí
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
