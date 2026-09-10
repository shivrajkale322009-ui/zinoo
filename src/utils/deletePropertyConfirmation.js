export const isDeleteConfirmationValid = (value) =>
  typeof value === 'string' && value.trim() === 'DELETE';
