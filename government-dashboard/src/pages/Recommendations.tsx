import React, { useEffect, useState } from 'react';
import { api, type Recommendation, type Evidence } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [decisionReason, setDecisionReason] = useState('');

  const [error, setError] = useState<string | null>(null);

  const fetchRecs = () => {
    api.getRecommendations()
      .then(data => {
        const validData = Array.isArray(data) ? data : (data as any).items || [];
        setRecommendations(validData);
        if (validData.length > 0) handleSelectRec(validData[0]);
        setError(null);
      })
      .catch(err => {
        console.error(err);
        setError("Failed to fetch recommendations. Backend API is unreachable.");
        setRecommendations([]);
      });
  };

  useEffect(() => {
    fetchRecs();
  }, []);

  const handleSelectRec = (rec: Recommendation) => {
    setSelectedRec(rec);
    api.getEvidence(rec.id)
      .then(setEvidence)
      .catch(err => {
        console.error("Failed to load evidence", err);
        setEvidence([]);
      });
  };

  const handleDecision = async (decision: 'accepted' | 'rejected' | 'edited') => {
    if (!selectedRec) return;
    if (!decisionReason && decision !== 'edited') {
      alert("Please provide a reason for this decision.");
      return;
    }
    await api.decideRecommendation(selectedRec.id, decision, decisionReason || 'Edited recommendation terms.');
    setDecisionReason('');
    const updated = await api.getRecommendations();
    setRecommendations(updated);
    const newSelected = updated.find(r => r.id === selectedRec.id);
    if (newSelected) setSelectedRec(newSelected);
  };

  if (!recommendations) {
    return (
      <div className="flex h-full w-full animate-pulse">
        <div className="w-1/3 border-r border-border bg-muted/20 p-6 space-y-4">
          <div className="h-6 bg-muted-foreground/20 rounded w-1/2 mb-8"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-muted-foreground/10 rounded-lg w-full"></div>
          ))}
        </div>
        <div className="flex-1 bg-background p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="h-10 bg-muted-foreground/20 rounded w-2/3"></div>
            <div className="h-4 bg-muted-foreground/10 rounded w-full"></div>
            <div className="h-4 bg-muted-foreground/10 rounded w-4/5"></div>
            <div className="grid grid-cols-2 gap-6 mt-8">
              <div className="h-64 bg-muted-foreground/10 rounded-xl"></div>
              <div className="h-64 bg-muted-foreground/10 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full bg-[#f8f9fa]">
      {/* Left List */}
      <div className="w-1/3 border-r border-gray-200 bg-white overflow-y-auto">
        <div className="p-6 border-b border-gray-100 bg-white sticky top-0 z-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#FBBC04]/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 relative z-10">Priority Engine</h2>
          <p className="text-sm text-gray-500 font-medium relative z-10">AI-generated intervention proposals</p>
        </div>
        <div className="p-4 space-y-3">
          {recommendations.map(rec => (
            <div 
              key={rec.id} 
              onClick={() => handleSelectRec(rec)}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${selectedRec?.id === rec.id ? 'bg-[#4285F4]/5 border-[#4285F4] shadow-sm' : 'bg-white hover:bg-gray-50 border-gray-100 hover:border-gray-200'}`}
            >
              <div className="flex justify-between items-start mb-3">
                <span className="font-bold text-sm text-gray-800">{rec.id}</span>
                <Badge variant={rec.priorityScore >= 80 ? 'destructive' : 'warning'} className="shadow-sm">Score: {rec.priorityScore}</Badge>
              </div>
              <h3 className="text-sm font-medium leading-tight mb-2">{rec.title}</h3>
              <div className="flex items-center text-xs text-muted-foreground">
                Status: <span className="ml-1 capitalize font-medium">{rec.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Details */}
      <div className="flex-1 overflow-y-auto bg-background p-6">
        {selectedRec ? (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold mb-2">{selectedRec.title}</h1>
                <p className="text-muted-foreground">{selectedRec.description}</p>
              </div>
              <Badge className="text-lg px-4 py-1" variant={selectedRec.priorityScore >= 80 ? 'destructive' : 'warning'}>
                Score: {selectedRec.priorityScore}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Score Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Score Breakdown Visualizer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(selectedRec.scores).map(([key, value]) => (
                    <div key={key}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="font-medium">{value} pts</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div className="bg-primary h-1.5 rounded-full" style={{ width: `${(value / 25) * 100}%` }}></div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Explainability Console */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Explainability Console</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-blue-500/10 text-blue-700 dark:text-blue-400 p-3 rounded-md border border-blue-500/20 flex items-start text-sm">
                      <Info className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                      <p>Recommendation generated due to intersecting high citizen demand (452 reports) and existing poor infrastructure condition.</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Evidence Sources</h4>
                      <ul className="space-y-2">
                        {Array.isArray(evidence) ? evidence.map((e: any, i) => (
                          <li key={e.id || i} className="text-sm border-l-2 border-primary pl-3 py-1">
                            <span className="font-medium text-foreground">{(e.type || 'Source').replace('_', ' ')}:</span> {e.description || JSON.stringify(e)} 
                            {e.confidence && <span className="ml-2 text-xs text-green-600 font-medium">({(e.confidence * 100).toFixed(0)}% conf)</span>}
                          </li>
                        )) : (
                          <div className="space-y-2">
                            {Object.entries(evidence).map(([key, val], i) => (
                               <li key={i} className="text-sm border-l-2 border-primary pl-3 py-1">
                                 <span className="font-medium text-foreground capitalize">{key.replace(/_/g, ' ')}:</span>
                                 <pre className="mt-1 text-xs text-muted-foreground whitespace-pre-wrap">{typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val)}</pre>
                               </li>
                            ))}
                          </div>
                        )}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Human Review Interface */}
            {selectedRec.status === 'pending' && (
              <Card className="border-primary/50 bg-primary/5">
                <CardHeader>
                  <CardTitle>Human Review Action</CardTitle>
                </CardHeader>
                <CardContent>
                  <textarea 
                    className="w-full bg-background border border-input rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary mb-4 min-h-[100px]"
                    placeholder="Mandatory decision rationale..."
                    value={decisionReason}
                    onChange={e => setDecisionReason(e.target.value)}
                  />
                  <div className="flex space-x-3">
                    <Button onClick={() => handleDecision('accepted')} className="bg-green-600 hover:bg-green-700 text-white">
                      <CheckCircle className="w-4 h-4 mr-2" /> Accept
                    </Button>
                    <Button onClick={() => handleDecision('rejected')} variant="destructive">
                      <XCircle className="w-4 h-4 mr-2" /> Reject
                    </Button>
                    <Button onClick={() => handleDecision('edited')} variant="outline">
                      Edit Terms
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {selectedRec.status !== 'pending' && (
              <div className="p-4 bg-muted rounded-lg border border-border flex items-center justify-center">
                <p className="text-muted-foreground font-medium">Recommendation has been <span className="uppercase">{selectedRec.status}</span>.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Select a recommendation to view details.
          </div>
        )}
      </div>
    </div>
  );
}
