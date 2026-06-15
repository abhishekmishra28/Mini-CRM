const Customer = require("../models/Customer");

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

module.exports = {

  getAllCustomers,

  getCustomerById,

  createCustomer,

  updateCustomer,

  deleteCustomer

};