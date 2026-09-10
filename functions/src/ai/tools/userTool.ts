/**
 * Firestore-backed Genkit tool for user registration metrics.
 */
import { Timestamp, getFirestore } from 'firebase-admin/firestore';
import type { Genkit } from 'genkit';
import { z } from 'genkit';

export interface UserSummary {
  totalUsers: number;
  todaySignups: number;
}

function startOfToday(): Timestamp {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Timestamp.fromDate(now);
}

export function createUserSummaryTool(ai: Genkit) {
  return ai.defineTool(
    {
      name: 'getUserSummary',
      description: "Returns Zinoo's total user count and today's signup count.",
      inputSchema: z.object({}),
      outputSchema: z.object({
        totalUsers: z.number().int().nonnegative(),
        todaySignups: z.number().int().nonnegative(),
      }),
    },
    async (): Promise<UserSummary> => {
      const users = getFirestore().collection('users');
      const [total, today] = await Promise.all([
        users.count().get(),
        users.where('createdAt', '>=', startOfToday()).count().get(),
      ]);

      return {
        totalUsers: total.data().count,
        todaySignups: today.data().count,
      };
    },
  );
}
