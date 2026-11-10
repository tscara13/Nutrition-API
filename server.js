const express = require("express");
const axios = require("axios");

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

app.get("/extract-food", async (req, res) => {

  try {

    const url =
      "https://spesaonline.esselunga.it/commerce/nav/supermercato/store/prodotto/720145/kioene-kroccanti-6-mini-cotolette-vegetali-con-spinaci-italiani-200-g";

    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const html = response.data;

    const interestingLines = html
      .split("\n")
      .filter(line =>
        line.toLowerCase().includes("api") ||
        line.toLowerCase().includes("product") ||
        line.toLowerCase().includes("prodotto") ||
        line.toLowerCase().includes("json") ||
        line.toLowerCase().includes("catalog") ||
        line.toLowerCase().includes("commerce")
      )
      .slice(0, 100);

    res.json({
      success: true,
      htmlLength: html.length,
      linesFound: interestingLines.length,
      matches: interestingLines
    });

  } catch (error) {

    res.json({
      success: false,
      error: error.message
    });

  }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
