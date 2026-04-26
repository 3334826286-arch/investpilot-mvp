function isPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

export function mergeStructuredData(baseValue, overrideValue) {
  if (Array.isArray(baseValue) || Array.isArray(overrideValue)) {
    return Array.isArray(overrideValue) && overrideValue.length ? overrideValue : baseValue;
  }

  if (isPlainObject(baseValue) || isPlainObject(overrideValue)) {
    const result = { ...(isPlainObject(baseValue) ? baseValue : {}) };

    for (const [key, value] of Object.entries(isPlainObject(overrideValue) ? overrideValue : {})) {
      result[key] = mergeStructuredData(result[key], value);
    }

    return result;
  }

  return overrideValue ?? baseValue;
}
