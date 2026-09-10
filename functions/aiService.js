const { createHash } = require('node:crypto');
const { GoogleAuth } = require('google-auth-library');

const TEMPLATE_ID = 'flinok-project-analysis-v1-0-0';
const ASSISTANT_TEMPLATE_ID = 'flinok-project-assistant-v1-0-0';
const AI_LOGIC_ENDPOINT = 'https://firebasevertexai.googleapis.com/v1beta';
const PROJECT_ID = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT || 'flinok';
const AI_LOGIC_LOCATION = process.env.FIREBASE_AI_LOGIC_LOCATION || 'us-central1';
const auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });

const canonicalize = (value) => {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    if (typeof value.toDate === 'function') return value.toDate().toISOString();
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
  }
  return value;
};

const projectFingerprint = (project) => createHash('sha256')
  .update(JSON.stringify(canonicalize(project)))
  .digest('hex');

const responseText = (payload) => payload?.candidates?.[0]?.content?.parts
  ?.map((part) => part.text || '')
  .join('')
  .trim();

const assertAnalysis = (analysis) => {
  if (!analysis || typeof analysis !== 'object' || Array.isArray(analysis)) throw new Error('AI Logic returned an invalid analysis object.');
  if (typeof analysis.summary !== 'string' || !Array.isArray(analysis.strengths) || !Array.isArray(analysis.risks) || !Array.isArray(analysis.recommendations)) {
    throw new Error('AI Logic response did not match the project-analysis schema.');
  }
  return analysis;
};

async function invokeProjectAnalysisTemplate(project) {
  const text = await invokeTemplate(TEMPLATE_ID, { projectJson: JSON.stringify(canonicalize(project)) });
  return assertAnalysis(JSON.parse(text));
}

async function invokeTemplate(templateId, inputs) {
  const client = await auth.getClient();
  // Cloud Functions authenticate with their service account through OAuth. Use
  // the location-qualified Vertex AI provider resource; the non-location
  // projects.templates route is the client/Gemini Developer API surface and is
  // subject to Firebase AI Logic App Check enforcement.
  const url = `${AI_LOGIC_ENDPOINT}/projects/${encodeURIComponent(PROJECT_ID)}/locations/${encodeURIComponent(AI_LOGIC_LOCATION)}/templates/${encodeURIComponent(templateId)}:templateGenerateContent`;
  const requestPayload = { inputs };
  console.info('Firebase AI Logic template request.', {
    templateId,
    url,
    requestPayload
  });

  try {
    const response = await client.request({ url, method: 'POST', data: requestPayload });
    console.info('Firebase AI Logic template response.', {
      templateId,
      status: response.status,
      response: response.data
    });
    const text = responseText(response.data);
    if (!text) {
      const error = new Error('Firebase AI Logic returned an empty response.');
      error.aiLogicResponse = response.data;
      throw error;
    }
    return text;
  } catch (error) {
    console.error('Firebase AI Logic template request failed.', {
      templateId,
      url,
      requestPayload,
      status: error?.response?.status || null,
      statusText: error?.response?.statusText || null,
      response: error?.response?.data || error?.aiLogicResponse || null,
      message: error?.message || String(error),
      code: error?.code || null,
      stack: error?.stack || null
    });
    // Preserve the original error and stack for the callable boundary.
    throw error;
  }
}

async function invokeProjectAssistantTemplate(project, conversation, question) {
  return invokeTemplate(ASSISTANT_TEMPLATE_ID, {
    projectJson: JSON.stringify(canonicalize(project)),
    conversationJson: JSON.stringify(conversation),
    question
  });
}

module.exports = {
  TEMPLATE_ID,
  ASSISTANT_TEMPLATE_ID,
  invokeProjectAnalysisTemplate,
  invokeProjectAssistantTemplate,
  projectFingerprint
};
