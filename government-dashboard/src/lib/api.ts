// API Client for CivicPulse BRICS

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

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
    console.warn("API unavailable, falling back to mock data for:", endpoint);
    return handleMockRequest(endpoint, options);
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

// Memory store for mock data so UI reflects updates during demo
let mockRecommendations: Recommendation[] = [
  {
    id: 'REC-1',
    hotspotId: 'HS-1',
    priorityScore: 92,
    title: 'Emergency Water Truck Dispatch',
    description: 'Dispatch 5 water trucks to Sector 4 to alleviate acute shortage.',
    status: 'pending',
    scores: {
      demandIntensity: 25,
      infrastructureGap: 20,
      vulnerability: 15,
      affectedPopulation: 10,
      urgencyRisk: 10,
      trendAcceleration: 7,
      feasibility: 3,
      equityAdjustment: 2
    }
  }
];

// Fallback data if backend is offline
function handleMockRequest(endpoint: string, options: RequestInit) {
  if (endpoint.includes('/decision') && options.method === 'POST' && options.body) {
    const body = JSON.parse(options.body as string);
    const recId = endpoint.split('/')[2];
    mockRecommendations = mockRecommendations.map(r => 
      r.id === recId ? { ...r, status: body.decision } : r
    );
    return { success: true };
  }

  if (endpoint.includes('/hotspots')) {
    return [
      { id: 'HS-1', h3Index: '8a2a1072b59ffff', severity: 'high', requestCount: 452, populationDensity: 12000, lat: 40.748, lon: -73.985 },
      { id: 'HS-2', h3Index: '8a2a1072b59fffe', severity: 'medium', requestCount: 120, populationDensity: 5000, lat: 40.758, lon: -73.995 }
    ];
  }
  if (endpoint.includes('/recommendations')) {
    return mockRecommendations;
  }
  if (endpoint.includes('/impact')) {
    return { estimatedPopulationReached: 45000 };
  }
  if (endpoint.includes('/evidence')) {
    return [
      { id: 'EV-1', recommendationId: 'REC-1', type: 'citizen_report', description: '450 calls about water outage', confidence: 0.95 }
    ];
  }
  if (endpoint.includes('/requests')) {
    return [
      { id: 'REQ-1', title: 'Pothole', status: 'open' },
      { id: 'REQ-2', title: 'Water issue', status: 'open' }
    ];
  }
  return [];
}

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
