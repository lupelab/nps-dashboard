import { google } from 'googleapis';
import { getPrivateKey, requiredEnv } from '@/lib/env';
import { SurveyRow } from '@/lib/types';

function normalize(value: unknown): string {
  return String(value ?? '').trim();
}

function toNumber(value: unknown): number {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function normalizeAspectList(value: unknown): string[] {
  return normalize(value)
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean);
}

function mapRow(values: unknown[]): SurveyRow {
  return {
    timestamp: normalize(values[0]),
    periodoEvaluado: normalize(values[1]),
    agenciaEvaluada: normalize(values[2]) as SurveyRow['agenciaEvaluada'],
    correo: normalize(values[3]),
    nombreApellido: normalize(values[4]),
    organizacion: normalize(values[5]),
    cargo: normalize(values[6]),
    servicioContratado: normalize(values[7]),
    q1DisfrutoTrabajar: normalize(values[8]),
    q2Fiables: normalize(values[9]),
    q3Colaborativo: normalize(values[10]),
    q4CreoValor: normalize(values[11]),
    q5BasadoEstrategia: normalize(values[12]),
    q6MentalidadCreativa: normalize(values[13]),
    aspectos: normalizeAspectList(values[14]),
    npsRecomendacion: toNumber(values[15]),
    npsCategoriaRecomendacion: normalize(values[16]),
    npsContinuidad: toNumber(values[17]),
    npsCategoriaContinuidad: normalize(values[18]),
    motivoPuntuacion: normalize(values[19]),
    comentariosAdicionales: normalize(values[20]),
    reunionSolicitada: normalize(values[21])
  };
}

export async function getSurveyRows(): Promise<SurveyRow[]> {
  const auth = new google.auth.JWT({
    email: requiredEnv('GOOGLE_SERVICE_ACCOUNT_EMAIL'),
    key: getPrivateKey(),
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = requiredEnv('GOOGLE_SHEETS_ID');
  const sheetName = process.env.GOOGLE_SHEET_NAME || 'Respuestas';

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A:V`
  });

  const rows = response.data.values || [];
  if (rows.length <= 1) return [];

  return rows.slice(1).map((row) => mapRow(row));
}
