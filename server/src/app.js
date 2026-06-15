const express = require("express");
const segmentRoutes = require("./routes/segment.routes");
const cors = require("cors");
const campaignRoutes = require("./routes/campaign.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const customerRoutes = require("./routes/customer.routes");
const errorMiddleware = require("./middlewares/error.middleware");
const aiRoutes = require("./routes/ai.routes");
const app = express();
app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://mini-crm-iota-ten.vercel.app",
    ],
    credentials: true,
  })
);

app.use("/api/analytics",analyticsRoutes);
app.use("/api/campaigns",campaignRoutes);
app.use("/api/segments", segmentRoutes);
app.use("/api/customers",customerRoutes);
app.use("/api/ai",aiRoutes);
app.use(errorMiddleware);
app.get("/", (req, res) => {
  res.json({
    success: true,

    message: "Xeno CRM Backend Running...",
  });
});

module.exports = app;