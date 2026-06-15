const Segment = require("../models/Segment");
const Customer = require("../models/Customer");

function daysBetween(date) {
  if (!date) return null;

  const today = new Date();

  return Math.floor(
    (today - new Date(date)) /
    (1000 * 60 * 60 * 24)
  );
}

function evaluateCondition(customer, condition) {

  const { field, op, value } = condition;

  const customerValue = customer[field];

  switch (op) {

    case "gt":
      return customerValue > value;

    case "lt":
      return customerValue < value;

    case "gte":
      return customerValue >= value;

    case "lte":
      return customerValue <= value;

    case "eq":
      return customerValue == value;

    case "neq":
      return customerValue != value;

    case "contains":

      if (
        Array.isArray(customerValue)
      ) {

        return customerValue.includes(
          value
        );
      }

      return String(
        customerValue
      )
      .toLowerCase()
      .includes(
        String(value)
        .toLowerCase()
      );

    case "days_ago_gt":

      return (
        daysBetween(customerValue)
        > value
      );

    case "days_ago_lt":

      return (
        daysBetween(customerValue)
        < value
      );

    default:

      return false;
  }
}

function evaluateSegment(
  customer,
  segment
) {

  const results =
    segment.conditions.map(
      (condition) =>
        evaluateCondition(
          customer,
          condition
        )
    );

  if (
    segment.operator === "AND"
  ) {

    return results.every(Boolean);

  }

  return results.some(Boolean);
}

async function getSegmentCustomers(
  segmentId
) {

  const segment =
    await Segment.findById(
      segmentId
    );

  if (!segment) {

    throw new Error(
      "Segment not found"
    );

  }

  const customers =
    await Customer.find();

  return customers.filter(
    (customer) =>
      evaluateSegment(
        customer,
        segment
      )
  );
}

async function createSegment(
  data
) {

  const segment =
    await Segment.create(data);

  const customers =
    await getSegmentCustomers(
      segment._id
    );

  segment.customer_count =
    customers.length;

  await segment.save();

  return segment;
}

async function getAllSegments() {

  return Segment.find().sort({
    created_at: -1
  });

}

async function deleteSegment(
  id
) {

  return Segment.findByIdAndDelete(
    id
  );

}

async function previewSegment(segment) {
  const customers = await Customer.find();
  return customers.filter(customer => evaluateSegment(customer, segment));
}

module.exports = {

  createSegment,

  getAllSegments,

  deleteSegment,

  getSegmentCustomers,

  evaluateCondition,

  evaluateSegment,

  previewSegment

};