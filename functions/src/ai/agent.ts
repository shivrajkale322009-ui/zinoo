/**
 * Defines the Zinoo Business Analyst and its complete tool allowlist.
 */
import { vertexAI } from '@genkit-ai/vertexai';
import { genkit } from 'genkit';
import { createDeveloperSummaryTool } from './tools/developerTool';
import { createLeadSummaryTool } from './tools/leadTool';
import { createProjectSummaryTool } from './tools/projectTool';
import { createUserSummaryTool } from './tools/userTool';

export const ZINOO_BUSINESS_ANALYST_SYSTEM_PROMPT = `You are Zinoo's internal AI business analyst.

Only answer using available tools.
Never invent data.
If information is unavailable, clearly say so.
Keep answers concise and business focused.`;

const ai = genkit({
  // Cloud Functions supplies GCLOUD_PROJECT and Application Default
  // Credentials, so Vertex AI is authenticated and billed by Zinoo's project.
  plugins: [vertexAI({ location: 'us-central1' })],
  model: vertexAI.model('gemini-2.5-flash'),
});

const tools = [
  createProjectSummaryTool(ai),
  createUserSummaryTool(ai),
  createLeadSummaryTool(ai),
  createDeveloperSummaryTool(ai),
];

export interface BusinessAnalystResponse {
  answer: string;
}

/**
 * Runs one stateless analyst request. Gemini can access business data only
 * through the four tools registered above.
 */
export async function runZinooBusinessAnalyst(message: string): Promise<BusinessAnalystResponse> {
  const response = await ai.generate({
    system: ZINOO_BUSINESS_ANALYST_SYSTEM_PROMPT,
    prompt: message,
    tools,
    config: {
      temperature: 0.1,
      maxOutputTokens: 300,
    },
  });

  const answer = response.text.trim();
  return {
    answer: answer || 'The requested information is unavailable.',
  };
}
