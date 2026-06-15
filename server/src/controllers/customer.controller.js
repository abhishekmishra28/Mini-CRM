const customerService = require("../services/customer.service");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");

const getCustomers = asyncHandler(async (req, res) => {
  const data = await customerService.getAllCustomers();
  res.json(new ApiResponse(200, data, "Customers retrieved successfully"));
});

const getCustomer = asyncHandler(async (req, res) => {
  const data = await customerService.getCustomerById(req.params.id);
  res.json(new ApiResponse(200, data, "Customer retrieved successfully"));
});

const createCustomer = asyncHandler(async (req, res) => {
  const data = await customerService.createCustomer(req.body);
  res.status(201).json(new ApiResponse(201, data, "Customer created successfully"));
});

const updateCustomer = asyncHandler(async (req, res) => {
  const data = await customerService.updateCustomer(req.params.id, req.body);
  res.json(new ApiResponse(200, data, "Customer updated successfully"));
});

const deleteCustomer = asyncHandler(async (req, res) => {
  await customerService.deleteCustomer(req.params.id);
  res.json(new ApiResponse(200, null, "Customer deleted successfully"));
});

const getCustomerOrders = asyncHandler(async (req, res) => {
  const data = await customerService.getCustomerOrders(req.params.id);
  res.json(new ApiResponse(200, data, "Customer orders retrieved successfully"));
});

module.exports = {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerOrders
};