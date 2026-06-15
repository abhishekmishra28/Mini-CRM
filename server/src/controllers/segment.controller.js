const segmentService = require("../services/segment.service");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");

const getSegments = asyncHandler(async (req, res) => {
  const data = await segmentService.getAllSegments();
  res.json(new ApiResponse(200, data, "Segments retrieved successfully"));
});

const createSegment = asyncHandler(async (req, res) => {
  const data = await segmentService.createSegment(req.body);
  res.status(201).json(new ApiResponse(201, data, "Segment created successfully"));
});

const deleteSegment = asyncHandler(async (req, res) => {
  await segmentService.deleteSegment(req.params.id);
  res.json(new ApiResponse(200, null, "Segment deleted successfully"));
});

const getCustomers = asyncHandler(async (req, res) => {
  const data = await segmentService.getSegmentCustomers(req.params.id);
  res.json(new ApiResponse(200, data, "Segment customers retrieved successfully"));
});

const previewSegment = asyncHandler(async (req, res) => {
  const data = await segmentService.previewSegment(req.body);
  res.json(new ApiResponse(200, data, "Segment preview retrieved successfully"));
});

module.exports = {
  getSegments,
  createSegment,
  deleteSegment,
  getCustomers,
  previewSegment
};