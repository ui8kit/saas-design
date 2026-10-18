/** Local bricks (same codegen IR as @ui8kit/codegen bricks), appended to the upstream registry by scripts/registry.ts. */
import sheet from "./sheet/sheet.def";
import themetoggle from "./themetoggle/themetoggle.def";

export const local = [themetoggle, sheet];
