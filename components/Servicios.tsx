import Link from "next/link";

type Servicio = {
  nombre: string;
  descripcion: string;
  precio: string;
  duracion: string;
  destacado?: boolean;
};

const PRINCIPALES: Servicio[] = [
  {
    nombre: "Corte Estándar",
    descripcion: "Corte de cabello con técnica precisa adaptada a tu estilo y estructura facial.",
    precio: "17 €",
    duracion: "35 min",
  },
  {
    nombre: "Corte Medium",
    descripcion: "Corte de cabello + arreglo de barba + perfilado de cejas. La combinación perfecta.",
    precio: "25 €",
    duracion: "45 min",
    destacado: true,
  },
  {
    nombre: "Corte Premium",
    descripcion: "Experiencia completa: corte + barba + cejas + depilación nariz y oído + lavado de cabello.",
    precio: "35 €",
    duracion: "60 min",
    destacado: true,
  },
];

const COMPLEMENTOS: Servicio[] = [
  {
    nombre: "Solo Barba",
    descripcion: "Perfilado, recorte y definición de barba con productos premium.",
    precio: "12 €",
    duracion: "20 min",
  },
  {
    nombre: "Retoque de Corte",
    descripcion: "Refresca tu corte entre visitas. Acabado limpio y preciso.",
    precio: "12 €",
    duracion: "20 min",
  },
  {
    nombre: "Corte + Diseño",
    descripcion: "Corte con diseño personalizado y perfilado artístico.",
    precio: "20 €",
    duracion: "45 min",
  },
  {
    nombre: "Tinte Completo",
    descripcion: "Coloración completa del cabello con tintes profesionales de alta duración.",
    precio: "65 €",
    duracion: "90 min",
  },
  {
    nombre: "Mechas",
    descripcion: "Mechas y decoloración parcial para un resultado natural y con volumen.",
    precio: "50 €",
    duracion: "90 min",
  },
];

function ServiceCard({ s, large }: { s: Servicio; large?: boolean }) {
  return (
    <div className={`card-premium p-6 flex flex-col ${s.destacado ? "border-[#C9A84C]/30" : ""}`}>
      {s.destacado && (
        <span className="self-start text-[10px] tracking-widest uppercase bg-[#C9A84C] text-black px-2 py-0.5 font-bold mb-3">
          Más solicitado
        </span>
      )}
      <div className="flex items-start justify-between gap-4 mb-2">
        <h3 className={`font-serif font-bold text-white ${large ? "text-2xl" : "text-lg"}`}>
          {s.nombre}
        </h3>
        <span className="text-[#C9A84C] font-bold text-xl shrink-0">{s.precio}</span>
      </div>
      <p className="text-[#555] text-sm leading-relaxed flex-1 mb-4">{s.descripcion}</p>
      <div className="flex items-center justify-between mt-auto">
        <span className="text-[#333] text-xs tracking-wider uppercase">{s.duracion}</span>
        <Link href="/reservas" className="text-[#C9A84C] text-xs hover:text-white transition-colors">
          Reservar →
        </Link>
      </div>
    </div>
  );
}

export default function Servicios() {
  return (
    <section id="servicios" className="py-16 sm:py-28 px-4 sm:px-6 bg-black">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10 sm:mb-20">
          <p className="section-label mb-4">Lo que hacemos</p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold">
            Nuestros <span className="gold-text">servicios</span>
          </h2>
          <div className="divider-gold" />
          <p className="text-[#666] text-sm mt-4 max-w-md mx-auto">
            Cada servicio ejecutado con precisión artesanal y productos premium
          </p>
        </div>

        {/* Principales */}
        <div className="mb-4">
          <p className="section-label mb-6">Servicios principales</p>
          <div className="grid md:grid-cols-3 gap-6">
            {PRINCIPALES.map((s) => <ServiceCard key={s.nombre} s={s} large />)}
          </div>
        </div>

        {/* Separador */}
        <div className="my-14 flex items-center gap-4">
          <div className="flex-1 h-px bg-[#111]" />
          <span className="section-label">Complementos</span>
          <div className="flex-1 h-px bg-[#111]" />
        </div>

        {/* Complementos */}
        <div className="mb-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {COMPLEMENTOS.map((s) => <ServiceCard key={s.nombre} s={s} />)}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Link href="/reservas" className="inline-flex btn-gold mr-4">
            Reservar cita →
          </Link>
          <a
            href="https://wa.me/34642861499"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex btn-outline"
          >
            Consultar por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
