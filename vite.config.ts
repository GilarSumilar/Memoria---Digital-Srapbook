import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import VueInspector from "vite-plugin-vue-inspector";

// https://vite.dev/config/
export default defineConfig({
  envPrefix: ["VITE_", "NEXT_PUBLIC_"],
  plugins: [
    vue(),
    tailwindcss(),
    VueInspector({
      // Mengatur tombol pintas untuk aktif/nonaktifkan inspector di browser
      toggleComboKey: "control-shift", // Tekan Ctrl + Shift untuk mengaktifkan di browser
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
