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

  return `You are an experienced SOC consultant and capability maturity model (CMM) expert. Analyze the provided assessment data and generate a comprehensive action plan.

**Context:**
- Framework: ${frameworkName}
- Organization: ${metadata.name || 'Unknown'} (${metadata.size || 'size n/a'}) in sector ${metadata.sector || 'n/a'}
- Budget: ${budget}
- SOC Age: ${metadata.socAge || 'n/a'}
- Objectives: ${(metadata.objectives || []).join(', ') || 'Not specified'}
- Assessment Scores: ${JSON.stringify(scores)}
- Detailed Answers: ${JSON.stringify(answers)}

**Required Structure:**

1. **BLUF (Bottom Line Up Front)** - Start with a concise 2-3 paragraph executive summary that provides:
   - Overall CMM maturity assessment (current state)
   - Key strengths and critical gaps
   - Primary maturity level estimate (e.g., Level 1-5 or Initial/Managed/Defined/etc.)
   - Most significant risks or opportunities

2. **Low-Hanging Fruit** - Provide 3-5 quick-win recommendations that are:
   - Relatively inexpensive or resource-unintensive
   - Can be implemented quickly (within weeks to a few months)
   - Have cross-benefits across multiple domains/aspects
   - Provide immediate value or risk reduction
   - For each item, briefly explain the action, why it's low-hanging fruit, and expected cross-benefits

3. **Comprehensive Action Plan** - Provide 5-8 detailed, prioritized action steps that:
   - Address the most critical maturity gaps
   - Are tailored to the organization's size, sector, budget, and SOC age
   - Consider the stated objectives (but maintain flexibility)
   - Include rationale, expected impact, and resource considerations
   - Are sequenced logically (foundational items first, building to more advanced capabilities)

**Guidance:**
- Be practical and realistic given the organization's constraints
- Focus on security leadership, SOC management, and team management where relevant
- Ensure recommendations are attainable based on resources, budget, and sector context
- Consider the objectives but don't overly fixate on them - maintain flexibility
- Use clear, professional language suitable for SOC leaders and executives

Format your response using clear section headers (## BLUF, ## Low-Hanging Fruit, ## Action Plan) and markdown formatting for readability.`;
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
          { role: 'system', content: 'You are a seasoned SOC transformation advisor and capability maturity model expert with deep expertise in security operations centers, SOC management, and leading SOC teams. You provide practical, actionable advice tailored to each organization\'s unique context, constraints, and objectives.' },
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
