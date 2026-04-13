// constants.js
export const PRODUCT_TYPES = ["VEGETABLE", "FRUIT", "DAIRY", "GROCERY"];

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

export const MEAL_TYPES = ["breakfast", "lunch", "snack", "dinner"];

export const DIETARY_TAGS = [
  "high-protein", "low-carb", "low-fat", "gluten-free", "dairy-free",
  "keto", "paleo", "sugar-free", "nut-free", "fiber-rich",
];

export const CUISINES = [
  "south-indian", "north-indian", "chinese", "continental", "italian",
  "street-food", "desserts", "salads", "smoothies", "other",
];

export const INGREDIENT_STATUSES = ["essential", "optional", "seasonal"];

export const INITIAL_DISH_FORM_STATE = {
  title: "",
  description: "",
  dishImages: [],       // array of { url, file, isNew }
  instructionImages: [], // array of { url, file, isNew }
  videoFile: null,
  videoUrl: "",
  prepTimeMinutes: "",
  calories: "",
  servesCount: 1,
  isVeg: true,
  available: true,
  cuisine: "",
  mealTypes: [],
  dietaryTags: [],
  ingredients: [],
  instructions: [""],
  keywords: [],
};

export const INITIAL_FORM_STATE = {
  name: "",
  localName: "",
  brand: "",
  description: "",
  productType: "GROCERY",
  category: "vegetables",
  subCategory: "",
  available: true,
  taxRate: 0,
  keywords: [],
  tags: [],
  shelfLife: "",
  storageInstructions: "",
  isOrganic: false,
  servesWith: [],
  priceConfigs: [
    {
      label: "Small Pack",
      qty: 1,
      unit: "kg",
      sellingPrice: "",
      mrp: "",
      stock: 0,
    },
  ],
};
