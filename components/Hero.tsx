import Image from "next/image";
import Link from "next/link";
import BarberPole from "@/components/BarberPole";

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative flex flex-col items-center justify-center text-center overflow-hidden pt-24 pb-10 sm:pt-28 sm:pb-10 sm:min-h-screen"
    >
      {/* ── Video urbano de barbería ── */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.45 }}
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/videos/hero-barberia.mp4" type="video/mp4" />
      </video>

      {/* Overlays atmosféricos sobre el video */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Glow ámbard central suave */}
        <div
          className="absolute"
          style={{
            top: "0%", left: "50%", transform: "translateX(-50%)",
            width: "700px", height: "500px",
            background: "radial-gradient(ellipse at 50% 30%, rgba(201,168,76,0.07) 0%, transparent 65%)",
            animation: "mirrorGlow 10s ease-in-out infinite",
          }}
        />
        {/* Acento rojo esquinas */}
        <div className="absolute bottom-0 left-0 w-64 h-48" style={{ background: "radial-gradient(ellipse at 0% 100%, rgba(140,10,10,0.1) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 right-0 w-64 h-48" style={{ background: "radial-gradient(ellipse at 100% 100%, rgba(140,10,10,0.08) 0%, transparent 70%)" }} />
      </div>

      {/* Overlay oscuro cinematográfico — abre en el centro para ver el video */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 80% 80% at 50% 40%, rgba(0,0,0,0.48) 0%, rgba(0,0,0,0.85) 100%)",
        }}
      />

      {/* Vertical accent lines */}
      <div className="hidden sm:block absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-28 bg-gradient-to-b from-transparent to-[#C9A84C]/25" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-28 bg-gradient-to-t from-transparent to-[#C9A84C]/25" />
      </div>

      {/* CONTENT */}
      <div className="relative z-10 px-5 sm:px-6 max-w-5xl mx-auto flex flex-col items-center gap-6 sm:gap-8">

        {/* Logo + barber poles al lado */}
        <div
          className="animate-fadeIn flex items-center justify-center gap-2 sm:gap-3 w-full"
          style={{ animationDelay: "0.1s" }}
        >
          <div
            className="hidden sm:block flex-shrink-0"
            style={{ filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.95))" }}
          >
            <BarberPole height={110} />
          </div>

          <Image
            src="/images/logo.svg"
            alt="Monastery Barber Studio"
            width={860}
            height={143}
            className="w-[72vw] sm:w-[55vw] md:w-[520px] lg:w-[660px] xl:w-[780px] h-auto flex-shrink-0"
            priority
          />

          <div
            className="hidden sm:block flex-shrink-0"
            style={{ filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.95))" }}
          >
            <BarberPole height={110} />
          </div>
        </div>

        {/* Tagline */}
        <p
          className="section-label text-center animate-fadeInUp"
          style={{ animationDelay: "0.3s" }}
        >
          Barbería premium · Valladolid
        </p>

        {/* Headline */}
        <h1
          className="font-serif text-[2rem] sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight animate-fadeInUp text-center"
          style={{ animationDelay: "0.5s" }}
        >
          Donde el corte se convierte
          <br />
          <span className="gold-text">en ritual.</span>
        </h1>

        {/* Sub — "Elegancia" y "confianza" */}
        <p
          className="text-[#888] text-sm sm:text-base md:text-lg max-w-sm sm:max-w-lg text-center animate-fadeInUp"
          style={{ animationDelay: "0.7s" }}
        >
          Elegancia, estilo y confianza.
          <br className="sm:hidden" /> Tu imagen merece una experiencia premium.
        </p>

        {/* CTAs */}
        <div
          className="flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-none sm:w-auto animate-fadeInUp"
          style={{ animationDelay: "0.9s" }}
        >
          <Link href="/reservas" className="inline-flex btn-gold w-full sm:w-auto justify-center">
            Reservar cita →
          </Link>
          <Link href="/servicios" className="inline-flex btn-outline w-full sm:w-auto justify-center">
            Ver servicios
          </Link>
        </div>

        {/* Scroll arrow — sin texto */}
        <div
          className="hidden sm:flex mt-6 flex-col items-center gap-1 animate-fadeIn"
          style={{ animationDelay: "1.2s", animation: "scrollArrow 2s ease-in-out infinite" }}
        >
          <div className="w-px h-8 bg-gradient-to-b from-[#C9A84C]/50 to-[#C9A84C]/10" />
          <svg
            width="18"
            height="10"
            viewBox="0 0 18 10"
            fill="none"
            stroke="#C9A84C"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="1,1 9,9 17,1" />
          </svg>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t from-black to-transparent pointer-events-none" />
    </section>
  );
}
