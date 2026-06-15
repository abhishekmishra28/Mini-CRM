import { useState, useEffect } from 'react';
import { customersApi } from '../services/api/customers.api';
import type { Customer, Order } from '../types';

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchCustomers = async () => {
      try {
        const data = await customersApi.getAll();
        if (mounted) {
          // Map backend _id to frontend id
          const mappedData = data.map((c: any) => ({ ...c, id: c._id }));
          setCustomers(mappedData);
        }
      } catch (error) {
        console.error("Failed to fetch customers", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchCustomers();
    return () => { mounted = false; };
  }, []);

  return { customers, loading };
}

export function useCustomerOrders(customerId: string | null) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchOrders = async () => {
      if (!customerId) {
        setOrders([]);
        return;
      }
      setLoading(true);
      try {
        const data = await customersApi.getOrders(customerId);
        if (mounted) {
           // Map backend _id to frontend id if necessary
          setOrders(data.map((o: any) => ({ ...o, id: o._id })));
        }
      } catch (error) {
        console.error("Failed to fetch customer orders", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchOrders();
    return () => { mounted = false; };
  }, [customerId]);

  return { orders, loading };
}
