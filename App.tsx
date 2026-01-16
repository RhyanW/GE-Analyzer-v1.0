import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import GEFlipperPage from './pages/GEFlipperPage';
import SkillAnalyzerPage from './pages/SkillAnalyzerPage';

import HighAlchemyPage from './pages/HighAlchemyPage';


const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/flipper" element={<GEFlipperPage />} />
          <Route path="/skills" element={<SkillAnalyzerPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;