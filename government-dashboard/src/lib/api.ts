// Mock API Client for CivicPulse BRICS

export type Hotspot = {
  id: string;
  h3Index: string;
  severity: 'high' | 'medium' | 'low';
  requestCount: number;
  populationDensity: number;
  coordinates: [number, number];
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

const MOCK_H3_INDICES = ['8a2a1072b59ffff', '8a2a1072b58ffff', '8a2a1072b5affff', '8a2a1072b5bffff'];

// Synthetic Data Stores (in-memory)
let recommendations: Recommendation[] = [
  {
    id: 'REC-001',
    hotspotId: 'HS-1',
    priorityScore: 88,
    title: 'Emergency Water Supply Intervention',
    description: 'High volume of citizen requests indicating severe water shortage in Sector 4.',
    status: 'pending',
    scores: {
      demandIntensity: 22,
      infrastructureGap: 18,
      vulnerability: 14,
      affectedPopulation: 8,
      urgencyRisk: 9,
      trendAcceleration: 9,
      feasibility: 4,
      equityAdjustment: 4,
    }
  },
  {
    id: 'REC-002',
    hotspotId: 'HS-2',
    priorityScore: 75,
    title: 'Road Surface Repair',
    description: 'Multiple reports of deep potholes causing traffic disruption and vehicle damage.',
    status: 'pending',
    scores: {
      demandIntensity: 18,
      infrastructureGap: 15,
      vulnerability: 10,
      affectedPopulation: 8,
      urgencyRisk: 7,
      trendAcceleration: 8,
      feasibility: 5,
      equityAdjustment: 4,
    }
  }
];

let auditLogs: AuditLog[] = [
  {
    id: 'AUD-001',
    objectId: 'REC-001',
    action: 'SYSTEM_GENERATED',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    user: 'SYSTEM',
    details: 'Recommendation generated based on 452 citizen requests.'
  }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  getHotspots: async (): Promise<Hotspot[]> => {
    await delay(300);
    return [
      { id: 'HS-1', h3Index: MOCK_H3_INDICES[0], severity: 'high', requestCount: 452, populationDensity: 12000, coordinates: [-74.006, 40.7128] },
      { id: 'HS-2', h3Index: MOCK_H3_INDICES[1], severity: 'medium', requestCount: 128, populationDensity: 8500, coordinates: [-73.985, 40.748] },
      { id: 'HS-3', h3Index: MOCK_H3_INDICES[2], severity: 'low', requestCount: 45, populationDensity: 5000, coordinates: [-73.935, 40.730] },
    ];
  },

  getGeoUnit: async (id: string) => {
    await delay(200);
    return { id, name: `Sector ${id.split('-')[1]}`, areaSqKm: 12.5 };
  },

  getIndicators: async () => {
    await delay(200);
    return { overallHealth: 78, citizenSatisfaction: 65, activeAlerts: 12 };
  },

  getInfrastructure: async () => {
    await delay(400);
    return [
      { id: 'INF-1', type: 'Water Treatment', condition: 'Poor', capacityGauge: 45 },
      { id: 'INF-2', type: 'Power Grid', condition: 'Good', capacityGauge: 85 },
    ];
  },

  getProjects: async () => {
    await delay(300);
    return [
      { id: 'PRJ-1', name: 'Sector 4 Water Pipe Upgrade', budget: 1500000, overlapWarning: true },
    ];
  },

  getRecommendations: async (): Promise<Recommendation[]> => {
    await delay(500);
    return [...recommendations];
  },

  getEvidence: async (id: string): Promise<Evidence[]> => {
    await delay(300);
    return [
      { id: 'EV-1', recommendationId: id, type: 'citizen_report', description: '452 unique reports of no water in 48h', confidence: 0.95 },
      { id: 'EV-2', recommendationId: id, type: 'infrastructure_sensor', description: 'Pressure drop detected at Pump Station Alpha', confidence: 0.88 },
    ];
  },

  decideRecommendation: async (id: string, decision: 'accepted' | 'rejected' | 'edited', reason: string) => {
    await delay(600);
    const recIndex = recommendations.findIndex(r => r.id === id);
    if (recIndex !== -1) {
      recommendations[recIndex] = { ...recommendations[recIndex], status: decision };
      auditLogs.unshift({
        id: `AUD-${Date.now()}`,
        objectId: id,
        action: `DECISION_${decision.toUpperCase()}`,
        timestamp: new Date().toISOString(),
        user: 'Gov Reviewer',
        details: reason
      });
      return recommendations[recIndex];
    }
    throw new Error('Recommendation not found');
  },

  getImpact: async () => {
    await delay(300);
    return { estimatedPopulationReached: 45000, budgetEfficiency: 1.2 };
  },

  getDatasets: async () => {
    await delay(200);
    return [
      { id: 'DS-1', name: 'Citizen Reports Q3', source: 'CivicApp', records: 15000 },
      { id: 'DS-2', name: 'IoT Sensor Data', source: 'InfraNet', records: 2000000 },
    ];
  },

  getAudit: async (objectId: string): Promise<AuditLog[]> => {
    await delay(300);
    return auditLogs.filter(log => log.objectId === objectId);
  }
};
