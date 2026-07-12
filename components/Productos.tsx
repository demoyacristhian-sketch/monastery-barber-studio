"use client";

import { useState } from "react";
import Image from "next/image";

const TELEFONO_BIZUM = "642861499";

type Producto = {
  id: string;
  nombre: string;
  marca: string;
  descripcion: string;
  precio: number;
  imagen: string;
  badge?: string;
};

const PRODUCTOS: Producto[] = [
  {
    id: "beard-care-oil",
    nombre: "Beard Care Oil",
    marca: "Morfose Ossion — Premium Barber Line",
    descripcion:
      "Aceite premium para barba enriquecido con aceites herbales naturales intensos. Hidrata en profundidad, suaviza el vello y nutre la piel bajo la barba, dejando un acabado sedoso con fragancia masculina duradera.",
    precio: 12,
    imagen: "/images/shop/beard-care-oil.jpg",
    badge: "Cuidado de barba",
  },
  {
    id: "beard-serum",
    nombre: "Beard Serum",
    marca: "Morfose Ossion — Argan Oil & Almond Oil · 50 ml",
    descripcion:
      "Sérum nutritivo con aceite de argán y almendra amarga. Repara y fortalece la barba desde la raíz, aporta brillo natural y controla el encrespamiento sin apelmazar. 50 ml de fórmula de alta concentración.",
    precio: 10,
    imagen: "/images/shop/beard-serum.jpg",
    badge: "Nutrición intensa",
  },
  {
    id: "hair-styling-powder",
    nombre: "Hair Styling Powder",
    marca: "Morfose Ossion — Premium Barber Line · 20 g",
    descripcion:
      "Polvo texturizador de fijación ultra fuerte con acabado mate. Da volumen y estructura a todo tipo de cabello, especialmente el cabello fino. Se aplica en segundos y deja un look profesional sin residuos.",
    precio: 13,
    imagen: "/images/shop/hair-styling-powder.jpg",
    badge: "Fijación mate",
  },
  {
    id: "spray-voluminador",
    nombre: "Spray Voluminador Oscuro",
    marca: "Tahe Advanced Barber — Nº333 · 200 ml",
    descripcion:
      "Spray capilar mate de fijación ultra fuerte con almidón de arroz y caolín. Formulado para cabellos oscuros, prolonga el peinado con estructura y textura mate sin apelmazar. 200 ml.",
    precio: 17,
    imagen: "/images/shop/spray-voluminador.jpg",
    badge: "Volumen & definición",
  },
  {
    id: "spray-voluminador-transparente",
    nombre: "Spray Voluminador Transparente",
    marca: "Tahe Advanced Barber — Nº331 · 200 ml",
    descripcion:
      "Versión transparente del spray capilar mate de fijación ultra fuerte. Ideal para cabellos rubios o claros, aporta volumen y estructura duradera sin dejar residuo visible. Fórmula con almidón de arroz y caolín.",
    precio: 17,
    imagen: "/images/shop/spray-voluminador-transparente.jpg",
    badge: "Para cabellos claros",
  },
];

