/**
 * Sample children for showcase parts that take children. Most parts show their own name; compact
 * fixed-size parts (a 24–48px circle) get a short glyph so the text never overflows the part.
 */
const short: Record<string, string> = { IconBadge: "H" };
export const sampleChildren = (part: string) => short[part] ?? part;
