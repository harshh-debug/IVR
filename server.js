// server.js
require("dotenv").config();
const express = require("express");
const { getSession, closeDriver } = require("./dbconnect");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Webhook endpoint for Twilio
app.post("/twilio-webhook", async (req, res) => {
  const session = await getSession();

  try {
    console.log("📞 Incoming Twilio data:");
    console.log(req.body);

    const {
      call_sid,
      from,
      farmer_name,
      crop,
      crop_digit,
      land_size,
      land_size_digit,
      irrigation,
      irrigation_digit,
      age,
    } = req.body;

    // Upsert farmer profile
    await session.run(
      `
      MERGE (f:Farmer {call_sid: $call_sid})
      SET f.phone = $from,
          f.name = CASE WHEN $farmer_name <> "" THEN $farmer_name ELSE f.name END,
          f.crop = $crop,
          f.crop_digit = $crop_digit,
          f.land_size = $land_size,
          f.land_size_digit = $land_size_digit,
          f.irrigation = $irrigation,
          f.irrigation_digit = $irrigation_digit,
          f.age = $age,
          f.updatedAt = datetime()
      RETURN f
      `,
      {
        call_sid,
        from,
        farmer_name,
        crop,
        crop_digit,
        land_size,
        land_size_digit,
        irrigation,
        irrigation_digit,
        age,
      }
    );

    console.log(`✅ Farmer profile stored/updated for call_sid: ${call_sid}`);
    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Error saving farmer profile:", error);
    res.sendStatus(500);
  } finally {
    await session.close();
  }
});

// Initialize DB first, then start server
const initializeConnection = async () => {
  try {
    const session = await getSession();
    await session.run("RETURN 1"); // simple check query
    await session.close();

    console.log("✅ Database connection established successfully.");

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Error establishing database connection:", error);
    await closeDriver();
    process.exit(1);
  }
};

initializeConnection();
