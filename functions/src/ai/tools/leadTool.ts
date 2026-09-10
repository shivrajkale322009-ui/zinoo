/**
 * Firestore-backed Genkit tool for lead-volume metrics.
 */
import { Timestamp, getFirestore } from 'firebase-admin/firestore';
import type { Genkit } from 'genkit';
import { z } from 'genkit';

export interface LeadSummary {
  totalLeads: number;
  todayLeads: number;
}

function startOfToday(): Timestamp {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Timestamp.fromDate(now);
}

export function createLeadSummaryTool(ai: Genkit) {
  return ai.defineTool(
    {
      name: 'getLeadSummary',
      description: "Returns Zinoo's total lead count and today's lead count.",
      inputSchema: z.object({}),
      outputSchema: z.object({
        totalLeads: z.number().int().nonnegative(),
        todayLeads: z.number().int().nonnegative(),
      }),
    },
    async (): Promise<LeadSummary> => {
      const leads = getFirestore().collection('leads');
      const [total, today] = await Promise.all([
        leads.count().get(),
        leads.where('createdAt', '>=', startOfToday()).count().get(),
      ]);

      return {
        totalLeads: total.data().count,
        todayLeads: today.data().count,
      };
    },
  );
}
