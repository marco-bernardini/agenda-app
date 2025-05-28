export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/flowbite/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2A66DD",
      },
    },
  },
  plugins: [
    require('flowbite/plugin')
  ],
}