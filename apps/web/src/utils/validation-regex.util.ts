export const regexSimpleEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const regexNumeric = /^-?\d+(\.\d+)?$/;
export const regexInteger = /^-?\d+$/;
export const regexDecimal = /^-?\d+\.\d+$/;
export const regexUUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const regexAlpha = /^[A-Za-zÀ-ÖØ-öø-ÿ]+$/;
export const regexAlphaNumeric = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9]+$/;
export const regexAlphaNumericSpaces = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9\s]+$/;
export const regexAlphaDash = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9_-]+$/;
