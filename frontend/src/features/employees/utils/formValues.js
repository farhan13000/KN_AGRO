export const updateNestedValue = (values, name, value) => {
  if (!name.includes(".")) {
    return { ...values, [name]: value };
  }

  const [root, child] = name.split(".");
  return {
    ...values,
    [root]: {
      ...(values[root] || {}),
      [child]: value,
    },
  };
};

export const toDateInputValue = (value) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
};
