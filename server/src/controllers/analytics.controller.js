const analyticsService = require("../services/analytics.service");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");

const getAnalytics = asyncHandler(async (req, res) => {
  const data = await analyticsService.getDashboardAnalytics();
  res.json(new ApiResponse(200, data, "Analytics retrieved successfully"));
});

module.exports = {
  getAnalytics
};