/**
 * Validates a Grok API key by making a lightweight request to the models endpoint
 * @param {string} apiKey - The API key to validate
 * @param {string} apiBase - The API base URL (default: https://api.x.ai/v1/)
 * @returns {Promise<{valid: boolean, error?: string}>}
 */
export const validateApiKey = async (apiKey, apiBase = 'https://api.x.ai/v1/') => {
  if (!apiKey || !apiKey.trim()) {
    return { valid: false, error: 'API key is required' };
  }

  // Basic format check - Grok API keys typically start with 'xai-'
  if (!apiKey.startsWith('xai-') && !apiKey.startsWith('sk-')) {
    // Allow other formats but warn
  }

  const normalizedBase = (apiBase?.trim() || 'https://api.x.ai/v1/').replace(/\/+$/, '') || 'https://api.x.ai/v1';

  try {
    // Use the models endpoint as a lightweight validation check
    const response = await fetch(`${normalizedBase}/models`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.trim()}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return { valid: false, error: 'Invalid API key' };
      }
      return { valid: false, error: `API request failed: ${response.status}` };
    }

    // If we get a successful response, the key is valid
    return { valid: true };
  } catch (error) {
    // Network errors or other issues
    return { valid: false, error: error.message || 'Failed to validate API key' };
  }
};

const buildPrompt = ({ frameworkName, answers, scores, metadata }) => {
  const budget = metadata.budgetAmount
    ? `${metadata.budgetCurrency || '$'}${metadata.budgetAmount}`
    : 'n/a';

  return `You are an SOC consultant. Build a concise, prioritized action plan.\nFramework: ${frameworkName}\nOrganization: ${
    metadata.name || 'Unknown'
  } (${metadata.size || 'size n/a'}) in sector ${metadata.sector || 'n/a'} with budget ${budget}. SOC age: ${
    metadata.socAge || 'n/a'
  }.\nObjectives: ${
    (metadata.objectives || []).join(', ') || 'Not specified'
  }.\nScores: ${JSON.stringify(scores)}\nAnswers: ${JSON.stringify(answers)}\nRespond with 5-8 actionable steps, each including rationale and expected impact.`;
};

export const generateActionPlan = async ({
  apiKey,
  apiBase = 'https://api.x.ai/v1/',
  model = 'grok-4-latest',
  frameworkName,
  answers,
  scores,
  metadata,
}) => {
  if (!apiKey) {
    return {
      raw: 'Provide an API key to request an AI action plan.',
      steps: [
        'Provide an API key to request an AI action plan.',
      ],
    };
  }

  const normalizedBase = (apiBase?.trim() || 'https://api.x.ai/v1/').replace(/\/+$/, '')
    || 'https://api.x.ai/v1';
  const prompt = buildPrompt({ frameworkName, answers, scores, metadata });

  try {
    const response = await fetch(`${normalizedBase}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You are a seasoned SOC transformation advisor.' },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      let message = 'AI provider rejected the request';
      try {
        const errorPayload = await response.json();
        message = errorPayload?.error?.message || message;
      } catch (error) {
        // ignore parse errors and fall back to default message
      }

      if (response.status === 401 || response.status === 403) {
        message = 'The API key or endpoint was rejected. Verify your key, model, and API base for your provider and try again.';
      }

      throw new Error(message);
    }

    const payload = await response.json();
    const content = (payload.choices?.[0]?.message?.content || '').trim();
    return { raw: content, steps: content.split('\n').filter(Boolean) };
  } catch (error) {
    return {
      raw: 'Failed to generate action plan automatically. Please try again later.',
      steps: ['Failed to generate action plan automatically. Please try again later.'],
      error: error.message,
    };
  }
};

export const buildPromptPreview = (state) => buildPrompt(state);
