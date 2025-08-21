import Image from "next/image";

export const metadata = {
  title: "Manual NQ - Estrategia de Volumen",
  description:
    "Manual detallado de la estrategia de trading para futuros Micro E-mini Nasdaq 100 (NQ) basada en el análisis de volumen por Emporium Quality Funds.",
};

export default function ManualNasdaq2Page() {
  return (
    <div className="container mx-auto p-8 pt-1 max-w-4xl">
      <div className="bg-white rounded-lg shadow-xl mb-8 p-10 relative">
        <div className="min-h-[calc(100vh-120px)]">
          <div className="text-gray-600 text-xs border-b border-gray-200 pb-1">
            EQF +20 años de experiencia en conjunto, (2025)
          </div>
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center space-x-2 mt-6 mb-4">
              <span className="text-2xl font-bold text-gray-800">
                Emporium Quality Funds
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex flex-col items-start font-times-new-roman text-lg leading-tight text-gray-700">
                <span>Innovación</span>
                <span>Experiencia</span>
                <span>Gestión</span>
              </div>
              <div>
                <Image
                  src="https://i.ibb.co/20RsFG5H/emporium-logo-1.jpg"
                  alt="Logo Emporium"
                  className="w-24 h-24 rounded-full object-cover border-2 border-blue-600 shadow-md"
                  width={100}
                  height={100}
                />
              </div>
              <div className="flex flex-col items-end">
                <span className="font-bold">INVERSIÓN</span>
                <span className="text-sm font-bold">EN</span>
                <span className="font-bold">MERCADOS FINANCIEROS</span>
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
            Estrategia de Trading Intradía para Futuros Micro E-mini Nasdaq 100:
          </h1>
          <h2 className="text-2xl font-semibold text-center text-gray-700 mb-8">
            Un Enfoque de Volumen y Estructura
          </h2>
          <div className="text-center">
            <p className="text-lg font-semibold">L. Riofrio</p>
            <p className="text-gray-700">
              Emporium Quality Funds, Quito, Ecuador
            </p>
            <p className="text-sm italic mt-1">luis.riofrio@emporium.site</p>
            <p className="text-xs mt-3">
              (Recibido: 09 Julio 2025; Aceptado: 11 Julio 2025)
            </p>
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-4 pb-2 border-b-2 border-gray-200">
            Resumen Ejecutivo
          </h3>
          <p className="mb-4 text-justify">
            El presente informe detalla una investigación exhaustiva sobre una
            estrategia de trading intradía para futuros Micro E-mini Nasdaq 100
            (MNQ) en la plataforma NinjaTrader 8. La estrategia combina el
            análisis del contexto macroeconómico fundamental con patrones
            técnicos basados en el comportamiento del volumen para identificar
            puntos de reversión o continuación de alta probabilidad.
          </p>
          <p className="mb-4 text-justify">
            El objetivo principal es validar la rentabilidad y replicabilidad de
            esta metodología para su potencial aplicación en un fondo de
            inversión, enfocándose en la disciplina y la gestión del riesgo.
          </p>
        </div>
        <div className="flex justify-between pt-4 mt-6 border-t border-gray-200 text-sm text-gray-600">
          <span>Emporium Quality Funds</span>
          <span>Página 1</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-xl mb-8 p-10 relative">
        <div className="min-h-[calc(100vh-120px)]">
          <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-4 pb-2 border-b-2 border-gray-200">
            1. Introducción
          </h3>
          <p className="mb-4 text-justify">
            El trading en mercados de futuros requiere una estrategia que no
            solo identifique la dirección probable del mercado, sino que también
            ofrezca un timing de entrada preciso. Esta metodología innovadora
            integra el análisis macroeconómico con un patrón técnico específico
            basado en la lectura del volumen, con el fin de capitalizar los
            puntos de inflexión intradía del mercado.
          </p>
          <p className="mb-4 text-justify">
            A diferencia de estrategias puramente basadas en precio, este
            enfoque busca entender la &quot;fuerza&quot; detrás de cada movimiento a
            través del volumen. La lectura del volumen ofrece una ventana a la
            participación de los grandes operadores, lo que proporciona una
            ventaja significativa.
          </p>

          <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-4 pb-2 border-b-2 border-gray-200">
            2. Marco Teórico
          </h3>
          <h4 className="text-xl font-semibold text-gray-800 mt-5 mb-3">
            2.1. Análisis Macroeconómico Fundamental para el Nasdaq
          </h4>
          <p className="mb-4 text-justify">
            La primera etapa de la estrategia se basa en la premisa de que el
            movimiento de los índices bursátiles, como el Nasdaq 100, está
            intrínsecamente ligado a las condiciones macroeconómicas. El Nasdaq,
            al ser un índice predominantemente tecnológico, es particularmente
            sensible a los siguientes factores:
          </p>
          <ul className="list-disc ml-6 mb-4">
            <li className="mb-2">
              <strong className="font-semibold">Tasas de Interés:</strong> Las
              tasas altas pueden impactar negativamente a las empresas
              tecnológicas al encarecer el endeudamiento y reducir el valor
              presente de sus flujos de caja futuros.
            </li>
            <li className="mb-2">
              <strong className="font-semibold">Inflación:</strong> Una
              inflación elevada puede erosionar los márgenes de beneficio de las
              empresas y reducir el poder adquisitivo de los consumidores.
            </li>
            <li className="mb-2">
              <strong className="font-semibold">Crecimiento del PIB:</strong>
              Un crecimiento económico robusto suele traducirse en mayores
              ingresos y beneficios para las empresas.
            </li>
            <li className="mb-2">
              <strong className="font-semibold">Datos de Empleo:</strong>
              Indicadores como las nóminas no agrícolas o la tasa de desempleo
              reflejan la salud general de la economía y el consumo.
            </li>
            <li className="mb-2">
              <strong className="font-semibold">
                Políticas de Bancos Centrales:
              </strong>
              Las decisiones de la Reserva Federal (Fed) sobre política
              monetaria tienen un impacto directo en la liquidez del mercado y
              el apetito por el riesgo.
            </li>
            <li className="mb-2">
              <strong className="font-semibold">
                Resultados Corporativos:
              </strong>
              Los informes de ganancias de las principales empresas tecnológicas
              (las &quot;7 Magníficas&quot; y otras) influyen directamente en el
              sentimiento del sector.
            </li>
          </ul>
          <Image
            src="https://i.ibb.co/xSv60TXG/var.jpg"
            alt="Variables macroeconómicas"
            className="max-w-full h-auto mx-auto my-4 block rounded-md shadow-md"
            width={500}
            height={200}
          />
          <h3 className="text-xs text-center">
            Gráfico 1. Variables Fundamentales para la Determinación del Sesgo
            General del Mercado
          </h3>
        </div>
        <div className="flex justify-between pt-4 mt-6 border-t border-gray-200 text-sm text-gray-600">
          <span>Emporium Quality Funds</span>
          <span>Página 2</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-xl mb-8 p-10 relative">
        <div className="min-h-[calc(100vh-120px)]">
          <h4 className="text-xl font-semibold text-gray-800 mt-5 mb-3">
            2.2. Análisis de Volumen y su Patrón de Entrada
          </h4>
          <p className="mb-4 text-justify">
            Una vez establecida la dirección macroeconómica, la estrategia se
            apoya en la lectura del volumen para identificar puntos de entrada
            de alta probabilidad. El patrón se basa en los siguientes
            principios:
          </p>
          <ul className="list-disc ml-6 mb-4">
            <li className="mb-2">
              <strong className="font-semibold">
                Continuo Decrecimiento del Volumen:
              </strong>
              El precio debe estar en una tendencia, ya sea alcista o bajista,
              mientras que el volumen de las velas va disminuyendo
              progresivamente.
            </li>
            <li className="mb-2">
              <strong className="font-semibold">
                Incremento de Volumen Aislado:
              </strong>
              Aparece una vela con un volumen significativamente más alto que
              los volúmenes decrecientes anteriores.
            </li>
            <li className="mb-2">
              <strong className="font-semibold">Vela de Giro Fuerte:</strong>
              Esta vela de alto volumen debe ser una vela de giro con un cuerpo
              grande y un cierre cerca de su máximo o mínimo, indicando la
              entrada de una fuerza significativa del lado contrario a la
              tendencia previa.
            </li>
            <li className="mb-2">
              <strong className="font-semibold">
                Ausencia de Volumen y Pullback:
              </strong>
              Inmediatamente después de la vela de giro, se debe observar una o
              varias velas de bajo volumen (típicamente una vela Doji) que
              forman un &quot;pullback&quot; hacia la zona de la vela de giro.
            </li>
          </ul>
          <Image
            src="https://i.ibb.co/VcGj9ntq/mnq.png"
            alt="Soporte y resistencia"
            className="max-w-full h-auto mx-auto my-4 block rounded-md shadow-md"
            width={700}
            height={400}
          />
          <h3 className="text-xs text-center mb-4">
            Gráfico 2. Componentes Técnicos de la Estrategia
          </h3>
          <p className="mb-4 text-justify">
            Este patrón indica un cambio en el sentimiento del mercado: la
            tendencia anterior pierde fuerza (volumen decreciente), una fuerza
            contraria entra con convicción (volumen aislado), y el mercado
            realiza una pausa o &quot;respiro&quot; (pullback con bajo volumen) antes de
            continuar en la nueva dirección.
          </p>
          <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-4 pb-2 border-b-2 border-gray-200">
            3. Metodología de la Estrategia
          </h3>
          <p className="mb-4 text-justify">
            La implementación de esta estrategia integrada se divide en dos
            etapas secuenciales y complementarias:
          </p>
          <h4 className="text-xl font-semibold text-gray-800 mt-5 mb-3">
            3.1. Etapa 1: Determinación de la Dirección Macroeconómica Diaria
          </h4>
          <p className="mb-4 text-justify">
            Esta etapa se realiza antes de la apertura del mercado o en los
            primeros minutos de la sesión, y es crucial para establecer el sesgo
            operativo del día. El proceso es el mismo que en el manual anterior,
            asegurando la alineación con la visión general del mercado.
          </p>
          <Image
            src="https://i.ibb.co/DH5tMZBV/matriz-macroeconomica-fundamenta.jpg"
            alt="Matriz macroeconómica"
            className="max-w-full h-auto mx-auto my-4 block rounded-md shadow-md"
            width={700}
            height={400}
          />
          <h3 className="text-xs text-center mb-4">
            Gráfico 3. Cuantificación de los Componentes Fundamentales
          </h3>
        </div>
        <div className="flex justify-between pt-4 mt-6 border-t border-gray-200 text-sm text-gray-600">
          <span>Emporium Quality Funds </span>
          <span>Página 3</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-xl mb-8 p-10 relative">
        <div className="min-h-[calc(100vh-120px)]">
          <h4 className="text-xl font-semibold text-gray-800 mt-5 mb-3">
            3.2. Etapa 2: Aplicación del Patrón de Volumen para la Entrada
          </h4>
          <p className="mb-4 text-justify">
            Una vez determinado el sesgo macroeconómico, se busca el patrón de
            entrada en la gráfica de 1 minuto del MNQ:
          </p>
          <ol className="list-decimal ml-6 mb-4">
            <li className="mb-2">
              <strong className="font-semibold">
                Análisis de la Tendencia y Volumen:
              </strong>
              Observar que el precio se mueva en una dirección, con un volumen
              que se va reduciendo progresivamente.
            </li>
            <li className="mb-2">
              <strong className="font-semibold">
                Identificación de la Vela de Giro:
              </strong>
              Esperar la aparición de una vela con un volumen significativamente
              mayor, que además sea una vela fuerte de giro con cierre en sus
              máximos (para un sesgo de compra) o en sus mínimos (para un sesgo
              de venta).
            </li>
            <li className="mb-2">
              <strong className="font-semibold">Espera del Pullback:</strong>
              Esperar a que aparezca una vela de bajo volumen (Doji) justo
              después de la vela de giro, indicando la pausa antes de la
              continuación.
            </li>
            <li className="mb-2">
              <strong className="font-semibold">Timing de Entrada:</strong>
              La entrada se realiza al superar el máximo de la vela de giro
              (para compras) o al romper el mínimo de la vela de giro (para
              ventas).
            </li>
          </ol>
          <p className="text-center font-semibold text-xl my-6 text-gray-900">
            Entrada de Compra
          </p>
          <Image
            src="https://i.ibb.co/fzPvTr64/buy.jpg"
            alt="Entrada de compra"
            className="max-w-full h-auto mx-auto my-6 block rounded-md shadow-md"
            width={700}
            height={400}
          />
          <p className="text-center font-semibold text-xl my-6 text-gray-900">
            Entrada de Venta
          </p>
          <Image
            src="https://i.ibb.co/3mTHVhCc/sell.jpg"
            alt="Entrada de venta"
            className="max-w-full h-auto mx-auto my-6 block rounded-md shadow-md"
            width={700}
            height={400}
          />
          <h4 className="text-xl font-semibold text-gray-800 mt-5 mb-3">
            3.3. Gestión de Riesgos y Salida
          </h4>
          <ul className="list-disc ml-6 mb-4">
            <li className="mb-2">
              <strong className="font-semibold">Stop-Loss:</strong> Se coloca
              detrás del mínimo de la vela de giro (para compras) o detrás del
              máximo de la vela de giro (para ventas).
            </li>
            <li className="mb-2">
              <strong className="font-semibold">Breakeven:</strong> Una vez que
              la operación alcanza una relación de 1:1, el stop-loss se mueve al
              precio de entrada para proteger el capital.
            </li>
            <li className="mb-2">
              <strong className="font-semibold">Take Profit:</strong> El
              objetivo de ganancia se establece en un múltiplo 1:3 del riesgo
              inicial.
            </li>
          </ul>
        </div>
        <div className="flex justify-between pt-4 mt-6 border-t border-gray-200 text-sm text-gray-600">
          <span>Emporium Quality Funds</span>
          <span>Página 4</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-xl mb-8 p-10 relative">
        <div className="min-h-[calc(100vh-120px)]">
          <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-4 pb-2 border-b-2 border-gray-200">
            4. Análisis Empírico y Resultados
          </h3>
          <p className="mb-4 text-justify">
            La validación de esta estrategia se realizará a través de un
            riguroso backtesting sobre datos históricos del MNQ, complementado
            con pruebas en tiempo real. Las operaciones más exitosas se esperan
            en días con una dirección macroeconómica clara y con patrones de
            volumen bien definidos.
          </p>
          <p className="mb-4 text-justify">
            Para evaluar la estrategia, se utilizarán métricas clave de
            rendimiento y riesgo, esenciales para cualquier fondo de inversión:
          </p>
          <ul className="list-disc ml-6 mb-4">
            <li className="mb-2">
              <strong className="font-semibold">
                Beneficio Neto Total / Retorno Anualizado:
              </strong>
              Mide la rentabilidad global de la estrategia.
            </li>
            <li className="mb-2">
              <strong className="font-semibold">Sharpe Ratio:</strong> Es una
              métrica de retorno ajustado al riesgo.
            </li>
            <li className="mb-2">
              <strong className="font-semibold">Drawdown Máximo:</strong>
              Representa la mayor caída de la equidad de la cuenta.
            </li>
            <li className="mb-2">
              <strong className="font-semibold">
                Tasa de Acierto (Win Rate):
              </strong>
              El porcentaje de operaciones ganadoras.
            </li>
            <li className="mb-2">
              <strong className="font-semibold">
                Ratio Riesgo/Recompensa:
              </strong>
              Compara la recompensa promedio esperada con el riesgo promedio.
            </li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-4 pb-2 border-b-2 border-gray-200">
            5. Conclusiones y Recomendaciones
          </h3>
          <p className="mb-4 text-justify">
            La estrategia de trading intradía para futuros Micro E-mini Nasdaq
            100, basada en el análisis de volumen, ofrece un marco prometedor
            para la toma de decisiones en mercados volátiles. Su principal
            ventaja radica en la confirmación de la entrada mediante la fuerza
            de los grandes operadores, minimizando las señales falsas.
          </p>
          <ul className="list-disc ml-6 mb-4">
            <li className="mb-2">
              <strong className="font-semibold">
                Disciplina en la Ejecución:
              </strong>
              La estricta adhesión a los parámetros de entrada y salida es
              fundamental para la consistencia.
            </li>
            <li className="mb-2">
              <strong className="font-semibold">
                Optimización del Breakeven:
              </strong>
              Explorar puntos óptimos para mover el stop a breakeven más allá de
              la relación 1:1, en función de la estructura del mercado.
            </li>
            <li className="mb-2">
              <strong className="font-semibold">
                Adaptación a Diferentes Mercados:
              </strong>
              Investigar la aplicabilidad de esta estrategia en otros mercados
              de futuros de alta liquidez.
            </li>
          </ul>
        </div>
        <div className="flex justify-between pt-4 mt-6 border-t border-gray-200 text-sm text-gray-600">
          <span>Emporium Quality Funds</span>
          <span>Página 5</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-xl mb-8 p-10 relative">
        <div className="min-h-[calc(100vh-120px)]">
          <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-4 pb-2 border-b-2 border-gray-200">
            Apéndice 1. Métricas Clave del Backtesting
          </h3>
          <table className="w-full border-collapse my-6 text-base">
            <caption className="text-center font-bold text-lg mb-4 text-gray-900">
              Tabla 1. Métricas Clave de Estudio
            </caption>
            <thead>
              <tr>
                <th className="bg-gray-100 font-semibold text-left p-4 border border-gray-200">
                  Métrica
                </th>
                <th className="bg-gray-100 font-semibold text-left p-4 border border-gray-200">
                  Valor
                </th>
                <th className="bg-gray-100 font-semibold text-left p-4 border border-gray-200">
                  Unidad
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="even:bg-gray-50">
                <td className="p-4 border border-gray-200">
                  Beneficio Neto Total
                </td>
                <td className="p-4 border border-gray-200 font-semibold text-blue-700">
                  -
                </td>
                <td className="p-4 border border-gray-200">-</td>
              </tr>
              <tr className="even:bg-gray-50">
                <td className="p-4 border border-gray-200">
                  Retorno Anualizado
                </td>
                <td className="p-4 border border-gray-200 font-semibold text-blue-700">
                  -
                </td>
                <td className="p-4 border border-gray-200">-</td>
              </tr>
              <tr className="even:bg-gray-50">
                <td className="p-4 border border-gray-200">Sharpe Ratio</td>
                <td className="p-4 border border-gray-200 font-semibold text-blue-700">
                  -
                </td>
                <td className="p-4 border border-gray-200">-</td>
              </tr>
              <tr className="even:bg-gray-50">
                <td className="p-4 border border-gray-200">Drawdown Máximo</td>
                <td className="p-4 border border-gray-200 font-semibold text-blue-700">
                  -
                </td>
                <td className="p-4 border border-gray-200">%</td>
              </tr>
              <tr className="even:bg-gray-50">
                <td className="p-4 border border-gray-200">Tasa de Acierto</td>
                <td className="p-4 border border-gray-200 font-semibold text-blue-700">
                  -
                </td>
                <td className="p-4 border border-gray-200">%</td>
              </tr>
              <tr className="even:bg-gray-50">
                <td className="p-4 border border-gray-200">
                  Ganancia Promedio
                </td>
                <td className="p-4 border border-gray-200 font-semibold text-blue-700">
                  -
                </td>
                <td className="p-4 border border-gray-200">-</td>
              </tr>
              <tr className="even:bg-gray-50">
                <td className="p-4 border border-gray-200">
                  Ratio Riesgo/Recompensa
                </td>
                <td className="p-4 border border-gray-200 font-semibold text-blue-700">
                  -
                </td>
                <td className="p-4 border border-gray-200">-</td>
              </tr>
              <tr className="even:bg-gray-50">
                <td className="p-4 border border-gray-200">
                  Número Total de Operaciones
                </td>
                <td className="p-4 border border-gray-200 font-semibold text-blue-700">
                  -
                </td>
                <td className="p-4 border border-gray-200">-</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="flex justify-between pt-4 mt-6 border-t border-gray-200 text-sm text-gray-600">
          <span>Emporium Quality Funds</span>
          <span>Página 6</span>
        </div>
      </div>
    </div>
  );
}
