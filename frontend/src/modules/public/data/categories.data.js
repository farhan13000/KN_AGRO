import knSuperGold from "../../../assets/KN_Super_Gold.png";
import knSuperNpk from "../../../assets/KN_Super_NPK.png";
import knSuperPotash from "../../../assets/KN_Super_Potash.png";
import knSuperCalcium from "../../../assets/KN_Super_Calcium.png";
import knSuperSulphur from "../../../assets/KN_Super_sulpher.png";
import knSuperBawal from "../../../assets/KN_Super_Bawal.png";

// Temporary hardcoded categories, derived from the products in products.data.js,
// while the backend category APIs are not wired up yet.
export const categories = [
  {
    id: "cat-bio-fertilizers",
    slug: "bio-fertilizers",
    name: "Bio Fertilizers",
    icon: "Sprout",
    image: knSuperNpk,
    description: "Organic manure bio fertilizers that enrich soil health and support balanced crop nutrition.",
    benefits: ["100% organic composition", "Enriches soil health", "Improves plant growth"],
  },
  {
    id: "cat-potash-fertilizers",
    slug: "potash-fertilizers",
    name: "Potash Fertilizers",
    icon: "TrendingUp",
    image: knSuperPotash,
    description: "Bio natural potash inputs derived from molasses to support plant growth and crop yield.",
    benefits: ["Bio natural potash source", "Improves plant growth", "Boosts crop yield"],
  },
  {
    id: "cat-soil-conditioners",
    slug: "soil-conditioners",
    name: "Soil Conditioners",
    icon: "Layers",
    image: knSuperCalcium,
    description: "High-calcium organic manure that promotes strong roots and better soil health.",
    benefits: ["Promotes strong roots", "Improves soil health", "High calcium content"],
  },
  {
    id: "cat-micronutrients",
    slug: "micronutrients",
    name: "Micronutrients",
    icon: "FlaskConical",
    image: knSuperGold,
    description: "Calcium and magnesium rich organic manure for stronger, healthier crops.",
    benefits: ["Rich in calcium and magnesium", "Supports soil health", "100% organic and eco-friendly"],
  },
  {
    id: "cat-crop-protection",
    slug: "crop-protection",
    name: "Crop Protection",
    icon: "ShieldCheck",
    image: knSuperSulphur,
    description: "Sulphur based contact fungicide for protecting crops and supporting healthy growth.",
    benefits: ["90% WDG formulation", "Effective contact fungicide", "Supports healthy crop growth"],
  },
  {
    id: "cat-organic-manure",
    slug: "organic-manure",
    name: "Organic Manure",
    icon: "Recycle",
    image: knSuperBawal,
    description: "100% organic manure bio fertilizers that enrich soil health and boost crop yield.",
    benefits: ["100% organic composition", "Enriches soil health", "Boosts crop yield"],
  },
];
