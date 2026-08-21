import React, { useEffect, useState, useMemo } from 'react';
import Map, { Source, Layer, NavigationControl, GeolocateControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Layers, MapPin, Globe } from 'lucide-react';

// The legend ranges based on the user's uploaded image
const LEGEND_RANGES = [
  { color: '#fcfb26', label: '-1.65 - -1.34', min: -1.65, max: -1.34 },
  { color: '#f2da24', label: '-1.33 - -1.02', min: -1.33, max: -1.02 },
  { color: '#f5b525', label: '-1.01 - -0.70', min: -1.01, max: -0.70 },
  { color: '#f59223', label: '-0.69 - -0.39', min: -0.69, max: -0.39 },
  { color: '#f17122', label: '-0.38 - -0.07', min: -0.38, max: -0.07 },
  { color: '#ed5824', label: '-0.06 - +0.25', min: -0.06, max: 0.25 },
  { color: '#ef3b24', label: '+0.26 - +0.57', min: 0.26, max: 0.57 },
  { color: '#ed2024', label: '+0.58 - +0.88', min: 0.58, max: 0.88 },
  { color: '#db1e25', label: '+0.89 - +1.20', min: 0.89, max: 1.20 },
  { color: '#c41926', label: '+1.21 - +1.52', min: 1.21, max: 1.52 }
];

export default function HotspotMap() {
  const [geoData, setGeoData] = useState<any>(null);
  const [selectedCountry, setSelectedCountry] = useState<any | null>(null);

  // Layer toggles
  const [showDensity, setShowDensity] = useState(true);

  useEffect(() => {
    // Fetch world countries GeoJSON
    fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson')
      .then(res => res.json())
      .then(data => {
        // Inject random mock scores into each country to create the choropleth effect
        const enrichedFeatures = data.features.map((f: any) => {
          // Generate a random score between -1.65 and 1.52
          const score = (Math.random() * (1.52 - (-1.65))) + (-1.65);
          return {
            ...f,
            properties: {
              ...f.properties,
              hotspotScore: parseFloat(score.toFixed(2)),
              requestCount: Math.floor(Math.random() * 5000),
            }
          };
        });
        setGeoData({ ...data, features: enrichedFeatures });
      })
      .catch(console.error);
  }, []);

  if (!geoData) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted/20 animate-pulse">
        <div className="text-muted-foreground flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-4 border-muted-foreground/20 border-t-primary animate-spin mb-4"></div>
          <p className="font-medium text-lg">Loading Global Boundary Data...</p>
        </div>
      </div>
    );
  }

  // Construct the mapbox style expression for the choropleth fill color
  const fillColorExpression = ['step', ['get', 'hotspotScore']];
  
  // Start with the lowest color
  fillColorExpression.push(LEGEND_RANGES[0].color);
  
  // Add steps for each range
  for (let i = 1; i < LEGEND_RANGES.length; i++) {
    fillColorExpression.push(LEGEND_RANGES[i].min);
    fillColorExpression.push(LEGEND_RANGES[i].color);
  }

  return (
    <div className="flex h-full w-full relative">
      {/* MapLibre Area */}
      <div className="flex-1 h-full w-full relative bg-[#eef1f4]">
        <Map
          initialViewState={{
            longitude: 20,
            latitude: 10,
            zoom: 1.5
          }}
          mapStyle="https://basemaps.cartocdn.com/gl/light-nolabels-gl-style/style.json"
          interactiveLayerIds={['country-fills']}
          onClick={(e) => {
            if (e.features && e.features.length > 0) {
              setSelectedCountry(e.features[0].properties);
            } else {
              setSelectedCountry(null);
            }
          }}
          cursor={selectedCountry ? 'pointer' : 'default'}
        >
          <NavigationControl position="top-left" />
          <GeolocateControl position="top-left" />
          
          <Source id="countries" type="geojson" data={geoData}>
            {/* Outline layer for countries */}
            <Layer
              id="country-borders"
              type="line"
              paint={{
                'line-color': '#a1a1aa',
                'line-width': 0.5
              }}
            />
            {/* Fill layer for choropleth */}
            <Layer
              id="country-fills"
              type="fill"
              paint={{
                'fill-color': fillColorExpression as any,
                'fill-opacity': 0.85
              }}
            />
          </Source>
        </Map>
        
        {/* Layer Toggles Panel */}
        <div className="absolute top-4 right-4 z-10 w-64 bg-white/95 backdrop-blur shadow-lg p-4 rounded-xl border border-border/50">
          <div className="flex items-center space-x-2 mb-4">
            <Layers className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-sm">Map Layers</h3>
          </div>
          <div className="space-y-3">
            <label className="flex items-center space-x-2 text-sm cursor-pointer">
              <input type="checkbox" checked={showDensity} onChange={(e) => setShowDensity(e.target.checked)} className="rounded border-gray-300 text-primary focus:ring-primary" />
              <span>Choropleth Heatmap</span>
            </label>
          </div>
        </div>

        {/* Legend Panel */}
        <div className="absolute bottom-6 right-6 z-10 bg-white/90 backdrop-blur shadow-lg p-4 rounded-xl border border-border/50 text-sm">
          <div className="space-y-1.5">
            {LEGEND_RANGES.map((range, idx) => (
              <div key={idx} className="flex items-center space-x-3">
                <div 
                  className="w-5 h-3 shadow-sm border border-black/10" 
                  style={{ backgroundColor: range.color }}
                />
                <span className="text-xs font-medium text-muted-foreground">{range.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-border/50 text-[10px] text-muted-foreground text-right">
            Esri, FAO, NOAA, USGS
          </div>
        </div>
      </div>

      {/* Details Side Panel */}
      <div className="w-96 h-full bg-white border-l border-border/50 overflow-y-auto z-10 flex flex-col shadow-[-4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-6 border-b border-border/50 bg-muted/20">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center">
            <Globe className="w-5 h-5 mr-2 text-primary" />
            Regional Inspector
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Select a region on the global choropleth map to view deep-dive analytics.</p>
        </div>
        
        <div className="p-6 flex-1 bg-muted/5">
          {selectedCountry ? (
            <Card className="bg-white shadow-sm border-border/50">
              <CardHeader className="pb-3 border-b border-border/30">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-bold">{selectedCountry.ADMIN}</CardTitle>
                  <Badge variant={selectedCountry.hotspotScore > 0.5 ? 'destructive' : selectedCountry.hotspotScore > -0.5 ? 'warning' : 'default'}>
                    {selectedCountry.hotspotScore.toFixed(2)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-5 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">ISO Code</p>
                    <p className="text-base font-medium">{selectedCountry.ISO_A3}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reports</p>
                    <p className="text-base font-medium">{selectedCountry.requestCount.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Severity Score</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full"
                          style={{ 
                            width: ${((selectedCountry.hotspotScore + 1.65) / 3.17) * 100}%,
                            backgroundColor: LEGEND_RANGES.find(r => selectedCountry.hotspotScore >= r.min && selectedCountry.hotspotScore <= r.max)?.color || '#ef4444'
                          }}
                        />
                      </div>
                      <span className="text-sm font-bold">{selectedCountry.hotspotScore}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground bg-white border-2 border-dashed border-border/60 rounded-2xl">
              <MapPin className="w-8 h-8 mb-3 text-muted-foreground/50" />
              <p className="font-medium text-foreground">No region selected.</p>
              <p className="text-sm mt-1 max-w-[200px]">Click a colored country on the map to inspect its data.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
