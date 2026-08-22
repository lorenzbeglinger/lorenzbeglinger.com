import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://lorenzbeglinger.ch",
  output: "static",
  compressHTML: true,
});
