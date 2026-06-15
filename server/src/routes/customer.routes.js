const express =
require("express");

const router =
express.Router();

const controller =
require(
 "../controllers/customer.controller"
);

router.get(
 "/",
 controller.getCustomers
);

router.get(
 "/:id",
 controller.getCustomer
);

router.post(
 "/",
 controller.createCustomer
);

router.put(
 "/:id",
 controller.updateCustomer
);

router.delete(
 "/:id",
 controller.deleteCustomer
);

router.get(
 "/:id/orders",
 controller.getCustomerOrders
);

module.exports = router;