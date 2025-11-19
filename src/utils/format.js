export const formatEnumLabel = (str) => {
  if (!str || typeof str !== 'string') return '';
  const words = str.toLowerCase().split('_');
  return words
    .map((w, i) => {
      // Mantém conectores comuns em minúsculo quando não são a primeira palavra
      const connectors = ['de', 'da', 'do', 'das', 'dos', 'e'];
      if (i > 0 && connectors.includes(w)) return w;
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(' ');
};