import { httpsCallable } from 'firebase/functions';
import { auth, functions } from '../firebaseConfig';

const analyzeProjectCallable = httpsCallable(functions, 'analyzeProject');
const projectAssistantCallable = httpsCallable(functions, 'chatWithProjectAssistant');

const requireAuthenticatedUser = async () => {
  await auth.authStateReady();
  if (!auth.currentUser) throw new Error('You must be signed in to use the AI Assistant.');
};

const assertAssistantResponse = (value) => {
  if (!value || typeof value.answer !== 'string' || !value.answer.trim()) {
    throw new Error('The AI Assistant returned an invalid response. Please try again.');
  }
  return value;
};

export async function analyzeProject(projectId) {
  if (!projectId) throw new Error('A project ID is required for AI analysis.');
  await requireAuthenticatedUser();
  const response = await analyzeProjectCallable({ projectId });
  return response.data;
}

export async function streamProjectAssistant({ projectId, conversation, question, onChunk, signal }) {
  if (!projectId) throw new Error('Select a project before asking the AI Assistant.');
  await requireAuthenticatedUser();
  const { stream, data } = await projectAssistantCallable.stream({ projectId, conversation, question }, { signal });
  let receivedStreamedText = false;
  for await (const chunk of stream) {
    if (typeof chunk?.delta !== 'string' || !chunk.delta) continue;
    receivedStreamedText = true;
    onChunk?.(chunk.delta);
  }
  const result = assertAssistantResponse(await data);
  // A callable may return only its normal response when the deployed runtime or
  // intermediary does not negotiate streaming. Preserve the same UI behavior.
  if (!receivedStreamedText) onChunk?.(result.answer);
  return result;
}
