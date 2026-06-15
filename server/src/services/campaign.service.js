const Campaign = require("../models/Campaign");
const Communication = require("../models/Communication");
const segmentService = require("./segment.service");

async function getAllCampaigns() {
  return Campaign.find()
    .populate("segment_id", "name")
    .sort({ created_at: -1 });
}

async function createCampaign(data) {
  return Campaign.create(data);
}

async function deleteCampaign(id) {
  return Campaign.findByIdAndDelete(id);
}

function randomStatus() {
  const n = Math.random();
  if (n < 0.8) return "delivered";
  if (n < 0.9) return "opened";
  if (n < 0.96) return "clicked";
  return "failed";
}

async function sendCampaign(campaignId) {
  const campaign = await Campaign.findById(campaignId);
  if (!campaign) {
    throw new Error("Campaign not found");
  }

  campaign.status = "sending";
  await campaign.save();

  // Background Simulator
  (async () => {
    try {
      const customers = await segmentService.getSegmentCustomers(campaign.segment_id);
      const communications = [];
      let delivered = 0, failed = 0, opened = 0, clicked = 0;

      // Simulate network delay for sending
      await new Promise(resolve => setTimeout(resolve, 2000));

      for (const customer of customers) {
        const finalStatus = randomStatus();
        if (finalStatus === "failed") failed++;
        else delivered++;

        if (finalStatus === "opened") opened++;
        if (finalStatus === "clicked") {
          clicked++;
          opened++;
        }

        communications.push({
          campaign_id: campaign._id,
          customer_id: customer._id,
          channel: campaign.channel,
          message: campaign.message,
          status: finalStatus
        });
      }

      if (communications.length > 0) {
        await Communication.insertMany(communications);
      }

      campaign.total_sent = customers.length;
      campaign.delivered = delivered;
      campaign.failed = failed;
      campaign.opened = opened;
      campaign.clicked = clicked;
      campaign.status = "completed";
      campaign.sent_at = new Date();
      await campaign.save();
    } catch (err) {
      console.error("Background Campaign Simulator Error:", err);
      campaign.status = "failed";
      await campaign.save();
    }
  })();

  return campaign;
}

async function getCampaignCommunications(campaignId) {
  return Communication.find({ campaign_id: campaignId }).sort({ created_at: -1 });
}

module.exports = {
  createCampaign,
  getAllCampaigns,
  deleteCampaign,
  sendCampaign,
  getCampaignCommunications
};