import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import GEFlipperPage from './pages/GEFlipperPage';

import HighAlchemyPage from './pages/HighAlchemyPage';
import QuestPlannerPage from './pages/QuestPlannerPage';

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/flipper" element={<GEFlipperPage />} />
          <Route path="/alchemy" element={<HighAlchemyPage />} />
          <Route path="/quests" element={<QuestPlannerPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;