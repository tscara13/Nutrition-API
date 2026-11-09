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
