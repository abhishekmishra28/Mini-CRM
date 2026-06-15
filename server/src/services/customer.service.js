const Customer = require("../models/Customer");
const Order = require("../models/Order");

async function getAllCustomers() {

  return Customer.find()
    .sort({
      created_at: -1
    });

}

async function getCustomerById(
  id
) {

  return Customer.findById(id);

}

async function createCustomer(
  data
) {

  return Customer.create(data);

}

async function updateCustomer(
  id,
  data
) {

  return Customer.findByIdAndUpdate(

    id,

    data,

    {
      new: true,

      runValidators: true
    }

  );

}

async function deleteCustomer(
  id
) {

  return Customer.findByIdAndDelete(
    id
  );

}

async function getCustomerOrders(id) {
  return Order.find({ customer_id: id }).sort({ created_at: -1 });
}

module.exports = {

  getAllCustomers,

  getCustomerById,

  createCustomer,

  updateCustomer,

  deleteCustomer,

  getCustomerOrders

};