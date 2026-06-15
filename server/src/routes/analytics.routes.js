const express =

require("express");

const router =

express.Router();

const controller =

require(

 "../controllers/analytics.controller"

);

router.get(
 "/",
 controller.getAnalytics
);

router.get(
 "/dashboard",
 controller.getAnalytics
);

module.exports = router;