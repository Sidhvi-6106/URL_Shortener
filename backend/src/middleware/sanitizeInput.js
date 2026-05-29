const dangerousKeys = ["__proto__", "constructor", "prototype"];

const sanitizeValue = (value) => {
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === "object") {
    return Object.entries(value).reduce((clean, [key, nestedValue]) => {
      if (dangerousKeys.includes(key) || key.startsWith("$") || key.includes(".")) {
        return clean;
      }

      clean[key] = sanitizeValue(nestedValue);
      return clean;
    }, {});
  }

  return value;
};

const sanitizeInput = (req, res, next) => {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeValue(req.body);
  }

  next();
};

export default sanitizeInput;
