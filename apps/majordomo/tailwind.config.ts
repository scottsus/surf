module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#5A7EFF",
      },
      animation: {
        "spin-slow": "spin 20s linear infinite",
        "pulse-shadow": "pulse-shadow 2s ease-in-out infinite",
      },
      keyframes: {
        "pulse-shadow": {
          "0%, 100%": {
            boxShadow: "inset 0 0 100px 20px rgba(0, 89, 255, 0.4)",
          },
          "50%": {
            boxShadow: "inset 0 0 150px 30px rgba(0, 89, 255, 0.2)",
          },
        },
        "static-shadow": "inset 0 0 100px 20px rgba(0, 89, 255, 0.4)",
      },
    },
  },
  safelist: [
    { pattern: /^rounded-/ },
    { pattern: /^bg-/ },
    { pattern: /^text-/ },
    { pattern: /^font-/ },
    { pattern: /^gap-/ },
    { pattern: /^transition-/ },
  ],
  prefix: "",
  corePlugins: {
    preflight: false,
  },
  plugins: [],
};
