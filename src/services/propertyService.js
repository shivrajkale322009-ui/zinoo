import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebaseConfig';
import { isDeleteConfirmationValid } from '../utils/deletePropertyConfirmation';

const DELETE_ERROR_MESSAGES = Object.freeze({
  'functions/unauthenticated': 'Your session has expired. Sign in again before deleting this property.',
  'functions/permission-denied': 'You do not have permission to delete properties.',
  'functions/not-found': 'This property no longer exists.',
  'functions/unavailable': 'The deletion service is temporarily unavailable. Check your network and try again.',
  'functions/deadline-exceeded': 'Property deletion took too long. Refresh the list before trying again.',
  'functions/internal': 'Property deletion was not completed. Some files may require administrator cleanup.'
});

export async function deleteProperty(projectId, confirmation) {
  if (!projectId || typeof projectId !== 'string') throw new Error('A valid property ID is required.');
  if (!isDeleteConfirmationValid(confirmation)) throw new Error('Type DELETE to confirm permanent property deletion.');

  try {
    const response = await httpsCallable(functions, 'deleteProperty')({ projectId, confirmation: confirmation.trim() });
    return response.data;
  } catch (error) {
    const partialDeletionMessage = error?.details?.stage === 'firestore'
      ? 'Property deletion was only partially completed. Some files or related records may already be removed. Contact support before retrying.'
      : error?.details?.stage === 'storage'
        ? 'Some property files could not be deleted. The property was kept so you can safely retry.'
        : '';
    const message = partialDeletionMessage || DELETE_ERROR_MESSAGES[error?.code] || error?.message || 'Unable to delete this property right now.';
    const normalized = new Error(message);
    normalized.code = error?.code || 'unknown';
    normalized.details = error?.details;
    throw normalized;
  }
}
