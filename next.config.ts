import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    // Esta propiedad es necesaria para permitir que el componente Image cargue archivos SVG
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ibb.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      // Aumentamos el límite de tamaño del cuerpo para permitir archivos más grandes
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
