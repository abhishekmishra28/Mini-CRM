const campaignService = require("../services/campaign.service");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");

const getCampaigns = asyncHandler(async (req, res) => {
  const data = await campaignService.getAllCampaigns();
  res.json(new ApiResponse(200, data, "Campaigns retrieved successfully"));
});

const createCampaign = asyncHandler(async (req, res) => {
  const data = await campaignService.createCampaign(req.body);
  res.status(201).json(new ApiResponse(201, data, "Campaign created successfully"));
});

const sendCampaign = asyncHandler(async (req, res) => {
  const data = await campaignService.sendCampaign(req.params.id);
  res.json(new ApiResponse(200, data, "Campaign delivery started"));
});

const deleteCampaign = asyncHandler(async (req, res) => {
  await campaignService.deleteCampaign(req.params.id);
  res.json(new ApiResponse(200, null, "Campaign deleted successfully"));
});

const getCampaignCommunications = asyncHandler(async (req, res) => {
  const data = await campaignService.getCampaignCommunications(req.params.id);
  res.json(new ApiResponse(200, data, "Campaign communications retrieved successfully"));
});

module.exports = {
  getCampaigns,
  createCampaign,
  sendCampaign,
  deleteCampaign,
  getCampaignCommunications
};