const Customer = require("../models/Customer");
const Order = require("../models/Order");

const firstNames = [
  "Aarav","Priya","Rohan","Ananya","Vikram",
  "Sneha","Arjun","Kavya","Ishaan","Meera",
  "Aditya","Pooja","Rahul","Divya","Karan",
  "Nisha","Siddharth","Riya","Amit","Shreya",
  "Varun","Pallavi","Nikhil","Anjali",
  "Dev","Simran","Kabir","Tanvi",
  "Raj","Neha"
];

const lastNames = [
  "Sharma","Patel","Singh","Kumar","Mehta",
  "Gupta","Joshi","Reddy","Nair","Verma",
  "Malhotra","Agarwal","Iyer","Bose",
  "Chopra","Shah","Pillai","Das",
  "Saxena","Khanna"
];

const cities = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Chennai",
  "Hyderabad",
  "Pune",
  "Kolkata",
  "Ahmedabad",
  "Jaipur",
  "Surat"
];

const tagOptions = [
  "vip",
  "loyal",
  "at-risk",
  "new",
  "churned",
  "high-value",
  "discount-seeker",
  "seasonal",
  "brand-advocate"
];

const productCategories = [
  {
    category: "Tops",
    items: [
      "Cotton Tee",
      "Silk Blouse",
      "Polo Shirt",
      "Crop Top"
    ]
  },

  {
    category: "Bottoms",
    items: [
      "Slim Jeans",
      "Palazzo Pants",
      "Chinos",
      "Mini Skirt"
    ]
  },

  {
    category: "Dresses",
    items: [
      "Maxi Dress",
      "Wrap Dress",
      "Shirt Dress",
      "Evening Gown"
    ]
  },

  {
    category: "Outerwear",
    items: [
      "Blazer",
      "Trench Coat",
      "Denim Jacket",
      "Hoodie"
    ]
  },

  {
    category: "Accessories",
    items: [
      "Leather Belt",
      "Silk Scarf",
      "Tote Bag",
      "Sunglasses"
    ]
  },

  {
    category: "Footwear",
    items: [
      "Sneakers",
      "Heeled Sandals",
      "Chelsea Boots",
      "Loafers"
    ]
  }
];

function randomFrom(arr) {
  return arr[
    Math.floor(Math.random() * arr.length)
  ];
}

function randomInt(min, max) {
  return (
    Math.floor(
      Math.random() * (max - min + 1)
    ) + min
  );
}

function randomDate(daysAgo) {
  return new Date(
    Date.now() -
      randomInt(1, daysAgo) *
        86400000
  );
}

async function seedData() {

  const customerCount =
    await Customer.countDocuments();

  if (customerCount > 0) {

    console.log(
      "Seed data already exists"
    );

    return;
  }

  console.log(
    "Seeding database..."
  );

  const customers = [];

  for (let i = 0; i < 60; i++) {

    const first =
      randomFrom(firstNames);

    const last =
      randomFrom(lastNames);

    const orderCount =
      randomInt(1, 20);

    const customer =
      await Customer.create({

        name: `${first} ${last}`,

        email:
          `${first.toLowerCase()}.` +
          `${last.toLowerCase()}` +
          `${randomInt(1,99)}` +
          "@example.com",

        phone:
          `+91${randomInt(
            7000000000,
            9999999999
          )}`,

        city:
          randomFrom(cities),

        tags:
          [...tagOptions]
          .sort(
            () =>
            Math.random()-0.5
          )
          .slice(
            0,
            randomInt(0,3)
          ),

        total_spent:
          orderCount *
          randomInt(
            1000,
            8000
          ),

        order_count:
          orderCount,

        first_order_date:
          randomDate(700),

        last_order_date:
          randomDate(365)

      });

    customers.push(customer);
  }

  const orders = [];

  for (const customer of customers) {

    for (
      let i = 0;
      i < customer.order_count;
      i++
    ) {

      const category =
        randomFrom(
          productCategories
        );

      const itemCount =
        randomInt(1,4);

      const items =
        Array.from(
          { length: itemCount },
          () => ({
            name:
              randomFrom(
                category.items
              ),

            category:
              category.category,

            quantity:
              randomInt(1,3),

            price:
              randomInt(
                299,
                4999
              )
          })
        );

      const amount =
        items.reduce(
          (sum,item)=>
            sum +
            item.price *
            item.quantity,
          0
        );

      orders.push({

        customer_id:
          customer._id,

        amount,

        items,

        channel:
          randomFrom([
            "online",
            "in-store",
            "app"
          ]),

        status:
          randomFrom([
            "completed",
            "completed",
            "completed",
            "returned",
            "cancelled"
          ])
      });
    }
  }

  await Order.insertMany(
    orders
  );

  console.log(
    "Database seeded"
  );
}

module.exports = seedData;