import { DRIVER_LABELS } from '@/lib/constants';
import { DriverMetric, NpsBreakdown, Opportunity, SurveyRow } from '@/lib/types';

const likertMap: Record<string, number> = {
  'Totalmente en desacuerdo': 1,
  'En desacuerdo': 2,
  'Ni de acuerdo ni en desacuerdo': 3,
  'De acuerdo': 4,
  'Totalmente de acuerdo': 5,
  'Muy en desacuerdo': 1,
  'Muy de acuerdo': 5
};

export function availablePeriods(rows: SurveyRow[]): string[] {
  return [...new Set(rows.map((r) => r.periodoEvaluado).filter(Boolean))].sort().reverse();
}

export function previousPeriod(period: string): string | null {
  const match = period.match(/^(\d{4})-Q([1-4])$/);
  if (!match) return null;
  const year = Number(match[1]);
  const quarter = Number(match[2]);
  if (quarter === 1) return `${year - 1}-Q4`;
  return `${year}-Q${quarter - 1}`;
}

export function calculateNps(scores: number[]): NpsBreakdown {
  const total = scores.length;
  if (!total) return { total: 0, promoters: 0, passives: 0, detractors: 0, promotersPct: 0, passivesPct: 0, detractorsPct: 0, nps: 0 };
  const promoters = scores.filter((score) => score >= 9).length;
  const passives = scores.filter((score) => score >= 7 && score <= 8).length;
  const detractors = scores.filter((score) => score <= 6).length;
  const promotersPct = round1((promoters / total) * 100);
  const passivesPct = round1((passives / total) * 100);
  const detractorsPct = round1((detractors / total) * 100);
  return {
    total,
    promoters,
    passives,
    detractors,
    promotersPct,
    passivesPct,
    detractorsPct,
    nps: Math.round(promotersPct - detractorsPct)
  };
}

export function filterRows(rows: SurveyRow[], period: string, agency?: string): SurveyRow[] {
  return rows.filter((row) => row.periodoEvaluado === period && (!agency || row.agenciaEvaluada === agency));
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function avg(values: number[]): number {
  if (!values.length) return 0;
  return round1(values.reduce((acc, value) => acc + value, 0) / values.length);
}

function normalizedTrend(current: number, previous: number): number {
  return round1(current - previous);
}

export function computeDriverMetrics(currentRows: SurveyRow[], previousRows: SurveyRow[]): DriverMetric[] {
  return Object.entries(DRIVER_LABELS).map(([key, label]) => {
    const currentValues = currentRows.map((row) => likertMap[(row as unknown as Record<string, string>)[key]] ?? 0).filter(Boolean);
    const previousValues = previousRows.map((row) => likertMap[(row as unknown as Record<string, string>)[key]] ?? 0).filter(Boolean);
    const average = avg(currentValues);
    const prevAverage = avg(previousValues);
    const coverage = currentRows.length ? round1((currentValues.length / currentRows.length) * 100) : 0;
    const trend = normalizedTrend(average, prevAverage);
    const score = round1(average * 20 + Math.max(trend, 0) * 5 + coverage * 0.1);
    return { key, label, average, coverage, score, trend };
  });
}

export function topStrengths(driverMetrics: DriverMetric[], limit = 3): DriverMetric[] {
  return [...driverMetrics].sort((a, b) => b.average - a.average || b.trend - a.trend).slice(0, limit);
}

export function identifyOpportunities(currentRows: SurveyRow[], previousRows: SurveyRow[]): Opportunity[] {
  const currentDrivers = computeDriverMetrics(currentRows, previousRows);
  return currentDrivers
    .map((driver) => {
      const lowScoreImpact = (5 - driver.average) * 20;
      const affectedAgencies = new Set(currentRows.map((row) => row.agenciaEvaluada)).size;
      const negativeTrend = Math.max(driver.trend * -1, 0) * 15;
      const score = round1(lowScoreImpact * 0.6 + negativeTrend * 0.25 + affectedAgencies * 2.5);
      const priority: Opportunity['priority'] = score >= 45 ? 'Alta' : score >= 28 ? 'Media' : 'Baja';
      return {
        key: driver.key,
        label: driver.label,
        priority,
        score,
        average: driver.average,
        trend: driver.trend,
        affectedAgencies,
        summary:
          driver.trend < 0
            ? `Cayó ${Math.abs(driver.trend).toFixed(1)} vs. el período anterior y hoy promedia ${driver.average}/5.`
            : `Hoy promedia ${driver.average}/5 y concentra oportunidades de mejora estructurales.`
      };
    })
    .sort((a, b) => b.score - a.score);
}

export function computeAgencyRanking(rows: SurveyRow[], period: string): Array<{ agency: string; nps: number; responses: number }> {
  const byAgency = new Map<string, SurveyRow[]>();
  for (const row of rows.filter((item) => item.periodoEvaluado === period)) {
    const bucket = byAgency.get(row.agenciaEvaluada) || [];
    bucket.push(row);
    byAgency.set(row.agenciaEvaluada, bucket);
  }
  return [...byAgency.entries()]
    .map(([agency, agencyRows]) => ({
      agency,
      nps: calculateNps(agencyRows.map((row) => row.npsRecomendacion)).nps,
      responses: agencyRows.length
    }))
    .sort((a, b) => b.nps - a.nps || b.responses - a.responses);
}

export function extractCommentThemes(rows: SurveyRow[]): string[] {
  const corpus = rows.flatMap((row) => [row.motivoPuntuacion, row.comentariosAdicionales].filter(Boolean)).join(' ').toLowerCase();
  const themes = [
    'estrategia',
    'análisis',
    'procesos',
    'implementación',
    'oportunidades',
    'colaboración',
    'creatividad',
    'tiempos'
  ];
  return themes
    .map((theme) => ({ theme, count: corpus.split(theme).length - 1 }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((item) => item.theme);
}

export function summarizeAspects(rows: SurveyRow[]): Array<{ aspect: string; mentions: number }> {
  const map = new Map<string, number>();
  rows.forEach((row) => row.aspectos.forEach((aspect) => map.set(aspect, (map.get(aspect) || 0) + 1)));
  return [...map.entries()]
    .map(([aspect, mentions]) => ({ aspect, mentions }))
    .sort((a, b) => b.mentions - a.mentions)
    .slice(0, 6);
}
