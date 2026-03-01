const API_BASE = "http://localhost:8000";

// ==============================
// TYPES MATCHING YOUR BACKEND
// ==============================

export interface RankingCity {
  city: string;
  cesi: number;
  risk_level: string;
  instability_probability: number;
  instability_momentum: number;
}

export interface InvestmentCity {
  city: string;
  investment_priority_score: number;
}

export interface ForecastData {
  city: string;
  current_aqi_mean: number;
  projected_aqi_3_years: number;
  projected_cesi: number;
  forecast_risk_level: string;
}

export interface InfrastructureRisk {
  city: string;
  high_risk_sectors: string[];
}

export interface ModelImportance {
  feature: string;
  importance: number;
}

// ==============================
// GENERIC FETCH
// ==============================

class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "APIError";
  }
}

async function fetchAPI<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`);

  if (!response.ok) {
    throw new APIError(response.status, `API error: ${response.statusText}`);
  }

  return response.json();
}

// ==============================
// ENDPOINT FUNCTIONS
// ==============================

export async function getCitiesRanking(): Promise<RankingCity[]> {
  return fetchAPI<RankingCity[]>("/ranking");
}

export async function getInvestmentPriority(): Promise<InvestmentCity[]> {
  return fetchAPI<InvestmentCity[]>("/investment-priority");
}

export async function getForecast(city: string): Promise<ForecastData> {
  return fetchAPI<ForecastData>(
    `/forecast/${encodeURIComponent(city)}`
  );
}

export async function getInfrastructureRisk(
  city: string
): Promise<InfrastructureRisk> {
  return fetchAPI<InfrastructureRisk>(
    `/infrastructure-risk/${encodeURIComponent(city)}`
  );
}

export async function getModelImportance(): Promise<ModelImportance[]> {
  return fetchAPI<ModelImportance[]>("/model-importance");
}