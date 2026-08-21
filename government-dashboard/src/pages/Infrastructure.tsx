import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AlertTriangle, Server, Wrench } from 'lucide-react';

export default function Infrastructure() {
  const [infrastructure, setInfrastructure] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      api.getInfrastructure(),
      api.getProjects()
    ]).then(([infra, proj]) => {
      setInfrastructure(infra);
      setProjects(proj);
    });
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100/50 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#34A853]/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#4285F4]/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/3"></div>
        
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 flex items-center gap-3">
            Infrastructure & Investments
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Monitor asset conditions, capacity constraints, and planned project overlap.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Existing Infrastructure Assets */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center">
            <Server className="w-5 h-5 mr-2" /> Asset Condition
          </h2>
          {infrastructure.map(infra => (
            <Card key={infra.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold">{infra.type}</h3>
                    <p className="text-xs text-muted-foreground">ID: {infra.id}</p>
                  </div>
                  <Badge variant={infra.condition === 'Poor' ? 'destructive' : 'success'}>
                    {infra.condition}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Capacity Load</span>
                    <span>{infra.capacityGauge}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${infra.capacityGauge > 80 ? 'bg-destructive' : 'bg-primary'}`} 
                      style={{ width: `${infra.capacityGauge}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Planned Projects & Investments */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center">
            <Wrench className="w-5 h-5 mr-2" /> Planned Investments
          </h2>
          {projects.map(proj => (
            <Card key={proj.id} className="relative overflow-hidden">
              {proj.overlapWarning && (
                <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-2 flex items-center text-yellow-700 dark:text-yellow-500 text-xs font-medium">
                  <AlertTriangle className="w-4 h-4 mr-2" /> Overlap Warning: Coordinates conflict with proposed Hotspot Recommendation
                </div>
              )}
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{proj.name}</h3>
                  <Badge variant="outline">Budget: ${proj.budget.toLocaleString()}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-4">Status: In Planning</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
