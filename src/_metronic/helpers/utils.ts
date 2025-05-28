export function getLocalizedField<T>(
  item: T,
  field: string,
  locale: string
): string {
  if (!item || typeof item !== "object") {
    return ""; // Возвращаем пустую строку, если item не является объектом
  }
  const key = `${field}_${locale}`;

  // Проверяем наличие ключа и утверждаем его тип
  if (Object.prototype.hasOwnProperty.call(item, key)) {
    return (item as Record<string, string>)[key] || "";
  }

  return "";
}
