import type { Customer, Order } from '../types';

const firstNames = [
  'Aarav', 'Priya', 'Rohan', 'Ananya', 'Vikram', 'Sneha', 'Arjun', 'Kavya',
  'Ishaan', 'Meera', 'Aditya', 'Pooja', 'Rahul', 'Divya', 'Karan', 'Nisha',
  'Siddharth', 'Riya', 'Amit', 'Shreya', 'Varun', 'Pallavi', 'Nikhil', 'Anjali',
  'Dev', 'Simran', 'Kabir', 'Tanvi', 'Raj', 'Neha',
];

const lastNames = [
  'Sharma', 'Patel', 'Singh', 'Kumar', 'Mehta', 'Gupta', 'Joshi', 'Reddy',
  'Nair', 'Verma', 'Malhotra', 'Agarwal', 'Iyer', 'Bose', 'Chopra', 'Shah',
  'Pillai', 'Das', 'Saxena', 'Khanna',
];

const cities = [
  'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata',
  'Ahmedabad', 'Jaipur', 'Surat',
];

const tagOptions = [
  'vip', 'loyal', 'at-risk', 'new', 'churned', 'high-value', 'discount-seeker',
  'seasonal', 'brand-advocate',
];

const productCategories = [
  { category: 'Tops', items: ['Cotton Tee', 'Silk Blouse', 'Polo Shirt', 'Crop Top'] },
  { category: 'Bottoms', items: ['Slim Jeans', 'Palazzo Pants', 'Chinos', 'Mini Skirt'] },
  { category: 'Dresses', items: ['Maxi Dress', 'Wrap Dress', 'Shirt Dress', 'Evening Gown'] },
  { category: 'Outerwear', items: ['Blazer', 'Trench Coat', 'Denim Jacket', 'Hoodie'] },
  { category: 'Accessories', items: ['Leather Belt', 'Silk Scarf', 'Tote Bag', 'Sunglasses'] },
  { category: 'Footwear', items: ['Sneakers', 'Heeled Sandals', 'Chelsea Boots', 'Loafers'] },
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(daysAgo: number, daysAgoMin = 0): string {
  const now = Date.now();
  const ms =
    now - randomInt(daysAgoMin * 86400000, daysAgo * 86400000);
  return new Date(ms).toISOString();
}

function uuid(): string {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function generateMockCustomers(count = 50): Customer[] {
  const customers: Customer[] = [];

  for (let i = 0; i < count; i++) {
    const firstName = randomFrom(firstNames);
    const lastName = randomFrom(lastNames);
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomInt(1, 99)}@example.com`;
    const phone = `+91${randomInt(7000000000, 9999999999)}`;
    const city = randomFrom(cities);

    // Assign tags
    const numTags = randomInt(0, 3);
    const shuffled = [...tagOptions].sort(() => Math.random() - 0.5);
    const tags = shuffled.slice(0, numTags);

    // Order stats
    const orderCount = randomInt(1, 20);
    const lastOrderDaysAgo = randomInt(1, 365);
    const firstOrderDaysAgo = lastOrderDaysAgo + randomInt(30, 500);
    const totalSpent = Math.round(orderCount * randomInt(500, 8000));

    customers.push({
      id: uuid(),
      name,
      email,
      phone,
      city,
      tags,
      total_spent: totalSpent,
      order_count: orderCount,
      last_order_date: randomDate(lastOrderDaysAgo, lastOrderDaysAgo),
      first_order_date: randomDate(firstOrderDaysAgo, firstOrderDaysAgo),
      created_at: randomDate(firstOrderDaysAgo + 10, firstOrderDaysAgo + 10),
    });
  }

  return customers;
}

export function generateMockOrders(customers: Customer[]): Order[] {
  const orders: Order[] = [];

  for (const customer of customers) {
    const count = customer.order_count;
    for (let i = 0; i < count; i++) {
      const cat = randomFrom(productCategories);
      const itemCount = randomInt(1, 4);
      const items = Array.from({ length: itemCount }, () => ({
        name: randomFrom(cat.items),
        category: cat.category,
        quantity: randomInt(1, 3),
        price: randomInt(299, 4999),
      }));

      const amount = items.reduce((s, it) => s + it.price * it.quantity, 0);

      orders.push({
        id: uuid(),
        customer_id: customer.id,
        customer_name: customer.name,
        amount,
        items,
        channel: randomFrom(['online', 'in-store', 'app'] as const),
        status: randomFrom(['completed', 'completed', 'completed', 'returned', 'cancelled'] as const),
        created_at: randomDate(365, 1),
      });
    }
  }

  return orders;
}
