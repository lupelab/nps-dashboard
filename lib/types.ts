export type AgencyCode =
  | 'LUPE'
  | 'OMD'
  | 'ROGER'
  | 'PHD'
  | 'BRICK'
  | 'NASTA'
  | 'RAW'
  | 'BPR'
  | 'AMPLIFY'
  | 'TEXO';

export type Role = 'agency' | 'holding';

export type AppUser = {
  username: string;
  agency: AgencyCode;
  role: Role;
  passwordHash: string;
};

export type SurveyRow = {
  timestamp: string;
  periodoEvaluado: string;
  agenciaEvaluada: AgencyCode;
  correo: string;
  nombreApellido: string;
  organizacion: string;
  cargo: string;
  servicioContratado: string;
  q1DisfrutoTrabajar: string;
  q2Fiables: string;
  q3Colaborativo: string;
  q4CreoValor: string;
  q5BasadoEstrategia: string;
  q6MentalidadCreativa: string;
  aspectos: string[];
  npsRecomendacion: number;
  npsCategoriaRecomendacion: string;
  npsContinuidad: number;
  npsCategoriaContinuidad: string;
  motivoPuntuacion: string;
  comentariosAdicionales: string;
  reunionSolicitada: string;
};

export type SessionUser = {
  username: string;
  agency: AgencyCode;
  role: Role;
};

export type NpsBreakdown = {
  total: number;
  promoters: number;
  passives: number;
  detractors: number;
  promotersPct: number;
  passivesPct: number;
  detractorsPct: number;
  nps: number;
};

export type DriverMetric = {
  key: string;
  label: string;
  average: number;
  coverage: number;
  score: number;
  trend: number;
};

export type Opportunity = {
  key: string;
  label: string;
  priority: 'Alta' | 'Media' | 'Baja';
  score: number;
  average: number;
  trend: number;
  affectedAgencies: number;
  summary: string;
};

export type RecommendationPack = {
  executiveSummary: string;
  actionPlan: Array<{ horizon: '30 días' | '60 días' | '90 días'; actions: string[] }>;
  quickWins: string[];
  risks: string[];
  monitoring: string[];
};
