// Escape a user-supplied string so it can be used safely inside a RegExp.
// Also coerces to string, which neutralizes NoSQL operator injection like
// ?search[$ne]= (which would otherwise arrive as an object).
export const escapeRegex = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Build a safe case-insensitive "contains" filter from user input.
export const safeRegexFilter = (value) => ({
  $regex: escapeRegex(value),
  $options: "i",
});

// Coerce to a primitive string, dropping objects/arrays that could carry
// Mongo query operators. Returns undefined for nullish input.
export const toStr = (value) =>
  value === undefined || value === null ? undefined : String(value);
