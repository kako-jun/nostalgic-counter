/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "!./src/app/test1/**/*.{js,ts,jsx,tsx,mdx}", // test1ページを除外
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
