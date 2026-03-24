export const dynamic = 'force-dynamic';

import { DashboardShell } from '@/components/DashboardShell';
import { MetricCard } from '@/components/MetricCard';
import { requireSession } from '@/lib/auth';
import { getSurveyRows } from '@/lib/sheets';
import {
  availablePeriods,
  calculateNps,
  computeAgencyRanking,
  computeDriverMetrics,
  extractCommentThemes,
  filterRows,
  identifyOpportunities,
  previousPeriod,
  summarizeAspects,
  topStrengths
} from '@/lib/analytics';
import { buildRecommendations } from '@/lib/ai';

export default async function DashboardPage({ searchParams }: { searchParams: { period?: string } }) {
  const session = await requireSession();
  const rows = await getSurveyRows();
  const periods = availablePeriods(rows);
  const selectedPeriod = searchParams.period && periods.includes(searchParams.period) ? searchParams.period : periods[0];

  if (!selectedPeriod) {
    return (
      <DashboardShell user={session}>
        <div className="panel">No hay datos todavía en la hoja.</div>
      </DashboardShell>
    );
  }

  const prevPeriod = previousPeriod(selectedPeriod) || '';
  const currentRows = filterRows(rows, selectedPeriod, session.role === 'agency' ? session.agency : undefined);
  const previousRows = prevPeriod ? filterRows(rows, prevPeriod, session.role === 'agency' ? session.agency : undefined) : [];

  const currentNps = calculateNps(currentRows.map((row) => row.npsRecomendacion));
  const previousNps = calculateNps(previousRows.map((row) => row.npsRecomendacion));
  const currentContinuity = calculateNps(currentRows.map((row) => row.npsContinuidad));
  const strengths = topStrengths(computeDriverMetrics(currentRows, previousRows), 4);
  const opportunities = identifyOpportunities(currentRows, previousRows).slice(0, 6);
  const themes = extractCommentThemes(currentRows);
  const aspectSummary = summarizeAspects(currentRows);
  const ranking = session.role === 'holding' ? computeAgencyRanking(rows, selectedPeriod) : [];

  const recommendations = await buildRecommendations({
    title: session.role === 'holding' ? 'Holding TEXO' : `Agencia ${session.agency}`,
    period: selectedPeriod,
    currentNps: currentNps.nps,
    previousNps: previousNps.nps,
    sampleSize: currentRows.length,
    strengths,
    opportunities,
    themes,
    rankingText: ranking.map((item, index) => `${index + 1}. ${item.agency} (${item.nps})`).join(' | ')
  });

  return (
    <DashboardShell user={session}>
      <div className="hero">
        <div>
          <h1 style={{ marginBottom: 6 }}>{session.role === 'holding' ? 'Vista TEXO Holding' : `Vista ${session.agency}`}</h1>
          <div className="small">Quarter analizado: {selectedPeriod}</div>
        </div>
        <form method="GET" style={{ display: 'grid', gap: 8 }}>
          <select className="select" name="period" defaultValue={selectedPeriod}>
            {periods.map((period) => <option key={period} value={period}>{period}</option>)}
          </select>
          <button className="button" type="submit">Ver quarter</button>
        </form>
      </div>

      <div className="grid grid-4">
        <MetricCard title="NPS recomendación" value={currentNps.nps} detail={`${currentNps.total} respuestas`} />
        <MetricCard title="Variación vs quarter anterior" value={`${currentNps.nps - previousNps.nps >= 0 ? '+' : ''}${currentNps.nps - previousNps.nps}`} detail={prevPeriod ? `Comparado con ${prevPeriod}` : 'Sin período previo'} />
        <MetricCard title="NPS continuidad" value={currentContinuity.nps} detail="Intención de seguir contratando" />
        <MetricCard title="Promotores / Pasivos / Detractores" value={`${currentNps.promoters}/${currentNps.passives}/${currentNps.detractors}`} detail={`${currentNps.promotersPct}% / ${currentNps.passivesPct}% / ${currentNps.detractorsPct}%`} />
      </div>

      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <div className="panel">
          <h2 className="section-title">Fortalezas {session.role === 'holding' ? 'del holding' : 'de la agencia'}</h2>
          <div className="grid">
            {strengths.map((item) => (
              <div key={item.key} className="panel" style={{ background: 'var(--panel-soft)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <strong>{item.label}</strong>
                  <span className="badge good">{item.average}/5</span>
                </div>
                <div className="small" style={{ marginTop: 8 }}>Tendencia {item.trend >= 0 ? '+' : ''}{item.trend} vs. período anterior</div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <h2 className="section-title">Oportunidades priorizadas</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Driver</th>
                <th>Prioridad</th>
                <th>Promedio</th>
                <th>Tendencia</th>
              </tr>
            </thead>
            <tbody>
              {opportunities.map((item) => (
                <tr key={item.key}>
                  <td>
                    <strong>{item.label}</strong>
                    <div className="small">{item.summary}</div>
                  </td>
                  <td className={`priority-${item.priority}`}>{item.priority}</td>
                  <td>{item.average}/5</td>
                  <td>{item.trend >= 0 ? '+' : ''}{item.trend}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {session.role === 'holding' ? (
        <div className="panel" style={{ marginTop: 16 }}>
          <h2 className="section-title">Ranking entre agencias</h2>
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Agencia</th>
                <th>NPS</th>
                <th>Respuestas</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((item, index) => (
                <tr key={item.agency}>
                  <td>{index + 1}</td>
                  <td>{item.agency}</td>
                  <td>{item.nps}</td>
                  <td>{item.responses}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <div className="panel">
          <h2 className="section-title">Aspectos más mencionados</h2>
          <ul className="list">
            {aspectSummary.map((item) => (
              <li key={item.aspect} style={{ marginBottom: 8 }}>{item.aspect} — {item.mentions} menciones</li>
            ))}
          </ul>
          <h3>Temas en comentarios</h3>
          <div className="kpi-strip">
            {themes.map((theme) => <span key={theme} className="badge warn">{theme}</span>)}
          </div>
        </div>
        <div className="panel">
          <h2 className="section-title">Plan de acción sugerido {session.role === 'holding' ? 'para TEXO' : 'por IA'}</h2>
          <p>{recommendations.executiveSummary}</p>
          <div className="grid">
            {recommendations.actionPlan.map((block) => (
              <div key={block.horizon} className="panel" style={{ background: 'var(--panel-soft)' }}>
                <strong>{block.horizon}</strong>
                <ul className="list">
                  {block.actions.map((action) => <li key={action}>{action}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <div className="panel">
          <h2 className="section-title">Quick wins</h2>
          <ul className="list">
            {recommendations.quickWins.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
        <div className="panel">
          <h2 className="section-title">Riesgos y monitoreo</h2>
          <strong>Riesgos</strong>
          <ul className="list">
            {recommendations.risks.map((item) => <li key={item}>{item}</li>)}
          </ul>
          <strong>Indicadores</strong>
          <ul className="list">
            {recommendations.monitoring.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      </div>
    </DashboardShell>
  );
}
