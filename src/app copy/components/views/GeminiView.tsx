import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Sparkles, Send, Bot, User } from "lucide-react";
import { useState } from "react";
import { ScrollArea } from "../ui/scroll-area";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

const initialMessages: Message[] = [
  {
    id: 1,
    role: "assistant",
    content: "¡Hola! Soy Gemini, tu asistente inteligente para el monitoreo de ganado. ¿En qué puedo ayudarte hoy?",
    timestamp: "10:00 AM"
  }
];

export function GeminiView() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");

  const quickActions = [
    { label: "Estado del hato completo", query: "Dame un resumen del estado de salud de todo el hato" },
    { label: "Animales fuera de perímetro", query: "¿Cuántos animales están fuera del perímetro virtual?" },
    { label: "Alertas de temperatura", query: "¿Qué animales tienen temperatura elevada?" },
    { label: "Reporte de batería", query: "Muéstrame los dispositivos con batería baja" },
    { label: "Análisis de ubicaciones", query: "¿En qué sector hay más concentración de ganado?" },
    { label: "Historial de alertas", query: "Dame un resumen de las alertas de las últimas 24 horas" }
  ];

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })
    };

    const mockResponses = [
      "Basándome en los datos actuales, el 98% de tu hato está en excelente estado de salud. Solo hay 1 animal (Vaca 101) fuera del perímetro y 2 con temperatura ligeramente elevada.",
      "He analizado las ubicaciones y encontré que el Sector A tiene la mayor concentración con 45 animales, seguido del Sector B con 30 animales.",
      "Solo hay 1 animal fuera del perímetro virtual: Vaca 101, ubicada 2.3km al norte del límite establecido.",
      "Tengo 2 animales con temperatura elevada: Vaca 078 (39.8°C) y Vaca 023 (40.1°C). Te recomiendo monitorearlos de cerca.",
      "Hay 1 dispositivo con batería crítica (DEV-156 con 15%) que requiere atención inmediata."
    ];

    const assistantMessage: Message = {
      id: messages.length + 2,
      role: "assistant",
      content: mockResponses[Math.floor(Math.random() * mockResponses.length)],
      timestamp: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })
    };

    setMessages([...messages, userMessage, assistantMessage]);
    setInput("");
  };

  const handleQuickAction = (query: string) => {
    setInput(query);
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-4 md:gap-6 p-3 md:p-6">
      <div className="flex-1 min-w-0 flex flex-col h-[500px] lg:h-auto">
        <Card className="flex-1 flex flex-col">
          <CardHeader className="border-b bg-gradient-to-r from-[#3D5A3C]/10 to-transparent">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#3D5A3C]" />
              Gemini Concierge
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Asistente IA para análisis inteligente de tu ganado
            </p>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        message.role === "user"
                          ? "bg-[#5C7A5B]"
                          : "bg-[#3D5A3C]"
                      }`}
                    >
                      {message.role === "user" ? (
                        <User className="h-4 w-4 text-white" />
                      ) : (
                        <Bot className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div
                      className={`flex-1 max-w-[80%] ${
                        message.role === "user" ? "text-right" : ""
                      }`}
                    >
                      <div
                        className={`inline-block px-4 py-3 rounded-lg ${
                          message.role === "user"
                            ? "bg-[#5C7A5B] text-white"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Escribe tu pregunta sobre el ganado..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  className="flex-1"
                />
                <Button
                  onClick={handleSend}
                  className="bg-[#3D5A3C] hover:bg-[#3D5A3C]/90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:w-80 space-y-4 md:space-y-6 overflow-y-auto">
        <Card className="border-[#3D5A3C]/20">
          <CardHeader>
            <CardTitle className="text-sm">Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickAction(action.query)}
                className="w-full text-left p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-sm"
              >
                {action.label}
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="border-[#5C7A5B]/20">
          <CardHeader>
            <CardTitle className="text-sm">Capacidades de Gemini</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-[#3D5A3C] mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Análisis Predictivo</p>
                <p className="text-xs text-muted-foreground">
                  Predice problemas de salud antes de que ocurran
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-[#3D5A3C] mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Consultas en Lenguaje Natural</p>
                <p className="text-xs text-muted-foreground">
                  Pregunta como si hablaras con un experto
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-[#3D5A3C] mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Reportes Inteligentes</p>
                <p className="text-xs text-muted-foreground">
                  Genera insights automáticos de tus datos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
