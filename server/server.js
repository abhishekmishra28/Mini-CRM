require("dotenv").config();

const app = require("./src/app");
const seedData = require("./src/utils/seedData");
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();
    await seedData();
    app.listen(PORT, () => {
      console.log(
        `Server running on PORT : ${PORT}`
      );
    });
  } catch (error) {
    console.log(error);
  }
}

startServer();