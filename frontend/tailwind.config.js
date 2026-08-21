/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        forest: "#174C2B",
        agriculture: "#2F7D32",
        leaf: "#78A942",
        mustard: "#E5A72B",
        ivory: "#F8F6EF",
        mint: "#EFF5EC",
        ink: "#18221A",
        muted: "#58625A",
        soft: "#7A847D",
      },
      fontFamily: {
        sans: ["Inter", "Manrope", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 18px 45px rgba(23, 76, 43, 0.12)",
        card: "0 14px 36px rgba(24, 34, 26, 0.08)",
      },
      backgroundImage: {
        "field-radial":
          "radial-gradient(circle at top left, rgba(120, 169, 66, 0.24), transparent 32%), linear-gradient(135deg, #174C2B 0%, #2F7D32 58%, #78A942 100%)",
      },
    },
  },
  plugins: [],
};
