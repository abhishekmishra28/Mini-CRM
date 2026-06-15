const express =
require("express");

const router =
express.Router();

const controller =
require(
 "../controllers/campaign.controller"
);

router.get(
 "/",
 controller.getCampaigns
);

router.post(
 "/",
 controller.createCampaign
);

router.post(
 "/:id/send",
 controller.sendCampaign
);

router.delete(
 "/:id",
 controller.deleteCampaign
);

module.exports = router;