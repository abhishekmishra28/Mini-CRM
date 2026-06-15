import { useState, useEffect } from 'react';
import { campaignsApi } from '../services/api/campaigns.api';
import type { Campaign } from '../types';

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = async () => {
    try {
      const data = await campaignsApi.getAll();
      setCampaigns(data.map((c: any) => ({ ...c, id: c._id })));
    } catch (error) {
      console.error("Failed to fetch campaigns", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    const interval = setInterval(fetchCampaigns, 5000);
    return () => clearInterval(interval);
  }, []);

  const createCampaign = async (data: Omit<Campaign, 'id' | 'created_at' | 'status' | 'total_sent' | 'delivered' | 'failed' | 'opened' | 'clicked'>) => {
    const newCampaign = await campaignsApi.create(data);
    setCampaigns(prev => [ { ...newCampaign, id: newCampaign._id }, ...prev]);
    return newCampaign;
  };

  const sendCampaign = async (id: string) => {
    const updatedCampaign = await campaignsApi.send(id);
    setCampaigns(prev => prev.map(c => c.id === id ? { ...updatedCampaign, id: updatedCampaign._id } : c));
  };

  const deleteCampaign = async (id: string) => {
    await campaignsApi.delete(id);
    setCampaigns(prev => prev.filter(c => c.id !== id));
  };

  return { campaigns, loading, createCampaign, sendCampaign, deleteCampaign, refreshCampaigns: fetchCampaigns };
}

export function useCampaignCommunications(campaignId: string | undefined) {
  const [communications, setCommunications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!campaignId) return;
    let mounted = true;
    const fetchCommunications = async () => {
      try {
        const data = await campaignsApi.getCommunications(campaignId);
        if (mounted) setCommunications(data.map((c: any) => ({ ...c, id: c._id })));
      } catch (error) {
        console.error("Failed to fetch communications", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchCommunications();
    const interval = setInterval(fetchCommunications, 5000);
    return () => { mounted = false; clearInterval(interval); };
  }, [campaignId]);

  return { communications, loading };
}
