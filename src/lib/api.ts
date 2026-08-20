// API Client for CivicPulse BRICS

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token"); // Or however you store the JWT
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
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
    demandIntensity: number; // 25%
    infrastructureGap: number; // 20%
    vulnerability: number; // 15%
    affectedPopulation: number; // 10%
    urgencyRisk: number; // 10%
    trendAcceleration: number; // 10%
    feasibility: number; // 5%
    equityAdjustment: number; // 5%
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
  getHotspots: async (): Promise<Hotspot[]> => {
    return fetchWithAuth('/hotspots');
  },

  getGeoUnit: async (id: string) => {
    return fetchWithAuth(`/geo/units/${id}`);
  },

  getIndicators: async () => {
    return fetchWithAuth('/indicators');
  },

  getInfrastructure: async () => {
    return fetchWithAuth('/infrastructure');
  },

  getProjects: async () => {
    return fetchWithAuth('/projects');
  },

  getRecommendations: async (): Promise<Recommendation[]> => {
    return fetchWithAuth('/recommendations');
  },

  getEvidence: async (id: string): Promise<Evidence[]> => {
    return fetchWithAuth(`/recommendations/${id}/evidence`);
  },

  decideRecommendation: async (id: string, decision: 'accepted' | 'rejected' | 'edited', reason: string) => {
    return fetchWithAuth(`/recommendations/${id}/decision`, {
      method: 'POST',
      body: JSON.stringify({ decision, reason })
    });
  },

  getImpact: async () => {
    return fetchWithAuth('/impact');
  },

  getDatasets: async () => {
    return fetchWithAuth('/datasets');
  },

  getAudit: async (objectId: string): Promise<AuditLog[]> => {
    return fetchWithAuth(`/audit/${objectId}`);
  }
};
