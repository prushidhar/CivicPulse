import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Shell from './components/layout/Shell';

import Dashboard from './pages/Dashboard';
import HotspotMap from './pages/HotspotMap';
import CitizenRequests from './pages/CitizenRequests';
import Recommendations from './pages/Recommendations';
import Infrastructure from './pages/Infrastructure';
import AuditConsole from './pages/AuditConsole';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Shell />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="map" element={<HotspotMap />} />
        <Route path="requests" element={<CitizenRequests />} />
        <Route path="recommendations" element={<Recommendations />} />
        <Route path="infrastructure" element={<Infrastructure />} />
        <Route path="audit" element={<AuditConsole />} />
      </Route>
    </Routes>
  );
}

export default App;
