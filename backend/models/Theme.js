const mongoose = require("mongoose");

const ThemeSchema = new mongoose.Schema({
  colorPrimary: String,
  colorSecondary: String,
  colorAccent: String,
  colorBg: String,
  colorSurface: String,
  colorText: String,
  radius: Number,
  shadow: { type: String, enum: ["light","medium","strong"], default: "light" },
  fontSans: String,
  fontHeading: String,
}, { timestamps: true });

module.exports = mongoose.model("Theme", ThemeSchema);
