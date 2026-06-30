import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Aumentar el límite para subida de fotos de clientes vía server actions
  ...(({ experimental: { serverActionsBodySizeLimit: "50mb" } }) as unknown as NextConfig),
};

export default nextConfig;
