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

app.get("/test-food", (req, res) => {
  res.json({
    name: "Kioene Kroccanti Spinaci",
    kcal: 220,
    protein: 12,
    carbs: 18,
    fat: 9
  });
});

app.get("/extract-food", async (req, res) => {

  try {

    const url =
      "https://spesaonline.esselunga.it/commerce/nav/supermercato/store/prodotto/720145/kioene-kroccanti-6-mini-cotolette-vegetali-con-spinaci-italiani-200-g";

    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    res.json({
      success: true,
      htmlLength: response.data.length
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
