const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();

app.use(express.json());

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

app.post("/extract-food", async (req, res) => {
  try {

    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: "Missing URL"
      });
    }

    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0 Safari/537.36"
      }
    });

    const html = response.data;

    const $ = cheerio.load(html);

    res.json({
      success: true,
      title: $("title").text(),
      htmlLength: html.length,
      url: url
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });

  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
app.get("/ping", (req, res) => {
  res.json({
    success: true,
    message: "Ping ricevuto"
  });
});
