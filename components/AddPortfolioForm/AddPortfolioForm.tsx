"use client";

import { useState, FormEvent, RefObject } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { createPortfolio } from "@/app/actions/portfolioActions"; // ¡Importa la Server Action!
import { useRouter } from "next/navigation";

// Definimos la interfaz para los datos que necesita la Server Action
// Esta debe coincidir con la definición en tu portfolioActions.ts
interface NewPortfolioData {
  name: string;
  tickers: string[];
}

interface AddPortfolioFormProps {
  onClose: () => void;
  onPortfolioAdded: () => void;
  formRef: RefObject<HTMLDivElement | null>;
}

const AddPortfolioForm: React.FC<AddPortfolioFormProps> = ({
  onClose,
  onPortfolioAdded,
  formRef,
}) => {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [tickers, setTickers] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const tickersArray = tickers
      .split(",")
      .map((t) => t.trim().toUpperCase())
      .filter((t) => t !== "");

    if (tickersArray.length === 0) {
      setError("Debes agregar al menos un ticker.");
      setIsSubmitting(false);
      return;
    }

    try {
      // **CORRECCIÓN AQUÍ**
      // Creamos el objeto `portfolioData` que coincide exactamente
      // con la interfaz `NewPortfolioData` esperada por la Server Action.
      const portfolioData: NewPortfolioData = {
        name: `${nombre} ${apellido}`,
        tickers: tickersArray,
      };

      // Llama a la Server Action con el objeto corregido
      const newPortfolio = await createPortfolio(portfolioData);

      onPortfolioAdded();

      // Opcional: redirige al nuevo portafolio
      router.push(`/portafolio/${newPortfolio.slug}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al crear el portafolio."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div
        ref={formRef}
        className="bg-white text-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md relative border"
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-900"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        <h2 className="text-2xl font-bold mb-4">Agregar Nuevo Portafolio</h2>
        <form onSubmit={handleSubmit}>
          {/* ... tus inputs de nombre, apellido, tickers ... */}
          <div className="mb-4">
            <label
              htmlFor="nombre"
              className="block text-sm font-medium text-gray-700"
            >
              Nombre:
            </label>
            <input
              type="text"
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900 px-3 py-2"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="apellido"
              className="block text-sm font-medium text-gray-700"
            >
              Apellido:
            </label>
            <input
              type="text"
              id="apellido"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900 px-3 py-2"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="tickers"
              className="block text-sm font-medium text-gray-700"
            >
              Tickers (separados por comas):
            </label>
            <input
              type="text"
              id="tickers"
              value={tickers}
              onChange={(e) => setTickers(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900 px-3 py-2"
              placeholder="Ej: AAPL, TSLA, GOOG"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 disabled:bg-gray-400"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creando..." : "Crear Portafolio"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPortfolioForm;
