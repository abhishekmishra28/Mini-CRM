const express =
require("express");

const router =
express.Router();

const controller =
require(
 "../controllers/segment.controller"
);

router.get(
 "/",
 controller.getSegments
);

router.post(
 "/",
 controller.createSegment
);

router.post(
 "/preview",
 controller.previewSegment
);

router.delete(
 "/:id",
 controller.deleteSegment
);

router.get(
 "/:id/customers",
 controller.getCustomers
);

module.exports = router;