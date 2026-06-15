const Customer = require("../models/Customer");

const Order = require("../models/Order");

const Campaign = require("../models/Campaign");

const Communication = require("../models/Communication");

async function getDashboardAnalytics() {

  const [
    customers,
    orders,
    campaigns,
    communications

  ] = await Promise.all([

    Customer.find(),

    Order.find(),

    Campaign.find(),

    Communication.find()

  ]);

  const total_customers =
    customers.length;

  const total_orders =
    orders.length;

  const total_campaigns =
    campaigns.length;

  const total_revenue =
    orders.reduce(

      (sum, order) =>

      sum + order.amount,

      0

    );

  const avg_order_value =

    total_orders === 0

      ? 0

      : total_revenue /
        total_orders;

  const communications_total =

    communications.length;

  const communications_by_status = {

    queued: 0,

    delivered: 0,

    opened: 0,

    clicked: 0,

    failed: 0

  };

  communications.forEach(

    (comm) => {

      if (

        comm.status ===

        "delivered"

      ) {

        communications_by_status

        .delivered++;

      }

      else if (

        comm.status ===

        "opened"

      ) {

        communications_by_status

        .opened++;

      }

      else if (

        comm.status ===

        "clicked"

      ) {

        communications_by_status

        .clicked++;

      }

      else if (

        comm.status ===

        "failed"

      ) {

        communications_by_status

        .failed++;

      }

      else {

        communications_by_status

        .queued++;

      }

    }

  );

  const campaign_stats =

    campaigns.map(

      (campaign) => {

        const total =

          campaign.total_sent;

        return {

          id:

            campaign._id,

          name:

            campaign.name,

          channel:

            campaign.channel,

          total_sent:

            campaign.total_sent,

          delivery_rate:

            total

              ?

              (

                campaign.delivered

                / total

              ) * 100

              : 0,

          open_rate:

            total

              ?

              (

                campaign.opened

                / total

              ) * 100

              : 0,

          click_rate:

            total

              ?

              (

                campaign.clicked

                / total

              ) * 100

              : 0

        };

      }

    );

  return {

    total_customers,

    total_revenue,

    total_orders,

    avg_order_value,

    total_campaigns,

    communications_total,

    communications_by_status,

    campaign_stats

  };

}

module.exports = {

  getDashboardAnalytics

};