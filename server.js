const express = require("express");
const axios = require("axios");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Nutrition API online");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

function extractCode(url) {

  const match = url.match(/prodotto\/(\d+)/);

  if (!match) {
    return null;
  }

  return match[1];
}

function extractNutrition(html) {

  const nutrition = {};

  const clean = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ");

  const patterns = {
    kcal: /(\d+)\s*kcal/i,
    fat: /Grassi.*?(\d+[.,]?\d*)\s*g/i,
    carbs: /Carboidrati.*?(\d+[.,]?\d*)\s*g/i,
    protein: /Proteine.*?(\d+[.,]?\d*)\s*g/i,
    fiber: /Fibre.*?(\d+[.,]?\d*)\s*g/i,
    salt: /Sale.*?(\d+[.,]?\d*)\s*g/i
  };

  for (const [key, regex] of Object.entries(patterns)) {

    const match = clean.match(regex);

    if (match) {
      nutrition[key] =
        parseFloat(match[1].replace(",", "."));
    }
  }

  return nutrition;
}

app.get("/extract-food", async (req, res) => {

  try {

    const productUrl = req.query.url;

    if (!productUrl) {

      return res.status(400).json({
        success: false,
        error: "Missing url parameter"
      });
    }

    const productCode = extractCode(productUrl);

    if (!productCode) {

      return res.status(400).json({
        success: false,
        error: "Cannot extract Esselunga product code"
      });
    }

    const apiUrl =
      `https://spesaonline.esselunga.it/commerce/resources/displayable/detail/code/${productCode}`;

    const response = await axios.get(apiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
        "X-Page-Path": "supermercato"
      }
    });

    const data = response.data;

    const product = data.displayableProduct;

    const nutritionSection =
      data.informations.find(
        x => x.label === "Valori nutrizionali"
      );

    const nutrition = nutritionSection
      ? extractNutrition(nutritionSection.value)
      : {};

    res.json({
      success: true,
      name: product.description,
      brand: product.brand,
      barcode: product.barcode,
      packageSize: `${product.unitValue}${product.unitText}`,
      image: product.imageURL,

      serving: 100,

      kcal: nutrition.kcal || null,
      protein: nutrition.protein || null,
      carbs: nutrition.carbs || null,
      fat: nutrition.fat || null,
      fiber: nutrition.fiber || null,
      salt: nutrition.salt || null
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
