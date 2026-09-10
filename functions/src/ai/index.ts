/**
 * HTTPS callable entry point for Zinoo's internal Business Analyst.
 *
 * Access is restricted to authenticated Zinoo administrators. The Gemini API
 * Vertex AI uses the deployed function's Google Cloud service account through
 * Application Default Credentials; no model API key or Gemini secret is used.
 */
import { getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';
import { runZinooBusinessAnalyst } from './agent';

export interface AskBusinessAIInput {
  message: string;
}

export interface AskBusinessAIOutput {
  answer: string;
}

interface UserProfile {
  role?: string;
  permissions?: {
    admin?: boolean;
  };
}

const ALLOWED_ORIGINS = [
  'https://flinok.in',
  'https://druvio.web.app',
  'http://localhost:3000',
  'http://localhost:5173',
];

function isAdmin(profile: UserProfile | undefined): boolean {
  return profile?.role === 'admin' || profile?.permissions?.admin === true;
}

export const askBusinessAI = onCall<AskBusinessAIInput, Promise<AskBusinessAIOutput>>(
  {
    region: 'us-central1',
    cors: ALLOWED_ORIGINS,
    timeoutSeconds: 60,
    memory: '512MiB',
  },
  async (request): Promise<AskBusinessAIOutput> => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'You must be signed in.');
    }

    const message = request.data?.message?.trim();
    if (!message || message.length > 1_000) {
      throw new HttpsError('invalid-argument', 'Message must contain between 1 and 1,000 characters.');
    }

    const profileSnapshot = await getFirestore().collection('users').doc(request.auth.uid).get();
    if (!profileSnapshot.exists || !isAdmin(profileSnapshot.data() as UserProfile)) {
      throw new HttpsError('permission-denied', 'Only Zinoo administrators can use the Business Analyst.');
    }

    try {
      return await runZinooBusinessAnalyst(message);
    } catch (error) {
      logger.error('Zinoo Business Analyst request failed.', {
        uid: request.auth.uid,
        error,
      });
      throw new HttpsError(
        'internal',
        'The Business Analyst is temporarily unavailable. Please try again.',
      );
    }
  },
);
