import { useState, useMemo } from 'react';
import { Search, Users, ShoppingBag, MapPin, Tag, TrendingUp } from 'lucide-react';
import { useCustomers, useCustomerOrders } from '../hooks/useCustomers';
import type { Customer } from '../types';

function CustomerModal({ customer, onClose }: { customer: Customer; onClose: () => void }) {
  const { orders, loading } = useCustomerOrders(customer.id);
  const completedOrders = orders.filter((o) => o.status === 'completed');
  const totalSpent = completedOrders.reduce((s, o) => s + o.amount, 0);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-violet-600/30 flex items-center justify-center">
                <span className="text-violet-300 font-bold text-sm">
                  {customer.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-white font-semibold">{customer.name}</h2>
                <p className="text-gray-400 text-xs">{customer.email}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">✕</button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-white">₹{totalSpent.toLocaleString()}</p>
              <p className="text-xs text-gray-400">Total Spent</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-white">{orders.length}</p>
              <p className="text-xs text-gray-400">Orders</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-white">{customer.city}</p>
              <p className="text-xs text-gray-400">City</p>
            </div>
          </div>

          {/* Tags */}
          {customer.tags.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {customer.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 bg-violet-600/20 text-violet-300 text-xs rounded-full border border-violet-600/30">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recent Orders */}
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Recent Orders</p>
            {loading ? (
              <p className="text-gray-500 text-sm">Loading orders...</p>
            ) : orders.length === 0 ? (
              <p className="text-gray-500 text-sm">No orders found</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {orders.slice(0, 8).map((order) => (
                  <div key={order.id} className="flex items-center justify-between bg-gray-800/40 rounded-lg p-2.5">
                    <div>
                      <p className="text-xs text-gray-200">
                        {order.items.map((i) => i.name).join(', ')}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {order.channel} · {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">₹{order.amount.toLocaleString()}</p>
                      <span className={`text-xs ${order.status === 'completed' ? 'text-emerald-400' : order.status === 'returned' ? 'text-amber-400' : 'text-red-400'}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Customers() {
  const { customers, loading } = useCustomers();
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [selected, setSelected] = useState<Customer | null>(null);

  const cities = useMemo(() => {
    const set = new Set(customers.map((c) => c.city));
    return Array.from(set).sort();
  }, [customers]);

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch =
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search);
      const matchesCity = !cityFilter || c.city === cityFilter;
      return matchesSearch && matchesCity;
    });
  }, [customers, search, cityFilter]);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Shoppers</h1>
          <p className="text-gray-400 text-sm mt-1">{loading ? 'Loading...' : `${customers.length} customers in your database`}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
          />
        </div>
        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-violet-500"
        >
          <option value="">All Cities</option>
          {cities.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-4 py-3 text-left text-xs text-gray-400 uppercase tracking-wide font-medium">Customer</th>
                <th className="px-4 py-3 text-left text-xs text-gray-400 uppercase tracking-wide font-medium">
                  <div className="flex items-center gap-1"><MapPin size={12} />City</div>
                </th>
                <th className="px-4 py-3 text-left text-xs text-gray-400 uppercase tracking-wide font-medium">
                  <div className="flex items-center gap-1"><TrendingUp size={12} />Spent</div>
                </th>
                <th className="px-4 py-3 text-left text-xs text-gray-400 uppercase tracking-wide font-medium">
                  <div className="flex items-center gap-1"><ShoppingBag size={12} />Orders</div>
                </th>
                <th className="px-4 py-3 text-left text-xs text-gray-400 uppercase tracking-wide font-medium">
                  <div className="flex items-center gap-1"><Tag size={12} />Tags</div>
                </th>
                <th className="px-4 py-3 text-left text-xs text-gray-400 uppercase tracking-wide font-medium">Last Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filtered.slice(0, 100).map((customer) => (
                <tr
                  key={customer.id}
                  onClick={() => setSelected(customer)}
                  className="hover:bg-gray-800/40 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-violet-600/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-violet-300 text-xs font-bold">
                          {customer.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">{customer.name}</p>
                        <p className="text-xs text-gray-500">{customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">{customer.city}</td>
                  <td className="px-4 py-3 text-sm font-medium text-emerald-400">
                    ₹{customer.total_spent.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">{customer.order_count}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {customer.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="px-1.5 py-0.5 bg-gray-800 text-gray-400 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                      {customer.tags.length > 2 && (
                        <span className="text-xs text-gray-600">+{customer.tags.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {customer.last_order_date
                      ? new Date(customer.last_order_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Users size={32} className="text-gray-700 mx-auto mb-2" />
            <p className="text-gray-500">No customers match your filters</p>
          </div>
        )}
        <div className="px-4 py-2.5 border-t border-gray-800 text-xs text-gray-500">
          Showing {Math.min(filtered.length, 100)} of {filtered.length} customers
        </div>
      </div>

      {selected && <CustomerModal customer={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
