---
version: "alpha"
name: "Habitus"
description: "Habit tracking SaaS landing (Figma frame Home 1:10, file saas-landing.fig)."
colors:
  primary: "#fe5d33"
  on-primary: "#ffffff"
  surface: "#f6f6f6"
  on-surface: "#111827"
  background: "#ffffff"
  border: "#e5e7eb"
  accent: "#dbedfb"
  error: "#dc2626"
  chart-chart-1: "#fe5d33"
  chart-chart-2: "#111827"
  chart-chart-3: "#d9b8d5"
  chart-chart-4: "#dbedfb"
  chart-chart-5: "#fec6c7"
  category-brandOrange: "#000000"
  category-brandInk: "#000000"
  category-brandPink: "#000000"
  category-brandLilac: "#000000"
  category-brandSky: "#000000"
  category-brandMist: "#000000"
  category-brandSuccess: "#000000"
  category-brandPlaceholder: "#000000"
typography:
  display-lg:
    fontFamily: "Inter"
    fontSize: "3rem"
    fontWeight: 700
    lineHeight: "1.1"
  display-md:
    fontFamily: "Inter"
    fontSize: "2.5rem"
    fontWeight: 700
    lineHeight: "1.1"
  body-lg:
    fontFamily: "Inter"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: "1.6"
  body-md:
    fontFamily: "Inter"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: "1.55"
  body-sm:
    fontFamily: "Inter"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: "1.5"
  label-md:
    fontFamily: "Inter"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: "1.3"
  label-sm:
    fontFamily: "Inter"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: "1.2"
rounded:
  none: 0
  sm: "0.625rem"
  md: "1.25rem"
  lg: "2.5rem"
  xl: "2.5rem"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
    typography: "{typography.label-md}"
    padding: "{spacing.md}"
  button-primary-hover:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-primary}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
---

## Overview

Build better habits, one day at a time.
Positioning: Friendly consumer habit tracker with a bold orange surface and soft pastel cards.
Personality: warm, encouraging, clear
Anti-personality: corporate, clinical

## Colors

Use semantic color roles first: background #ffffff, foreground #111827, primary #fe5d33, accent #dbedfb.
orange only for primary actions, badges and the hero band
dark text on pastel, white text on orange and ink
Supported themes: light, dark.
Category colors: brandOrange, brandInk, brandPink, brandLilac, brandSky, brandMist, brandSuccess, brandPlaceholder.
Chart colors: chart-1, chart-2, chart-3, chart-4, chart-5.

## Typography

Font families:
- Display: `Inter`
- Body: `Inter`
Type scale:
- px85: `5.3125rem`
- 6xl: `3.75rem`
- 4xl: `2.25rem`
- 3xl: `1.875rem`
- 2xl: `1.5rem`
- px22: `1.375rem`
- xl: `1.25rem`
- lg: `1.125rem`
- base: `1rem`
- sm: `0.875rem`
Weights:
- light: `300`
- regular: `400`
- medium: `500`
- semibold: `600`
- bold: `700`

## Layout

Base spacing unit: 8px.
Container widths: page=77.5rem.

## Elevation & Depth

no shadows; depth comes from color blocks
Shadow scale:
- sm: `none`
- md: `none`

## Shapes

One large corner radius (40px) on every card and band, pills for buttons and badges, 20px on phone mockups.
Radius scale:
- sm: `0.625rem`
- md: `1.25rem`
- lg: `2.5rem`

## Components

Keep standard: button, badge, input, card, accordion.
Custom blocks: hero-phones, app-gallery, faq-tiles.

Cross-surface rules:
- white page
- orange only for primary actions, badges and the hero band
- dark text on pastel, white text on orange and ink

## Do's and Don'ts

Do:
- Do preserve AA contrast in every emitted theme before polishing visual effects.
- Do make the brand recognisable through marks, shape language, and illustration motifs, not color alone.
- orange only for primary actions, badges and the hero band

Don't:
- corporate
- clinical
- jargon
- exclamation marks in headings
- shadows on cards
- more than one accent color per card
- inline styles
- Body text on dark must clear 4.5:1 and headings on dark must clear 7:1.
