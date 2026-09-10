/**
 * Firestore-backed Genkit tool for developer/seller account metrics.
 *
 * Zinoo stores developer accounts in the existing `users` collection. This
 * tool intentionally reads that model instead of creating a new collection.
 */
import { getFirestore } from 'firebase-admin/firestore';
import type { DocumentData, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import type { Genkit } from 'genkit';
import { z } from 'genkit';

export interface DeveloperSummary {
  totalDevelopers: number;
  activeDevelopers: number;
}

function isDeveloper(user: DocumentData): boolean {
  return user.role === 'seller' || user.role === 'developer' || user.permissions?.seller === true;
}

function isActiveDeveloper(user: DocumentData): boolean {
  const status = String(user.status || user.sellerStatus || user.approvalStatus || '').toLowerCase();
  const inactiveStatuses = new Set(['inactive', 'disabled', 'suspended', 'rejected', 'revoked', 'deleted']);
  return isDeveloper(user) && !user.disabled && !user.deleted && !inactiveStatuses.has(status);
}

export function createDeveloperSummaryTool(ai: Genkit) {
  return ai.defineTool(
    {
      name: 'getDeveloperSummary',
      description: 'Returns total and active Zinoo developer/seller account counts.',
      inputSchema: z.object({}),
      outputSchema: z.object({
        totalDevelopers: z.number().int().nonnegative(),
        activeDevelopers: z.number().int().nonnegative(),
      }),
    },
    async (): Promise<DeveloperSummary> => {
      const snapshot = await getFirestore().collection('users').get();
      const developers = snapshot.docs
        .map((document: QueryDocumentSnapshot) => document.data())
        .filter(isDeveloper);

      return {
        totalDevelopers: developers.length,
        activeDevelopers: developers.filter(isActiveDeveloper).length,
      };
    },
  );
}
