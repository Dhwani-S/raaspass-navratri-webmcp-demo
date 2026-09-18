/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "outline-variant": "#c3c6cf",
        "surface-container-high": "#e6e8ea",
        "tertiary": "#32102f",
        "inverse-surface": "#201531",
        "tertiary-container": "#5b174d",
        "surface-container-lowest": "#ffffff",
        "on-error-container": "#93000a",
        "on-tertiary": "#ffffff",
        "on-surface-variant": "#5d5362",
        "on-surface": "#241b2b",
        "surface-container-low": "#fff3e3",
        "on-primary": "#ffffff",
        "background": "#fffaf2",
        "error-container": "#ffdad6",
        "on-error": "#ffffff",
        "surface-container-highest": "#f1dfd4",
        "surface-tint": "#4e246e",
        "outline": "#817480",
        "primary-container": "#35124f",
        "error": "#ba1a1a",
        "secondary": "#762b5f",
        "on-secondary": "#ffffff",
        "secondary-container": "#f5c9d9",
        "surface-container": "#f8e9dc",
        "primary-fixed": "#ead5ff",
        "on-tertiary-fixed": "#32102f",
        "on-tertiary-fixed-variant": "#8d254f",
        "inverse-on-surface": "#eff1f3",
        "on-secondary-fixed": "#0b1c30",
        "inverse-primary": "#adc8f2",
        "surface-bright": "#f7f9fb",
        "surface": "#f7f9fb",
        "surface-variant": "#e0e3e5",
        "on-secondary-fixed-variant": "#38485d",
        "secondary-fixed": "#f8d7e5",
        "on-primary-container": "#d9b8ed",
        "on-primary-fixed-variant": "#5b267c",
        "on-secondary-container": "#7d315f",
        "secondary-fixed-dim": "#e9afc9",
        "tertiary-fixed": "#ffd28a",
        "on-primary-fixed": "#261034",
        "tertiary-fixed-dim": "#e8a64e",
        "on-background": "#241b2b",
        "on-tertiary-container": "#c35727",
        "primary-fixed-dim": "#d4aceb",
        "primary": "#251036",
        "surface-dim": "#ead7ca"
      },
      fontFamily: {
        "headline": ["Bricolage Grotesque"],
        "body": ["DM Sans"],
        "label": ["DM Sans"],
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem",
      },
    },
  },
  plugins: [],
}
