const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Nutrition API v2 online");
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    version: "2.0.0"
  });
});

function extractEsselungaCode(url) {

  const match = url.match(/prodotto\/(\d+)/);

  if (!match) {
    return null;
  }

  return match[1];
}

function stripHtml(html) {

  if (!html) return "";

  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractNutritionTable(html) {

  const nutrition = {};

  const $ = cheerio.load(html);

  $("tr").each((index, row) => {

    const columns = $(row)
      .find("td")
      .map((i, el) => $(el).text().trim())
      .get();

    if (columns.length < 2) {
      return;
    }

    const key = columns[0].toLowerCase();
    const value = columns[1];

    if (key.includes("energia")) {

      const kcalMatch = value.match(/(\d+)\s*kcal/i);

      if (kcalMatch) {
        nutrition.kcal = Number(kcalMatch[1]);
      }
    }

    if (key === "grassi") {
      nutrition.fat = parseFloat(
        value.replace(",", ".")
      );
    }

    if (key === "carboidrati") {
      nutrition.carbs = parseFloat(
        value.replace(",", ".")
      );
    }

    if (key === "proteine") {
      nutrition.protein = parseFloat(
        value.replace(",", ".")
      );
    }

    if (key === "fibre") {
      nutrition.fiber = parseFloat(
        value.replace(",", ".")
      );
    }

    if (key === "sale") {
      nutrition.salt = parseFloat(
        value.replace(",", ".")
      );
    }
  });

  return nutrition;
}

async function extractEsselunga(url) {

  const productCode = extractEsselungaCode(url);

  if (!productCode) {
    throw new Error(
      "Cannot extract Esselunga product code"
    );
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

  const nutritionInfo =
    data.informations.find(
      x => x.label === "Valori nutrizionali"
    );

  const ingredientsInfo =
    data.informations.find(
      x => x.label === "Ingredienti"
    );

  const nutrition =
    nutritionInfo
      ? extractNutritionTable(nutritionInfo.value)
      : {};

  return {
    source: "Esselunga",

    name: product.description,
    brand: product.brand,

    barcode: product.barcode,

    image: product.imageURL,

    packageSize: `${product.unitValue}${product.unitText}`,

    serving: 100,

    kcal: nutrition.kcal || null,
    protein: nutrition.protein || null,
    carbs: nutrition.carbs || null,
    fat: nutrition.fat || null,
    fiber: nutrition.fiber || null,
    salt: nutrition.salt || null,

    ingredients: ingredientsInfo
      ? stripHtml(ingredientsInfo.value)
      : null,

    raw: {
      productCode: product.code
    }
  };
}

async function extractFood(url) {

  if (
    url.includes("spesaonline.esselunga.it")
  ) {
    return await extractEsselunga(url);
  }

  throw new Error(
    "Provider not supported"
  );
}

app.get("/extract-food", async (req, res) => {

  try {

    const url = req.query.url;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: "Missing url"
      });
    }

    const result =
      await extractFood(url);

    res.json({
      success: true,
      food: result
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });

  }

});

app.post("/extract-food", async (req, res) => {

  try {

    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: "Missing url"
      });
    }

    const result =
      await extractFood(url);

    res.json({
      success: true,
      food: result
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });

  }

});

const PORT =
  process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(
    `Server running on port ${PORT}`
  );

});
