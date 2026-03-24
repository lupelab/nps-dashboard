import OpenAI from 'openai';
import { DriverMetric, Opportunity, RecommendationPack } from '@/lib/types';

function fallbackRecommendations(context: {
  title: string;
  period: string;
  currentNps: number;
  previousNps: number;
  strengths: DriverMetric[];
  opportunities: Opportunity[];
  themes: string[];
}): RecommendationPack {
  const delta = context.currentNps - context.previousNps;
  const topOpps = context.opportunities.slice(0, 3).map((item) => item.label);
  const topStrengths = context.strengths.slice(0, 3).map((item) => item.label);
  return {
    executiveSummary: `${context.title} muestra un NPS de ${context.currentNps} en ${context.period}${context.previousNps || context.previousNps === 0 ? `, con una variación de ${delta >= 0 ? '+' : ''}${delta} vs. el período anterior` : ''}. Las fortalezas más claras son ${topStrengths.join(', ') || 'la relación operativa con el cliente'}. Las principales oportunidades se concentran en ${topOpps.join(', ') || 'consistencia de ejecución y claridad de valor'}. Los comentarios repiten temas como ${context.themes.join(', ') || 'estrategia y colaboración'}.`,
    actionPlan: [
      { horizon: '30 días', actions: ['Revisar cuentas detractoras y pasivas una por una.', `Definir quick wins sobre ${topOpps[0] || 'el driver con peor desempeño'}.`] },
      { horizon: '60 días', actions: ['Alinear a líderes de cuenta con un playbook común.', `Escalar prácticas de ${topStrengths[0] || 'la mejor fortaleza'} al resto del equipo.`] },
      { horizon: '90 días', actions: ['Medir impacto de las acciones en cuentas críticas.', 'Ajustar procesos y rituales trimestrales antes del próximo envío.'] }
    ],
    quickWins: ['Llamadas de cierre con cuentas pasivas y detractoras.', 'Reporte ejecutivo mensual con oportunidades detectadas.', 'Checklist de calidad previo a entregables críticos.'],
    risks: ['Que el próximo quarter mantenga la misma base de detractores.', 'Que se repita la fricción entre estrategia y ejecución.', 'Que no se capitalicen las fortalezas de las agencias benchmark.'],
    monitoring: ['NPS por quarter', 'Promedio por driver', 'Tasa de respuesta', 'Comentarios con temas repetidos', 'Evolución de cuentas detractoras']
  };
}

export async function buildRecommendations(context: {
  title: string;
  period: string;
  currentNps: number;
  previousNps: number;
  sampleSize: number;
  strengths: DriverMetric[];
  opportunities: Opportunity[];
  themes: string[];
  rankingText?: string;
}): Promise<RecommendationPack> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return fallbackRecommendations(context);

  const client = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

  const prompt = `Sos un consultor senior de customer experience y gestión de agencias.
Analizá los resultados de ${context.title} para ${context.period}.

Datos:
- NPS actual: ${context.currentNps}
- NPS anterior: ${context.previousNps}
- Muestra: ${context.sampleSize}
- Fortalezas: ${context.strengths.map((item) => `${item.label} (${item.average}/5)`).join(', ')}
- Oportunidades: ${context.opportunities.slice(0, 5).map((item) => `${item.label} [${item.priority}] avg ${item.average}/5 trend ${item.trend}`).join(', ')}
- Temas en comentarios: ${context.themes.join(', ')}
- Ranking agencias: ${context.rankingText || 'No aplica'}

Respondé solo JSON válido con esta forma exacta:
{
  "executiveSummary": "...",
  "actionPlan": [
    {"horizon": "30 días", "actions": ["...", "..."]},
    {"horizon": "60 días", "actions": ["...", "..."]},
    {"horizon": "90 días", "actions": ["...", "..."]}
  ],
  "quickWins": ["..."],
  "risks": ["..."],
  "monitoring": ["..."]
}`;

  try {
    const response = await client.responses.create({
      model,
      input: prompt,
      temperature: 0.4
    });
    const text = response.output_text;
    return JSON.parse(text) as RecommendationPack;
  } catch {
    return fallbackRecommendations(context);
  }
}
