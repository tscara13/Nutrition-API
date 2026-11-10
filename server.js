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

    const apiUrl =
      "https://spesaonline.esselunga.it/commerce/resources/displayable/detail/code/720145";

    const response = await axios.get(apiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
        "X-Page-Path": "supermercato"
      }
    });

    res.json({
      success: true,
      data: response.data
    });

  } catch (error) {

    res.json({
      success: false,
      error: error.message,
      details: error.response?.data || null
    });

  }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
