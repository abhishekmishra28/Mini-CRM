import { useState, useEffect } from 'react';
import { analyticsApi } from '../services/api/analytics.api';

export function useDashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchAnalytics = async () => {
      try {
        const data = await analyticsApi.getDashboard();
        if (mounted) {
          setAnalytics(data);
        }
      } catch (error) {
        console.error("Failed to load dashboard analytics", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchAnalytics();
    
    // Poll every 5 seconds to simulate real-time updates for campaigns
    const interval = setInterval(fetchAnalytics, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return { analytics, loading };
}
