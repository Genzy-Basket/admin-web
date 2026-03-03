// constants.js
export const PRODUCT_CATEGORIES = [
  "vegetables",
  "fruits",
  "dairy",
  "meat",
  "bakery",
  "snacks",
  "beverages",
  "staples", // Rice, Grains, Flours
  "oils",
  "personal care",
  "household",
  "baby care",
];

export const PRODUCT_UNITS = [
  "g",
  "kg",
  "ml",
  "l",
  "pc",
  "pkt",
  "dz",
  "unit",
  "bunch",
  "tray",
];

export const BELLY_SIZE = ["small", "standard", "hearty"];

export const INITIAL_FORM_STATE = {
  name: "",
  brand: "",
  description: "",
  category: "vegetables",
  subCategory: "",
  isVeg: true,
  isFMCG: false,
  available: true,
  taxRate: 0,
  keywords: [],
  priceConfigs: [
    {
      displayLabel: "Small Pack",
      quantity: 1,
      unit: "kg",
      price: "",
      mrp: "",
      stock: 0,
    },
  ],
};
