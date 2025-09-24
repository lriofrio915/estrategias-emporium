import { getPortfolios } from "@/app/actions/portfolioActions";
import PortfoliosDashboardClient from "../../components/PortfoliosDashboardClient/PortfoliosDashboardClient"; // Crearemos este componente

export default async function PortfoliosDashboardPage() {
  // Obtenemos los portafolios directamente en el servidor.
  const initialPortfolios = await getPortfolios();

  return (
    // Pasamos los datos iniciales al componente cliente.
    <PortfoliosDashboardClient portfolios={initialPortfolios} />
  );
}
