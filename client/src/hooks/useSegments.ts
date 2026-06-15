import { useState, useEffect } from 'react';
import { segmentsApi } from '../services/api/segments.api';
import type { Segment } from '../types';

export function useSegments() {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSegments = async () => {
    try {
      const data = await segmentsApi.getAll();
      setSegments(data.map((s: any) => ({ ...s, id: s._id })));
    } catch (error) {
      console.error("Failed to fetch segments", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSegments();
  }, []);

  const createSegment = async (data: Omit<Segment, 'id' | 'created_at' | 'customer_count'>) => {
    const newSegment = await segmentsApi.create(data);
    setSegments(prev => [...prev, { ...newSegment, id: newSegment._id }]);
    return newSegment;
  };

  const deleteSegment = async (id: string) => {
    await segmentsApi.delete(id);
    setSegments(prev => prev.filter(s => s.id !== id));
  };

  return { segments, loading, createSegment, deleteSegment, refreshSegments: fetchSegments };
}
