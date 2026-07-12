import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad y Cookies | Monastery Barber Studio",
  robots: { index: false, follow: false },
};

const SECCIONES = [
  {
    titulo: "1. Responsable del tratamiento",
    contenido: `Monastery Barber Studio (en adelante, "Monastery").
Dirección: C. de San Quirce, 6, local 4 — 47003 Valladolid / Acera de Recoletos, 14 — 47004 Valladolid.
Contacto: a través del formulario de reservas o por WhatsApp en el número indicado en la web.`,
  },
  {
    titulo: "2. Datos que recopilamos",
    contenido: `Al realizar una reserva recogemos los siguientes datos personales:
· Nombre y apellidos
· Correo electrónico
· Número de teléfono móvil
· Fecha de nacimiento (para gestionar el descuento de cumpleaños)
· Notas y preferencias que el cliente indique voluntariamente`,
  },
  {
    titulo: "3. Finalidad del tratamiento",
    contenido: `Los datos se utilizan exclusivamente para:
· Gestionar tu reserva y comunicarte cualquier cambio o confirmación.
· Aplicar el descuento del 50% en tu día de cumpleaños, validado con DNI en la barbería.
· Enviarte recordatorios de tu cita.
· Mejorar la calidad del servicio y personalizar tu experiencia.

No utilizaremos tus datos para ningún fin diferente sin tu consentimiento expreso.`,
  },
  {
    titulo: "4. Base legal",
    contenido: `El tratamiento de tus datos se basa en:
· La ejecución de la relación contractual derivada de la reserva (Art. 6.1.b RGPD).
· Tu consentimiento explícito, prestado al aceptar esta política (Art. 6.1.a RGPD).
· El interés legítimo en la gestión interna del negocio (Art. 6.1.f RGPD).`,
  },
  {
    titulo: "5. Conservación de los datos",
    contenido: `Conservamos tus datos durante el tiempo que mantengas una relación con Monastery y, una vez finalizada, durante el plazo de prescripción legal aplicable (mínimo 3 años). Transcurrido ese plazo, los datos serán eliminados o anonimizados.`,
  },
  {
    titulo: "6. Comunicación a terceros",
    contenido: `No cedemos ni vendemos tus datos a terceros. Los datos se almacenan en Supabase (infraestructura en la UE), proveedor que cumple con el RGPD. Únicamente accederán a tus datos los empleados de Monastery Barber Studio que lo necesiten para prestarte el servicio.`,
  },
  {
    titulo: "7. Tus derechos",
    contenido: `Como titular de los datos tienes derecho a:
· Acceder a tus datos y obtener una copia.
· Rectificar datos inexactos o incompletos.
· Solicitar la supresión de tus datos cuando ya no sean necesarios.
· Oponerte al tratamiento o solicitar su limitación.
· Portabilidad de los datos en un formato estructurado.

Para ejercer cualquiera de estos derechos, escríbenos por WhatsApp o a través de la página de contacto. Tienes también derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (www.aepd.es).`,
  },
  {
    titulo: "8. Política de cookies",
    contenido: `Monastery Barber Studio utiliza únicamente cookies técnicas estrictamente necesarias para el funcionamiento del sitio web:

· Cookies de sesión de autenticación: generadas por Supabase para mantener tu sesión iniciada en el Espacio VIP. No requieren consentimiento al ser estrictamente necesarias para el servicio.

No utilizamos cookies de análisis, publicidad ni rastreo de terceros. Si en el futuro implantamos este tipo de cookies, actualizaremos esta política y solicitaremos tu consentimiento previo.`,
  },
  {
    titulo: "9. Cambios en esta política",
    contenido: `Monastery Barber Studio se reserva el derecho a modificar esta política para adaptarla a cambios legislativos o de servicio. Cualquier modificación relevante será comunicada en la web. La fecha de última actualización aparece al final de este documento.`,
  },
];

export default function PrivacidadPage() {
  return (
    <main className="min-h-screen bg-[#050505] pt-24 pb-20 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">

        <div className="text-center mb-14">
          <p className="section-label mb-3">Legal</p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold">
            Política de <span className="gold-text">Privacidad y Cookies</span>
          </h1>
          <div className="divider-gold" />
          <p className="text-[#444] text-xs mt-4">Última actualización: julio de 2026</p>
        </div>

        <div className="space-y-8">
          {SECCIONES.map((s) => (
            <div key={s.titulo} className="border-l border-[#C9A84C]/20 pl-6">
              <h2 className="font-serif text-lg font-bold text-white mb-3">{s.titulo}</h2>
              <p className="text-[#666] text-sm leading-relaxed whitespace-pre-line">{s.contenido}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-8 border-t border-[#111] text-center">
          <p className="text-[#333] text-xs">
            Monastery Barber Studio · Valladolid · España
          </p>
          <p className="text-[#222] text-xs mt-1">
            Para cualquier consulta sobre privacidad, contáctanos por{" "}
            <a
              href="https://wa.me/34642861499"
              className="text-[#C9A84C] hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>.
          </p>
        </div>
      </div>
    </main>
  );
}
