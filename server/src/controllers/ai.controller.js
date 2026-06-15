const aiService = require("../services/ai.service");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");

const chat = asyncHandler(async (req, res) => {
  const data = await aiService.chat(req.body.prompt, req.body.context);
  res.json(new ApiResponse(200, data, "Chat response generated"));
});

const generateSegment = asyncHandler(async (req, res) => {
  let rawData = await aiService.generateSegment(req.body.prompt);
  let parsedData;
  try {
    // Strip markdown formatting if AI responded with markdown (e.g. ```json ... ```)
    const jsonStr = rawData.replace(/```json/g, "").replace(/```/g, "").trim();
    parsedData = JSON.parse(jsonStr);
  } catch (err) {
    throw new Error("Failed to parse AI generated segment as JSON");
  }
  res.json(new ApiResponse(200, parsedData, "Segment generated successfully"));
});

const generateMessage = asyncHandler(async (req, res) => {
  const data = await aiService.generateMessage(req.body.prompt);
  res.json(new ApiResponse(200, { response: data }, "Message generated successfully"));
});

const generateCampaign = asyncHandler(async (req, res) => {
  let rawData = await aiService.generateCampaign(req.body.prompt, req.body.segments || []);
  let parsedData;
  try {
    const jsonStr = rawData.replace(/```json/g, "").replace(/```/g, "").trim();
    parsedData = JSON.parse(jsonStr);
  } catch (err) {
    throw new Error("Failed to parse AI generated campaign as JSON");
  }
  res.json(new ApiResponse(200, parsedData, "Campaign generated successfully"));
});

const insights = asyncHandler(async (req, res) => {
  const data = await aiService.getInsights();
  res.json(new ApiResponse(200, { response: data }, "Insights generated successfully"));
});

module.exports = {
  chat,
  generateSegment,
  generateMessage,
  generateCampaign,
  insights
};