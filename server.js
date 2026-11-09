const axios = require("axios");
const cheerio = require("cheerio");

app.use(express.json());

const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("Nutrition API online");
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok"
  });
});

app.get("/test-food", (req, res) => {
  res.json({
    name: "Kioene Kroccanti Spinaci",
    kcal: 220,
    protein: 12,
    carbs: 18,
    fat: 9
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
app.post("/extract-food", async (req, res) => {
  try {

    const { url } = req.body;

    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    });

    const html = response.data;

    const $ = cheerio.load(html);

    res.json({
      success: true,
      title: $("title").text(),
      htmlLength: html.length
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });

  }
});
