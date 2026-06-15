const express =
require("express");

const router =
express.Router();

const controller =
require(
 "../controllers/ai.controller"
);

router.post(
 "/chat",
 controller.chat
);

router.post(
 "/generate-segment",
 controller.generateSegment
);

router.post(
 "/generate-message",
 controller.generateMessage
);

router.post(
 "/insights",
 controller.insights
);

module.exports = router;