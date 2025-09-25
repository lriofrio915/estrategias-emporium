import Image from "next/image";

export const metadata = {
  title: "Manual NQ - Pulso Bursátil",
  description: "Manual detallado de la estrategia de trading para futuros Micro E-mini Nasdaq 100 (NQ), un Enfoque Integrado Macro-Técnico por Emporium Quality Funds.",
};

export default function ManualNasdaqPage() {
  return (
    <div className="container mx-auto p-8 pt-1 max-w-4xl">
      <div className="bg-white rounded-lg shadow-xl mb-8 p-10 relative">
        <div className="min-h-[calc(100vh-120px)]"> {/* Ajusta min-h si es necesario para el espaciado */}
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
            Estrategia de Trading Intradía para Futuros Micro E-mini Nasdaq
            100:
          </h1>
          <h2 className="text-2xl font-semibold text-center text-gray-700 mb-8">
            Un Enfoque Integrado Macro-Técnico
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
            estrategia de trading intradía aplicada a los futuros Micro E-mini
            Nasdaq 100 (MNQ) en la plataforma NinjaTrader 8. La estrategia se
            fundamenta en un enfoque de dos etapas: primero, un análisis del
            contexto macroeconómico fundamental para determinar una dirección
            clara del sesgo de operación (compra o venta) para el día; y
            segundo, la aplicación de patrones técnicos de ruptura de soporte
            y resistencia, identificados mediante el indicador ZigZag, para el
            timing preciso de entrada al mercado.
          </p>
          <p className="mb-4 text-justify">
            El objetivo principal de esta investigación es validar la
            rentabilidad, replicabilidad y enseñabilidad de esta metodología
            para su potencial implementación en un fondo de inversión.
          </p>
          <p className="mb-4 text-justify">
            La gestión de riesgos, anclada en la regla del 2% y stops de
            pérdida fijos, es fundamental para la preservación del capital. Se
            identifican áreas clave para la optimización y la investigación
            futura, incluyendo la cuantificación de los factores de
            sentimiento macroeconómico y la adaptación dinámica de los
            parámetros de riesgo a las condiciones del mercado.
          </p>
          <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-4 pb-2 border-b-2 border-gray-200">
            1. Introducción
          </h3>
          <p className="mb-4 text-justify">
            El trading intradía en mercados de futuros, como el Micro E-mini
            Nasdaq 100 (MNQ), ofrece oportunidades significativas de
            capitalización debido a su alta liquidez y volatilidad. Sin
            embargo, el éxito sostenido en este entorno requiere una
            estrategia robusta y bien definida.
          </p>
          <p className="mb-4 text-justify">
            Este estudio presenta una metodología de trading innovadora que
            integra el análisis macroeconómico fundamental con patrones
            técnicos de entrada, buscando optimizar la toma de decisiones y
            mejorar la consistencia de los resultados.
          </p>
          <p className="mb-4 text-justify">
            A diferencia de enfoques puramente técnicos, esta estrategia
            propone una visión holística del mercado. La primera etapa
            consiste en una evaluación profunda del contexto macroeconómico
            global y, específicamente, de los factores que influyen en el
            índice Nasdaq.
          </p>
        </div>
        <div className="flex justify-between pt-4 mt-6 border-t border-gray-200 text-sm text-gray-600">
          <span>Emporium Quality Funds</span>
          <span>Página 1</span>
        </div>
      </div>
      
      {/* Contenido de la "Página 2" del manual */}
      <div className="bg-white rounded-lg shadow-xl mb-8 p-10 relative">
        <div className="min-h-[calc(100vh-120px)]">
          <p className="mb-4 text-justify">
            Esta evaluación permite establecer una dirección operativa
            predominante para el día (alcista o bajista), alineando las
            operaciones con el flujo general del mercado. Una vez definida
            esta dirección, la segunda etapa se centra en la identificación de
            patrones técnicos específicos en el gráfico de precios para
            determinar el momento óptimo de entrada.
          </p>
          <p className="mb-4 text-justify">
            El objetivo de esta investigación es validar la efectividad de
            esta estrategia integrada en términos de rentabilidad, su
            capacidad de ser replicada por otros operadores y la facilidad con
            la que puede ser enseñada.
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
            intrínsecamente ligado a las condiciones macroeconómicas. El
            Nasdaq, al ser un índice predominantemente tecnológico, es
            particularmente sensible a:
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
              inflación elevada puede erosionar los márgenes de beneficio de
              las empresas y reducir el poder adquisitivo de los consumidores.
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
              Los informes de ganancias de las principales empresas
              tecnológicas (las &quot;7 Magníficas&quot; y otras) influyen
              directamente en el sentimiento del sector.
            </li>
          </ul>
          <Image
            src="https://i.ibb.co/xSv60TXG/var.jpg"
            alt="Variables macroeconómicas"
            className="max-w-full h-auto mx-auto my-4 block rounded-md shadow-md"
            width={500}
            height={200}
          />
          <h3 className="text-xs text-center">Gráfico 1. Variables Fundamentales para la Determinación del Sesgo General del Mercado</h3>
          <h4 className="text-xl font-semibold text-gray-800 mt-5 mb-3">
            2.2. Análisis Técnico de Rupturas (Breakouts)
          </h4>
          <p className="mb-4 text-justify">
            Una vez establecida la dirección macroeconómica, la estrategia se
            apoya en el análisis técnico para identificar puntos de entrada
            precisos. El concepto central es el de las rupturas de soporte y
            resistencia:
          </p>

          <ul className="list-disc ml-6 mb-4">
            <li className="mb-2">
              <strong className="font-semibold">
                Soporte y Resistencia:
              </strong>
              Niveles de precios donde la presión de compra (soporte) o venta
              (resistencia) ha sido históricamente fuerte, impidiendo que el
              precio se mueva más allá.
            </li>
            <li className="mb-2">
              <strong className="font-semibold">Indicador ZigZag:</strong>
              Herramienta que filtra el &quot;ruido&quot; del precio,
              conectando picos y valles significativos.
            </li>
            <li className="mb-2">
              <strong className="font-semibold">Ruptura (Breakout):</strong>
              Ocurre cuando el precio de un activo se mueve por encima de un
              nivel de resistencia o por debajo de un nivel de soporte.
            </li>
          </ul>
          <Image
            src="https://i.ibb.co/W4Dvky7t/soporte-resistencia.jpg"
            alt="Soporte y resistencia"
            className="max-w-full h-auto mx-auto my-4 block rounded-md shadow-md"
            width={700}
            height={400}
          />
          <h3 className="text-xs text-center mb-4">Gráfico 2. Componentes Técnicos de la Estrategia</h3>
          <p className="mb-4 text-justify">
            Las rupturas son consideradas señales potentes de continuación o
            reversión de tendencia, proporcionando puntos de entrada de alta
            probabilidad cuando se alinean con la dirección macroeconómica
            previamente determinada.
          </p>
        </div>
        <div className="flex justify-between pt-4 mt-6 border-t border-gray-200 text-sm text-gray-600">
          <span>Emporium Quality Funds</span>
          <span>Página 2</span>
        </div>
      </div>
      
      {/* Contenido de la "Página 3" del manual */}
      <div className="bg-white rounded-lg shadow-xl mb-8 p-10 relative">
        <div className="min-h-[calc(100vh-120px)]">
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
            primeros minutos de la sesión, y es crucial para establecer el
            sesgo operativo del día. El proceso incluye:
          </p>
          <ol className="list-decimal ml-6 mb-4">
            <li className="mb-2">
              <strong className="font-semibold">
                Recopilación de Datos:
              </strong>
              Revisión de los últimos informes económicos (IPC, PPI, empleo,
              ventas minoristas, etc.), declaraciones de la Fed, y resultados
              de ganancias de empresas clave.
            </li>
            <li className="mb-2">
              <strong className="font-semibold">
                Análisis de Sentimiento General:
              </strong>
              Evaluación de las noticias de última hora, el sentimiento de los
              inversores (índices de miedo/codicia), y el comportamiento de
              otros mercados correlacionados (bonos, divisas).
            </li>
            <li className="mb-2">
              <strong className="font-semibold">
                Identificación de Catalizadores:
              </strong>
              Determinar si hay eventos significativos programados para el día
              (anuncios económicos, discursos de la Fed) que puedan generar
              volatilidad y una dirección clara.
            </li>
            <li className="mb-2">
              <strong className="font-semibold">
                Formulación del Sesgo:
              </strong>
              Con base en el análisis, se establece una clara dirección:
              <ul className="list-disc ml-6 mt-2">
                <li className="mb-1">
                  <strong className="font-semibold">
                    Sesgo de Compra (Alcista):
                  </strong>
                  Si los factores macroeconómicos sugieren un entorno
                  favorable para el crecimiento y la inversión en tecnología.
                </li>
                <li className="mb-1">
                  <strong className="font-semibold">
                    Sesgo de Venta (Bajista):
                  </strong>
                  Si los factores macroeconómicos apuntan a un deterioro de
                  las condiciones económicas o un riesgo elevado.
                </li>
              </ul>
            </li>
          </ol>
          <Image
            src="https://i.ibb.co/DH5tMZBV/matriz-macroeconomica-fundamenta.jpg"
            alt="Matriz macroeconómica"
            className="max-w-full h-auto mx-auto my-4 block rounded-md shadow-md"
            width={700}
            height={400}
          />
          <h3 className="text-xs text-center mb-4">Gráfico 3. Cuantificación de los Componentes Fundamentales</h3>
          <p className="mb-4 text-justify">
            Si el valor actual del dato supera las previsiones y aporta al
            desarrollo de la economía se le asigna una puntuación de +1, caso
            contrario si el dato decepciona y es malo para la economía le
            asignamos un valor de -1. Si la sumatoria final está entre +4 y
            +12 es una tendencia alcista, si se encuentra entre -12 y -4 el
            sesgo es bajista, sin embargo si se encuentra entre -3 y +3 es una
            tendencia lateral con indecisiones en donde es mejor no operar.
          </p>
          <h4 className="text-xl font-semibold text-gray-800 mt-5 mb-3">
            3.2. Etapa 2: Aplicación del Patrón Técnico para el Timing de
            Entrada
          </h4>
          <p className="mb-4 text-justify">
            Una vez que la dirección macroeconómica ha sido determinada, el
            operador se enfoca en el gráfico del MNQ para identificar el
            patrón de entrada adecuado:
          </p>
          <ol className="list-decimal ml-6 mb-4">
            <li className="mb-2">
              <strong className="font-semibold">
                Identificación de Soporte/Resistencia:
              </strong>
              Utilizar el indicador ZigZag para trazar los niveles clave de
              soporte y resistencia en la gráfica de 1 minuto.
            </li>
            <li className="mb-2">
              <strong className="font-semibold">
                Búsqueda de Patrones de Ruptura:
              </strong>
              <ul className="list-disc ml-6 mt-2">
                <li className="mb-1">
                  <strong className="font-semibold">
                    Para Sesgo de Compra:
                  </strong>
                  Buscar rupturas alcistas de niveles de resistencia
                  previamente establecidos.
                </li>
                <li className="mb-1">
                  <strong className="font-semibold">
                    Para Sesgo de Venta:
                  </strong>
                  Buscar rupturas bajistas de niveles de soporte previamente
                  establecidos.
                </li>
              </ul>
            </li>
            <li className="mb-2">
              <strong className="font-semibold">Timing de Entrada:</strong> La
              entrada se realiza inmediatamente después de la confirmación de
              la ruptura mediante la colocación de una orden Buy o Sell Stop.
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
            3.3. Gestión de Riesgos
          </h4>
          <p className="mb-4 text-justify">
            La gestión de riesgos es un pilar fundamental de la estrategia
            para la preservación del capital:
          </p>

          <ul className="list-disc ml-6 mb-4">
            <li className="mb-2">
              <strong className="font-semibold">Regla del 2%:</strong> El
              riesgo máximo por operación no debe exceder el 2% del capital
              total de la cuenta de trading.
            </li>
            <li className="mb-2">
              <strong className="font-semibold">Stop-Loss Fijo:</strong> Se
              establece un stop-loss predefinido (detrás del previo pivote) y fijo para cada operación.
            </li>
            <li className="mb-2">
              <strong className="font-semibold">Take Profit:</strong> El
              objetivo de ganancia se establece en niveles basados en una
              relación riesgo-recompensa 1:1.
            </li>
          </ul>
        </div>
        <div className="flex justify-between pt-4 mt-6 border-t border-gray-200 text-sm text-gray-600">
          <span>Emporium Quality Funds</span>
          <span>Página 3</span>
        </div>
      </div>
      
      {/* Contenido de la "Página 4" del manual */}
      <div className="bg-white rounded-lg shadow-xl mb-8 p-10 relative">
        <div className="min-h-[calc(100vh-120px)]">
          <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-4 pb-2 border-b-2 border-gray-200">
            4. Análisis Empírico y Resultados
          </h3>
          <p className="mb-4 text-justify">
            La validación de esta estrategia se ha realizado a través de un
            riguroso backtesting sobre datos históricos del MNQ, complementado
            con pruebas en tiempo real. Se ha observado que los días con una dirección macroeconómica
            clara y un fuerte catalizador tienden a producir las operaciones
            más exitosas, mientras que los días de incertidumbre
            macroeconómica o consolidación pueden generar señales falsas o un
            rendimiento inferior.
          </p>
          <p className="mb-4 text-justify">
            Para evaluar la estrategia, se utilizarán métricas clave de
            rendimiento y riesgo, esenciales para cualquier fondo de inversión
            que priorice no solo las ganancias, sino también la gestión del
            riesgo para la preservación del capital:
          </p>
          <br />
          <ul className="list-disc ml-6 mb-4">
            <li className="mb-2">
              <strong className="font-semibold">
                Beneficio Neto Total / Retorno Anualizado:
              </strong>
              Mide la rentabilidad global de la estrategia durante el período
              de backtesting.
            </li>
            <li className="mb-2">
              <strong className="font-semibold">Sharpe Ratio:</strong> Es una
              métrica de retorno ajustado al riesgo que mide el exceso de
              retorno por unidad de volatilidad asumida.
            </li>
            <li className="mb-2">
              <strong className="font-semibold">Drawdown Máximo:</strong>
              Representa la mayor caída de la equidad de la cuenta desde un
              pico hasta un mínimo posterior.
            </li>
            <li className="mb-2">
              <strong className="font-semibold">
                Tasa de Acierto (Win Rate):
              </strong>
              El porcentaje de operaciones ganadoras sobre el total de
              operaciones.
            </li>
            <li className="mb-2">
              <strong className="font-semibold">
                Ratio Riesgo/Recompensa:
              </strong>
              Compara la recompensa promedio esperada con el riesgo promedio
              asumido por operación.
            </li>
            <li className="mb-2">
              <strong className="font-semibold">Consistencia:</strong> Evalúa
              si la estrategia mantiene su rendimiento en diferentes
              condiciones de mercado.
            </li>
            <li className="mb-2">
              <strong className="font-semibold">
                Número de Operaciones:
              </strong>
              Un mayor número de operaciones generalmente confiere mayor
              significancia estadística a los resultados.
            </li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-4 pb-2 border-b-2 border-gray-200">
            5. Conclusiones y Recomendaciones
          </h3>
          <p className="mb-4 text-justify">
            La estrategia de trading intradía para futuros Micro E-mini Nasdaq
            100, basada en un enfoque integrado macro-técnico, ofrece un marco
            prometedor para la toma de decisiones en mercados volátiles.
          </p>

          <ul className="list-disc ml-6 mb-4">
            <li className="mb-2">
              <strong className="font-semibold">
                Cuantificación de Factores Macroeconómicos:
              </strong>
              Desarrollar un sistema más objetivo y automatizado o un índice para cuantificar
              el &quot;sentimiento macro&quot; y la dirección.
            </li>
            <li className="mb-2">
              <strong className="font-semibold">
                Adaptación Dinámica de Riesgos:
              </strong>
              Explorar la posibilidad de ajustar los parámetros de riesgo en
              función de la volatilidad del mercado.
            </li>
            <li className="mb-2">
              <strong className="font-semibold">
                Automatización Parcial:
              </strong>
              Investigar la posibilidad de automatizar la identificación de
              patrones técnicos.
            </li>
            <li className="mb-2">
              <strong className="font-semibold">
                Estudio de Correlaciones:
              </strong>
              Profundizar en el estudio de las correlaciones entre el MNQ y
              otros activos.
            </li>
          </ul>

          <p className="mb-4 text-justify">
            En resumen, esta estrategia representa un paso adelante en la
            integración de diferentes tipos de análisis para el trading
            intradía, y con futuras mejoras, tiene el potencial de ser una
            metodología robusta para fondos de inversión.
          </p>
        </div>
        {/* Pie de página de la página 4 */}
        <div className="flex justify-between pt-4 mt-6 border-t border-gray-200 text-sm text-gray-600">
          <span>Emporium Quality Funds</span>
          <span>Página 4</span>
        </div>
      </div>
      {/* Page 5 */}
      <div className="bg-white rounded-lg shadow-xl mb-8 p-10 relative">
        <div className="min-h-[calc(100vh-120px)]">
          <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-4 pb-2 border-b-2 border-gray-200">
            Apéndice 1. Escenario 1: Trades Ganadores
          </h3>
          <p className="mb-4 text-justify">
            En esta sección se presentan ejemplos de operaciones que
            finalizaron con un resultado positivo (take profit).
          </p>

          <h4 className="text-xl font-semibold text-gray-800 mt-5 mb-3">
            (a) Compra 23-07-2025
          </h4>
          <Image
            src="https://i.ibb.co/216gJ8Jd/mnq-x.jpg"
            alt="Operación ganadora de compra"
            className="max-w-full h-auto mx-auto my-4 block rounded-md shadow-md"
            width={700}
            height={400}
          />
          <p className="mb-4 text-xs text-center">
            Descripción: El precio cumple con el patrón de entrada y se dirige directo al target.
          </p>

          <h4 className="text-xl font-semibold text-gray-800 mt-5 mb-3">
            (b) Venta 01-07-2025
          </h4>
          <Image
            src="https://i.ibb.co/JWy9YhdM/sell-profit.png"
            alt="Operación ganadora de venta"
            className="max-w-full h-auto mx-auto my-4 block rounded-md shadow-md"
            width={700}
            height={400}
          />
          <p className="mb-4 text-center text-xs">
            Descripción: El precio cumple con el patrón de entrada y target es conseguido exitosamente.
          </p>

          <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-4 pb-2 border-b-2 border-gray-200">
            Apéndice 2. Escenario 2: Trades Perdedores
          </h3>
          <p className="mb-4 text-justify">
            En esta sección se presentan ejemplos de operaciones que
            finalizaron con un resultado negativo (stop loss).
          </p>

          <h4 className="text-xl font-semibold text-gray-800 mt-5 mb-3">
            (a) Compra 25-06-2025
          </h4>
          <Image
            src="https://i.ibb.co/RkRf7thB/25.png"
            alt="Operación perdedora de compra"
            className="max-w-full h-auto mx-auto my-4 block rounded-md shadow-md"
            width={700}
            height={400}
          />
          <p className="mb-4 text-center text-xs">
            Descripción: El precio no se desarrolla a favor de la compra y cae
            directamente hacia el stop.
          </p>
          <h4 className="text-xl font-semibold text-gray-800 mt-5 mb-3">
            (b) Venta 08-07-25
          </h4>
          <Image
            src="https://i.ibb.co/FdkXQw2/sell-stop.png"
            alt="Operación perdedora de venta"
            className="max-w-full h-auto mx-auto my-4 block rounded-md shadow-md"
            width={700}
            height={400}
          />
          <p className="mb-4 text-center text-xs">
            Descripción: El precio no se desarrolla a favor de la venta y sube
            directamente hacia el stop.
          </p>
        </div>
        <div className="flex justify-between pt-4 mt-6 border-t border-gray-200 text-sm text-gray-600">
          <span>Emporium Quality Funds</span>
          <span>Página 5</span>
        </div>
      </div>
      {/* Page 6 */}
      <div className="bg-white rounded-lg shadow-xl mb-8 p-10 relative">
        <div className="min-h-[calc(100vh-120px)]">
          <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-4 pb-2 border-b-2 border-gray-200">
            Apéndice 3. Métricas Clave del Backtesting
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
                <td className="p-4 border border-gray-200">
                  Drawdown Máximo
                </td>
                <td className="p-4 border border-gray-200 font-semibold text-blue-700">
                  -
                </td>
                <td className="p-4 border border-gray-200">%</td>
              </tr>
              <tr className="even:bg-gray-50">
                <td className="p-4 border border-gray-200">
                  Duración Máx. Drawdown
                </td>
                <td className="p-4 border border-gray-200 font-semibold text-blue-700">
                  -
                </td>
                <td className="p-4 border border-gray-200">días</td>
              </tr>
              <tr className="even:bg-gray-50">
                <td className="p-4 border border-gray-200">
                  Tasa de Acierto
                </td>
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
        {/* Pie de página de la página 6 */}
        <div className="flex justify-between pt-4 mt-6 border-t border-gray-200 text-sm text-gray-600">
          <span>Emporium Quality Funds</span>
          <span>Página 6</span>
        </div>
      </div>
    </div>
  );
}