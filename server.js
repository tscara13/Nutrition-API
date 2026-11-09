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

  console.log("START REQUEST");

  try {

    const url =
      "https://spesaonline.esselunga.it/commerce/nav/supermercato/store/prodotto/720145/kioene-kroccanti-6-mini-cotolette-vegetali-con-spinaci-italiani-200-g";

    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    console.log("PAGE DOWNLOADED");

    const html = response.data;

    res.json({
      success: true,
      htmlLength: html.length,
      first500Chars: html.substring(0, 500)
    });

  } catch (error) {

    console.log("ERROR");

    res.json({
      success: false,
      message: error.message,
      code: error.code || null
    });

  }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
