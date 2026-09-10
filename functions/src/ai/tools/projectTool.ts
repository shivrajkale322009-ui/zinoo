/**
 * Firestore-backed Genkit tool for aggregate project metrics.
 *
 * The model receives only the returned counts. It never receives a Firestore
 * client or a way to construct arbitrary database queries.
 */
import { getFirestore } from 'firebase-admin/firestore';
import type { Genkit } from 'genkit';
import { z } from 'genkit';

export interface ProjectSummary {
  totalProjects: number;
  activeProjects: number;
  pendingProjects: number;
}

export function createProjectSummaryTool(ai: Genkit) {
  return ai.defineTool(
    {
      name: 'getProjectSummary',
      description: 'Returns total, active, and pending Zinoo project counts.',
      inputSchema: z.object({}),
      outputSchema: z.object({
        totalProjects: z.number().int().nonnegative(),
        activeProjects: z.number().int().nonnegative(),
        pendingProjects: z.number().int().nonnegative(),
      }),
    },
    async (): Promise<ProjectSummary> => {
      const projects = getFirestore().collection('projects');
      const [total, active, pending] = await Promise.all([
        projects.count().get(),
        projects.where('status', '==', 'active').count().get(),
        projects.where('status', '==', 'pending').count().get(),
      ]);

      return {
        totalProjects: total.data().count,
        activeProjects: active.data().count,
        pendingProjects: pending.data().count,
      };
    },
  );
}