function ProductoCard({ p }: { p: Producto }) {
  const [hover, setHover] = useState(false);

  const mensajeWA = encodeURIComponent(
    `Hola, me gustaría pedir el producto "${p.nombre}" (${p.precio}€). ¿Está disponible para recoger en la barbería?`
  );
  const waLink = `https://wa.me/34${TELEFONO_BIZUM}?text=${mensajeWA}`;

  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-500"
      style={{
        background: "#0d0d0d",
        borderColor: hover ? "rgba(201,168,76,0.5)" : "rgba(255,255,255,0.07)",
        boxShadow: hover
          ? "0 0 40px rgba(201,168,76,0.12), 0 20px 60px rgba(0,0,0,0.5)"
          : "0 8px 32px rgba(0,0,0,0.4)",
        transform: hover ? "translateY(-4px)" : "translateY(0)",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Imagen */}
      <div
        className="relative flex items-center justify-center overflow-hidden"
        style={{
          height: 280,
          background: "radial-gradient(ellipse at center, #1a1a1a 0%, #0a0a0a 100%)",
        }}
      >
        <Image
          src={p.imagen}
          alt={p.nombre}
          width={240}
          height={240}
          className="object-contain transition-transform duration-700"
          style={{
            transform: hover ? "scale(1.07)" : "scale(1)",
            maxHeight: 240,
            filter: "drop-shadow(0 12px 30px rgba(0,0,0,0.6))",
          }}
          priority
        />
        {/* Gold glow on hover */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-500"
          style={{
            background:
              "radial-gradient(ellipse at center bottom, rgba(201,168,76,0.08) 0%, transparent 70%)",
            opacity: hover ? 1 : 0,
          }}
        />
      </div>

      {/* Separador dorado */}
      <div
        className="mx-6 transition-all duration-500"
        style={{
          height: 1,
          background: hover
            ? "linear-gradient(90deg, transparent, rgba(201,168,76,0.6), transparent)"
            : "linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)",
        }}
      />

      {/* Contenido */}
      <div className="flex flex-col flex-1 p-6">
        {/* Categoría */}
        {p.badge && (
          <div className="flex items-center gap-2 mb-4">
            <div
              className="h-px flex-none w-4"
              style={{ background: "rgba(201,168,76,0.5)" }}
            />
            <span
              className="text-[10px] font-bold uppercase tracking-[0.2em]"
              style={{ color: "#C9A84C" }}
            >
              {p.badge}
            </span>
          </div>
        )}

        {/* Precio */}
        <div className="flex items-baseline gap-1 mb-2">
          <span
            className="text-3xl font-bold"
            style={{ color: "#C9A84C", fontFamily: "inherit" }}
          >
            {p.precio}€
          </span>
        </div>

        {/* Nombre */}
        <h3 className="text-white font-bold text-lg leading-tight mb-1 tracking-wide">
          {p.nombre}
        </h3>

        {/* Marca */}
        <p
          className="text-xs uppercase tracking-widest mb-4"
          style={{ color: "rgba(201,168,76,0.65)" }}
        >
          {p.marca}
        </p>

        {/* Descripción */}
        <p className="text-sm leading-relaxed flex-1" style={{ color: "#888" }}>
          {p.descripcion}
        </p>

        {/* CTA */}
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 uppercase tracking-widest"
          style={{
            background: hover
              ? "linear-gradient(135deg, #C9A84C 0%, #B8964A 100%)"
              : "transparent",
            border: "1px solid rgba(201,168,76,0.4)",
            color: hover ? "#000" : "#C9A84C",
          }}
        >
          Solicitar producto →
        </a>
      </div>
    </div>
  );
}

export default function Productos() {
  return (
    <div
      className="min-h-screen"
      style={{ background: "#0a0a0a" }}
    >
      {/* ── Hero ── */}
      <section className="relative pt-28 pb-16 px-4 overflow-hidden">
        {/* Atmospheric background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(201,168,76,0.06) 0%, transparent 70%)",
          }}
        />

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Label */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div
              className="h-px flex-1 max-w-[60px]"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(201,168,76,0.5))",
              }}
            />
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.25em]"
              style={{ color: "#C9A84C" }}
            >
              Catálogo exclusivo
            </span>
            <div
              className="h-px flex-1 max-w-[60px]"
              style={{
                background:
                  "linear-gradient(270deg, transparent, rgba(201,168,76,0.5))",
              }}
            />
          </div>

          <h1
            className="font-black uppercase text-white leading-none mb-6"
            style={{ fontSize: "clamp(2.5rem, 7vw, 5rem)", letterSpacing: "-0.02em" }}
          >
            Productos
            <br />
            <span style={{ color: "#C9A84C" }}>Premium</span>
          </h1>

          <p
            className="max-w-xl mx-auto text-base leading-relaxed"
            style={{ color: "#777" }}
          >
            Los mismos productos que usamos en nuestra barbería, ahora disponibles para
            ti. Marcas seleccionadas por nuestros barberos para el cuidado y estilismo
            masculino profesional.
          </p>
        </div>
      </section>

      {/* Separador */}
      <div className="max-w-5xl mx-auto px-4">
        <div
          className="h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(201,168,76,0.2), transparent)",
          }}
        />
      </div>

      {/* ── Grid de productos ── */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        {/* Mobile/tablet: grid normal. Desktop: 3+2 centrados */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-5">
          {PRODUCTOS.map((p) => (
            <ProductoCard key={p.id} p={p} />
          ))}
        </div>
        <div className="hidden lg:grid gap-5" style={{ gridTemplateColumns: "repeat(6, 1fr)" }}>
          {PRODUCTOS.map((p, i) => (
            <div
              key={p.id}
              style={{
                gridColumn:
                  i < 3
                    ? "span 2"
                    : i === 3
                    ? "2 / span 2"
                    : "4 / span 2",
              }}
            >
              <ProductoCard p={p} />
            </div>
          ))}
        </div>
      </section>

      {/* ── Info de pago y recogida ── */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div
          className="rounded-2xl p-8 md:p-10 relative overflow-hidden"
          style={{
            background: "#0d0d0d",
            border: "1px solid rgba(201,168,76,0.2)",
          }}
        >
          {/* Glow decorativo */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 60% 80% at 0% 50%, rgba(201,168,76,0.04) 0%, transparent 70%)",
            }}
          />

          <div className="relative grid md:grid-cols-3 gap-8">
            {/* Cómo pedir */}
            <div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 text-lg"
                style={{
                  background: "rgba(201,168,76,0.1)",
                  border: "1px solid rgba(201,168,76,0.25)",
                }}
              >
                📦
              </div>
              <h3
                className="font-bold text-white mb-2 text-sm uppercase tracking-widest"
              >
                Cómo pedirlo
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#666" }}>
                Pulsa "Solicitar producto" y te contactamos por WhatsApp para
                confirmar disponibilidad y acordar la recogida.
              </p>
            </div>

            {/* Forma de pago */}
            <div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 text-lg"
                style={{
                  background: "rgba(201,168,76,0.1)",
                  border: "1px solid rgba(201,168,76,0.25)",
                }}
              >
                💳
              </div>
              <h3
                className="font-bold text-white mb-2 text-sm uppercase tracking-widest"
              >
                Pago
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#666" }}>
                Aceptamos{" "}
                <span style={{ color: "#C9A84C", fontWeight: 600 }}>Bizum</span> y{" "}
                <span style={{ color: "#C9A84C", fontWeight: 600 }}>efectivo</span>.
                El pago se realiza en el momento de la recogida en nuestras
                instalaciones.
              </p>
            </div>

            {/* Recogida */}
            <div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 text-lg"
                style={{
                  background: "rgba(201,168,76,0.1)",
                  border: "1px solid rgba(201,168,76,0.25)",
                }}
              >
                📍
              </div>
              <h3
                className="font-bold text-white mb-2 text-sm uppercase tracking-widest"
              >
                Recogida
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#666" }}>
                Los productos se recogen en cualquiera de nuestras{" "}
                <span style={{ color: "#C9A84C", fontWeight: 600 }}>
                  dos sedes de Monastery Barber Studio
                </span>{" "}
                en Valladolid.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
