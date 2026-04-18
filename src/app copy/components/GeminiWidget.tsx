import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Sparkles, Send } from "lucide-react";
import { useState } from "react";

export function GeminiWidget() {
  const [query, setQuery] = useState("");

  const quickQuestions = [
    "¿Cómo está la Vaca 205 hoy?",
    "¿Cuántos animales hay fuera del perímetro?",
    "Resumen de salud del hato"
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm md:text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#3D5A3C]" />
          Asistente Inteligente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="Pregúntame sobre tu ganado..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
          />
          <Button
            size="icon"
            className="bg-[#3D5A3C] hover:bg-[#3D5A3C]/90 flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-[#6B6B6B] font-medium">Consultas frecuentes:</p>
          {quickQuestions.map((question, idx) => (
            <button
              key={idx}
              onClick={() => setQuery(question)}
              className="w-full text-left text-xs p-2 rounded bg-[#FAFAF8] border border-[#E5E5E5] hover:border-[#D1D5DB] transition-colors text-[#2C2C2C]"
            >
              {question}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
