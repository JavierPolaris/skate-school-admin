// Formatea una fecha ISO a formato DD/MM/YYYY
export const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES');
};

// Valida email
export const isValidEmail = (email) => {
  return /\S+@\S+\.\S+/.test(email);
};

// Capitaliza la primera letra
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};
