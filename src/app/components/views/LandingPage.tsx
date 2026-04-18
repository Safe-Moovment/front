import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import {
  MapPin,
  Shield,
  Wifi,
  TrendingUp,
  Droplet,
  Heart,
  FileText,
  Leaf,
  Smartphone,
  Bell,
  Award,
  Cloud,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { ImageWithFallback } from "../ui/ImageWithFallback";
import { useNavigate } from "react-router";
import { BrandLogo } from "../BrandLogo";

export function LandingPage() {
  const navigate = useNavigate();

  const handleCTA = () => {
    navigate("/dashboard");
  };

  const handleDemoCTA = () => {
    navigate("/demo");
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Hero Section */}
      <section className="relative min-h-[600px] md:min-h-[700px] lg:min-h-[800px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1624350272806-7af5919b2465?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZXhpY2FuJTIwY2F0dGxlJTIwZ3JhemluZyUyMGxhbmRzY2FwZXxlbnwxfHx8fDE3NzY0ODE5NDV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Ganado en pastizales mexicanos"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#2C2C2C]/90 via-[#2C2C2C]/70 to-[#2C2C2C]/50" />
        </div>

        <div className="absolute top-6 left-4 md:left-6 lg:left-8 z-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 text-white shadow-lg">
          <BrandLogo tone="light" imageClassName="h-9 w-9" textClassName="text-white" />
        </div>

        <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Safe Moovement: Rentabilidad y Bienestar Animal a través de Cercas Digitales Inteligentes
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
              Utilizamos <span className="font-semibold text-[#5C7A5B] bg-white/10 px-2 py-1 rounded">Precision Livestock Farming (PLF)</span> y sensores avanzados para monitorear la salud y ubicación de tu ganado en tiempo real, optimizando recursos y previniendo pérdidas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleDemoCTA}
                className="bg-[#5C7A5B] hover:bg-[#4A6249] text-white px-8 py-6 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                Ver Demo Interactiva
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                onClick={handleCTA}
                variant="outline"
                className="border-white/70 text-white bg-white/10 hover:bg-white hover:text-[#2C2C2C] px-8 py-6 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                Probar Plataforma (Beta)
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Módulos de Funcionalidad Técnica */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#2C2C2C] mb-4">
              Tecnología Avanzada para el Campo Mexicano
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Herramientas de precisión que transforman la ganadería tradicional en una operación inteligente y rentable
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {/* Mapas Topográficos */}
            <Card className="border-2 border-[#E5E5E5] hover:border-[#5C7A5B] transition-all hover:shadow-xl group">
              <CardContent className="p-6">
                <div className="relative h-48 mb-6 rounded-lg overflow-hidden">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1774646598595-fa600737ecec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b3BvZ3JhcGhpYyUyMG1hcCUyMHRlcnJhaW4lMjBlbGV2YXRpb258ZW58MXx8fHwxNzc2NDgxOTQ1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt="Mapas topográficos"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex items-start gap-3 mb-4">
                  <div className="bg-[#5C7A5B]/10 p-3 rounded-lg">
                    <MapPin className="h-6 w-6 text-[#5C7A5B]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#2C2C2C] mb-2">
                      Mapas Topográficos y Zonas de Riesgo
                    </h3>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Integración de <strong>OpenTopoData</strong> y <strong>Google Maps</strong> para identificar barrancos con pendientes mayores a 30° y zonas inundables.
                </p>
                <div className="flex items-center gap-2 text-sm text-[#5C7A5B] font-medium">
                  <CheckCircle2 className="h-4 w-4" />
                  Prevención de muertes accidentales
                </div>
              </CardContent>
            </Card>

            {/* Cercado Virtual */}
            <Card className="border-2 border-[#E5E5E5] hover:border-[#5C7A5B] transition-all hover:shadow-xl group">
              <CardContent className="p-6">
                <div className="relative h-48 mb-6 rounded-lg overflow-hidden">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1762381650890-43b1030fc842?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaXZlc3RvY2slMjB0ZWNobm9sb2d5JTIwc2Vuc29yc3xlbnwxfHx8fDE3NzY0ODE5NDZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt="Cercado virtual"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex items-start gap-3 mb-4">
                  <div className="bg-[#5C7A5B]/10 p-3 rounded-lg">
                    <Shield className="h-6 w-6 text-[#5C7A5B]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#2C2C2C] mb-2">
                      Cercado Virtual (Virtual Fencing)
                    </h3>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Control de movimiento mediante estímulos auditivos, eliminando la necesidad de infraestructura física costosa.
                </p>
                <div className="flex items-center gap-2 text-sm text-[#5C7A5B] font-medium">
                  <CheckCircle2 className="h-4 w-4" />
                  Ahorro del 70% en infraestructura
                </div>
              </CardContent>
            </Card>

            {/* Edge Computing */}
            <Card className="border-2 border-[#E5E5E5] hover:border-[#5C7A5B] transition-all hover:shadow-xl group">
              <CardContent className="p-6">
                <div className="relative h-48 mb-6 rounded-lg overflow-hidden">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1677480357171-bd1916641fe3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpb3QlMjBjb2xsYXIlMjBkZXZpY2V8ZW58MXx8fHwxNzc2NDgxOTQ2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt="Edge computing"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex items-start gap-3 mb-4">
                  <div className="bg-[#5C7A5B]/10 p-3 rounded-lg">
                    <Wifi className="h-6 w-6 text-[#5C7A5B]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#2C2C2C] mb-2">
                      Edge Computing y LoRaWAN
                    </h3>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Procesamiento de datos directamente en el collar para respuesta instantánea, incluso en zonas rurales sin internet.
                </p>
                <div className="flex items-center gap-2 text-sm text-[#5C7A5B] font-medium">
                  <CheckCircle2 className="h-4 w-4" />
                  Funciona 100% offline
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* KPIs y Beneficios Cuantificables */}
      <section className="py-16 md:py-24 bg-[#F0F0ED]">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#2C2C2C] mb-4">
              Resultados Medibles, Rentabilidad Comprobada
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Impacto directo en tu operación ganadera con métricas concretas
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="bg-[#5C7A5B]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-[#5C7A5B]" />
                </div>
                <div className="text-4xl font-bold text-[#2C2C2C] mb-2">25%</div>
                <p className="text-gray-600 font-medium">Aumento en productividad</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="bg-[#5C7A5B]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Droplet className="h-8 w-8 text-[#5C7A5B]" />
                </div>
                <div className="text-4xl font-bold text-[#2C2C2C] mb-2">40%</div>
                <p className="text-gray-600 font-medium">Reducción en uso de agua</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="bg-[#5C7A5B]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-[#5C7A5B]" />
                </div>
                <div className="text-4xl font-bold text-[#2C2C2C] mb-2">30%</div>
                <p className="text-gray-600 font-medium">Mejora en bienestar animal</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="bg-[#5C7A5B]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-[#5C7A5B]" />
                </div>
                <div className="text-4xl font-bold text-[#2C2C2C] mb-2">90%</div>
                <p className="text-gray-600 font-medium">Reducción en pérdidas</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 bg-white rounded-2xl p-8 md:p-12 shadow-lg">
            <h3 className="text-2xl md:text-3xl font-bold text-[#2C2C2C] mb-8 text-center">
              Beneficios Económicos Directos
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-[#5C7A5B] flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-[#2C2C2C] mb-1">Reducción de costos operativos</h4>
                  <p className="text-gray-600">Menor necesidad de mano de obra para supervisión de perímetros</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-[#5C7A5B] flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-[#2C2C2C] mb-1">Optimización de recursos</h4>
                  <p className="text-gray-600">Uso eficiente de agua, medicamentos y suplementos alimenticios</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-[#5C7A5B] flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-[#2C2C2C] mb-1">Prevención de pérdidas</h4>
                  <p className="text-gray-600">Alertas tempranas de enfermedades y reducción de mortalidad</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-[#5C7A5B] flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-[#2C2C2C] mb-1">Mayor valor de mercado</h4>
                  <p className="text-gray-600">Certificación de trazabilidad y bienestar animal</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Valor Social y Compromiso Etico */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#2C2C2C] mb-4">
              Valor Social y Compromiso Etico
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              "Mas que tecnologia, es un compromiso con la vida." En Safe Movement creemos que la
              rentabilidad debe ir de la mano con la etica para impulsar una ganaderia mas humana,
              sostenible y transparente.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
            <Card className="border-2 border-[#E5E5E5] hover:border-[#5C7A5B] transition-all hover:shadow-xl">
              <CardContent className="p-6 md:p-8">
                <div className="bg-[#5C7A5B]/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                  <Heart className="h-7 w-7 text-[#5C7A5B]" />
                </div>
                <h3 className="text-2xl font-semibold text-[#2C2C2C] mb-4">Bienestar Animal sin Estres</h3>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    <strong className="text-[#2C2C2C]">Monitoreo No Invasivo:</strong> Supervisamos
                    24/7 sin manipulacion fisica frecuente, reduciendo el estres del ganado y evitando
                    alteraciones en su comportamiento natural.
                  </p>
                  <p>
                    <strong className="text-[#2C2C2C]">Atencion Temprana y Humanitaria:</strong> Al
                    detectar cambios fisiologicos antes de sintomas clinicos visibles, facilitamos
                    intervenciones veterinarias oportunas y reducimos sufrimiento innecesario.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#E5E5E5] hover:border-[#5C7A5B] transition-all hover:shadow-xl">
              <CardContent className="p-6 md:p-8">
                <div className="bg-[#5C7A5B]/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                  <Shield className="h-7 w-7 text-[#5C7A5B]" />
                </div>
                <h3 className="text-2xl font-semibold text-[#2C2C2C] mb-4">Seguridad Alimentaria y Confianza</h3>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    <strong className="text-[#2C2C2C]">Estandares de Salud Superiores:</strong>
                    Fortalecemos controles sanitarios para ofrecer alimentos de origen animal con mayor
                    calidad y trazabilidad para el consumidor final.
                  </p>
                  <p>
                    <strong className="text-[#2C2C2C]">Prevencion de Brotes:</strong> La deteccion
                    temprana ayuda a contener enfermedades dentro del hato y protege la integridad de
                    la produccion regional.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#E5E5E5] hover:border-[#5C7A5B] transition-all hover:shadow-xl">
              <CardContent className="p-6 md:p-8">
                <div className="bg-[#5C7A5B]/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                  <Leaf className="h-7 w-7 text-[#5C7A5B]" />
                </div>
                <h3 className="text-2xl font-semibold text-[#2C2C2C] mb-4">Sostenibilidad y Futuro</h3>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    <strong className="text-[#2C2C2C]">Ganaderia Etica:</strong> Impulsamos manejo
                    responsable alineado con una sociedad que valora el respeto por la vida animal y la
                    produccion consciente.
                  </p>
                  <p>
                    <strong className="text-[#2C2C2C]">Impacto Social Positivo:</strong> Safe
                    Movement beneficia al productor y fortalece una industria agropecuaria mas eficiente,
                    sostenible y orientada al cuidado integral.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-10 md:mt-12 rounded-2xl bg-[#F0F0ED] border border-[#E5E5E5] p-6 md:p-8 text-center">
            <p className="text-xl md:text-2xl font-semibold text-[#2C2C2C] leading-relaxed">
              La rentabilidad y el bienestar animal no compiten: se potencian cuando la tecnologia se
              diseña con etica, evidencia y compromiso social.
            </p>
          </div>
        </div>
      </section>

      {/* Trazabilidad y Sostenibilidad */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#2C2C2C] mb-6">
                Trazabilidad Completa y Ganadería Sostenible
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Construimos una cadena de valor transparente que conecta proveedores, productores y consumidores, mientras promovemos prácticas ambientalmente responsables.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-[#5C7A5B]/10 p-3 rounded-lg flex-shrink-0">
                    <FileText className="h-6 w-6 text-[#5C7A5B]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#2C2C2C] text-lg mb-2">Cadena de Suministro Transparente</h4>
                    <p className="text-gray-600">
                      Trazabilidad completa "pienso-animal-alimento" que beneficia a proveedores de alimento, ganaderos y mataderos. Cumplimiento con estándares internacionales.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-[#5C7A5B]/10 p-3 rounded-lg flex-shrink-0">
                    <Leaf className="h-6 w-6 text-[#5C7A5B]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#2C2C2C] text-lg mb-2">Impacto Ambiental Positivo</h4>
                    <p className="text-gray-600">
                      Manejo eficiente de recursos hídricos, reducción en el uso de medicamentos, y prácticas de pastoreo regenerativo que mejoran la salud del suelo.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1738669470463-78d1e0d6654b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXN0YWluYWJsZSUyMGNhdHRsZSUyMGZhcm1pbmd8ZW58MXx8fHwxNzc2NDgxOTQ2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Ganadería sostenible"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-[#5C7A5B] text-white p-6 rounded-xl shadow-xl max-w-xs">
                <p className="text-sm font-medium mb-1">Certificación disponible</p>
                <p className="text-2xl font-bold">Ganadería Regenerativa</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interfaz y Experiencia */}
      <section className="py-16 md:py-24 bg-[#F0F0ED]">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1758411898158-213a318e2442?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwbW9uaXRvcmluZyUyMGRhc2hib2FyZHxlbnwxfHx8fDE3NzY0ODE5NDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Dashboard de monitoreo"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#2C2C2C] mb-6">
                Tecnología Accesible para Todos
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Interfaz intuitiva diseñada para ganaderos, no para ingenieros. Si sabes usar Google Maps, ya sabes usar nuestro sistema.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-[#5C7A5B]/10 p-3 rounded-lg flex-shrink-0">
                    <Smartphone className="h-6 w-6 text-[#5C7A5B]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#2C2C2C] text-lg mb-2">Visualización Familiar con Google Maps</h4>
                    <p className="text-gray-600">
                      Dibuja perímetros virtuales directamente sobre imágenes satelitales. La misma herramienta que ya conoces, potenciada con datos en tiempo real de tu ganado.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-[#5C7A5B]/10 p-3 rounded-lg flex-shrink-0">
                    <Bell className="h-6 w-6 text-[#5C7A5B]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#2C2C2C] text-lg mb-2">Alertas Automáticas Inteligentes</h4>
                    <p className="text-gray-600">
                      Notificaciones instantáneas sobre estrés térmico, intentos de escape, ingreso a zonas de riesgo topográfico, o anomalías en comportamiento.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-[#5C7A5B]/10 p-3 rounded-lg flex-shrink-0">
                    <Smartphone className="h-6 w-6 text-[#5C7A5B]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#2C2C2C] text-lg mb-2">Acceso Multiplataforma</h4>
                    <p className="text-gray-600">
                      Monitorea tu hato desde computadora, tablet o teléfono móvil. Diseño optimizado para uso bajo luz solar intensa.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Confianza y Soporte */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#2C2C2C] mb-4">
              Respaldado por Ciencia y Tecnología de Clase Mundial
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Tu inversión protegida con la mejor fundamentación científica y soporte técnico
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-2 border-[#E5E5E5] hover:border-[#5C7A5B] transition-all">
              <CardContent className="p-6">
                <div className="bg-[#5C7A5B]/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-[#5C7A5B]" />
                </div>
                <h3 className="text-xl font-semibold text-[#2C2C2C] mb-3">
                  Fundamentación Científica
                </h3>
                <p className="text-gray-600">
                  Desarrollo basado en investigaciones de <strong>CSIRO</strong> (Australia) y validado con datos de alta precisión de <strong>INEGI</strong> y <strong>LiDAR</strong> para topografía mexicana.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#E5E5E5] hover:border-[#5C7A5B] transition-all">
              <CardContent className="p-6">
                <div className="bg-[#5C7A5B]/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Cloud className="h-6 w-6 text-[#5C7A5B]" />
                </div>
                <h3 className="text-xl font-semibold text-[#2C2C2C] mb-3">
                  Modo Offline Completo
                </h3>
                <p className="text-gray-600">
                  Tu inversión protegida con servidor local <strong>Docker</strong>. El sistema funciona completamente sin conexión externa ante fallas de conectividad.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#E5E5E5] hover:border-[#5C7A5B] transition-all">
              <CardContent className="p-6">
                <div className="bg-[#5C7A5B]/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-[#5C7A5B]" />
                </div>
                <h3 className="text-xl font-semibold text-[#2C2C2C] mb-3">
                  Soporte Técnico Local
                </h3>
                <p className="text-gray-600">
                  Equipo de soporte en español con conocimiento profundo de ganadería mexicana. Capacitación inicial incluida y actualizaciones constantes.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Especificaciones Técnicas */}
          <div className="mt-12 bg-[#F0F0ED] rounded-2xl p-8 md:p-12">
            <h3 className="text-2xl md:text-3xl font-bold text-[#2C2C2C] mb-8 text-center">
              Especificaciones Técnicas
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#5C7A5B] mb-2">15 km</div>
                <p className="text-gray-600">Alcance LoRaWAN</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#5C7A5B] mb-2">2-5m</div>
                <p className="text-gray-600">Precisión GPS</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#5C7A5B] mb-2">24/7</div>
                <p className="text-gray-600">Monitoreo continuo</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#5C7A5B] mb-2">30 días</div>
                <p className="text-gray-600">Batería collar</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-[#2C2C2C] to-[#3A3A3A] text-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Transforma tu Operación Ganadera Hoy
          </h2>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Únete a los ganaderos mexicanos que ya están optimizando su rentabilidad y mejorando el bienestar de su ganado con tecnología de precisión.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleDemoCTA}
              className="bg-[#5C7A5B] hover:bg-[#4A6249] text-white px-8 py-6 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              Ver Demo Interactiva
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              onClick={handleCTA}
              variant="outline"
              className="border-white/70 text-white bg-white/10 hover:bg-white hover:text-[#2C2C2C] px-8 py-6 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              Probar Plataforma (Beta)
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2C2C2C] text-white/70 py-8">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 text-center">
          <p className="mb-2">© 2026 Safe Moovment. Todos los derechos reservados.</p>
          <p className="text-sm">Precision Livestock Farming para el campo mexicano</p>
        </div>
      </footer>
    </div>
  );
}
