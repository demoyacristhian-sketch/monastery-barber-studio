import type { NextConfig } from "next";

const securityHeaders = [
  // Evita que la web se cargue en iframes de otros dominios (clickjacking)
  { key: "X-Frame-Options", value: "DENY" },
  // Evita que el navegador interprete archivos con un tipo MIME diferente al declarado
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Controla qué información de referencia se envía al navegar fuera
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Desactiva acceso a cámara, micrófono y geolocalización desde la web
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // Fuerza HTTPS durante 1 año e incluye subdominios
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  // Activa protección XSS en navegadores legacy
  { key: "X-XSS-Protection", value: "1; mode=block" },
];

const nextConfig: NextConfig = {
  // Cabeceras de seguridad HTTP en todas las respuestas
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  // Límite para subida de fotos de clientes vía server actions
  ...(({ experimental: { serverActionsBodySizeLimit: "50mb" } }) as unknown as NextConfig),
};

export default nextConfig;
