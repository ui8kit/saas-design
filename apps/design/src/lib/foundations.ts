// Foundation scales shown by the docs app. Values come from fixtures/tokens/tokens.json and the ui8px policy.
import tokens from "../../../../fixtures/tokens/tokens.json";
import policy from "../../../../.ui8px/policy/allowed.json";

type Color = { hsl: string; hex: string; source: string };
const entries = (o: Record<string, Color>) => Object.entries(o).map(([name, v]) => ({ name, ...v }));

export const colors = {
  light: entries(tokens.color.light as Record<string, Color>),
  dark: entries(tokens.color.dark as Record<string, Color>),
  brand: entries(tokens.brand.light as Record<string, Color>),
};
export const colorNames = [...Object.keys(tokens.color.light), ...Object.keys(tokens.brand.light)];
export const typeSteps = ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl"];
export const typeScale = tokens.typeScale as Array<{ size: number; weight: number; family: string; count: number; tailwind: string | null }>;
export const font = tokens.font as { sans: string };
export const spaceSteps = ["2", "3", "4", "5", "6", "8", "10", "12", "16", "20", "24"];
export const spacing = policy.spacing as { layout: string[]; control: string[] };
export const radii = ["none", "sm", "md", "lg", "xl", "2xl", "3xl", "full"];
export const radius = tokens.radius as { base: string; px: number };
export const shadows = ["none", "sm", "base", "md", "lg", "xl"];
export const shadowTokens = tokens.shadow as Record<string, string>;
