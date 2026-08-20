// API Client for CivicPulse BRICS

const BASE_URL = import.meta.env.VITE_API_URL || "/api/v1";

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token"); 
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
}

export type Hotspot = {
  id: string;
  h3Index: string;
  severity: 'high' | 'medium' | 'low';
  requestCount: number;
  populationDensity: number;
  lat: number;
  lon: number;
};

export type Recommendation = {
  id: string;
  hotspotId: string;
  priorityScore: number;
  title: string;
  description: string;
  status: 'pending' | 'accepted' | 'rejected' | 'edited';
  scores: {
    demandIntensity: number;
    infrastructureGap: number;
    vulnerability: number;
    affectedPopulation: number;
    urgencyRisk: number;
    trendAcceleration: number;
    feasibility: number;
    equityAdjustment: number;
  };
};

export type Evidence = {
  id: string;
  recommendationId: string;
  type: 'citizen_report' | 'infrastructure_sensor' | 'demographic_data';
  description: string;
  confidence: number;
};

export type AuditLog = {
  id: string;
  objectId: string;
  action: string;
  timestamp: string;
  user: string;
  details: string;
};

export const api = {
  getHotspots: async (): Promise<Hotspot[]> => fetchWithAuth('/hotspots'),
  getRequests: async () => fetchWithAuth('/requests'),
  getGeoUnit: async (id: string) => fetchWithAuth(`/geo/units/${id}`),
  getIndicators: async () => fetchWithAuth('/indicators'),
  getInfrastructure: async () => fetchWithAuth('/infrastructure'),
  getProjects: async () => fetchWithAuth('/projects'),
  getRecommendations: async (): Promise<Recommendation[]> => fetchWithAuth('/recommendations'),
  getEvidence: async (id: string): Promise<Evidence[]> => fetchWithAuth(`/recommendations/${id}/evidence`),
  decideRecommendation: async (id: string, decision: 'accepted' | 'rejected' | 'edited', reason: string) => fetchWithAuth(`/recommendations/${id}/decision`, { method: 'POST', body: JSON.stringify({ decision, reason }) }),
  getImpact: async () => fetchWithAuth('/impact'),
  getDatasets: async () => fetchWithAuth('/datasets'),
  getAudit: async (objectId: string): Promise<AuditLog[]> => fetchWithAuth(`/audit/${objectId}`)
};
