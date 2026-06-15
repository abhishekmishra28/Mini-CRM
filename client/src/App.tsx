import { useState } from 'react';
import { Layout, type Page } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';
import { Segments } from './pages/Segments';
import { Campaigns } from './pages/Campaigns';
import { Analytics } from './pages/Analytics';
import { AIAssistant } from './pages/AIAssistant';

export default function App() {
  const [page, setPage] = useState<Page>('dashboard');

  function renderPage() {
    switch (page) {
      case 'dashboard':
        return <Dashboard />;
      case 'customers':
        return <Customers />;
      case 'segments':
        return <Segments />;
      case 'campaigns':
        return <Campaigns />;
      case 'analytics':
        return <Analytics />;
      case 'ai-assistant':
        return <AIAssistant />;
      default:
        return <Dashboard />;
    }
  }

  return (
    <Layout currentPage={page} onNavigate={setPage}>
      {renderPage()}
    </Layout>
  );
}
