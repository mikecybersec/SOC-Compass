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

/**
 * Generate aspect-specific recommendations when an aspect is completed
 * @param {Object} params
 * @param {string} params.apiKey - API key
 * @param {string} params.apiBase - API base URL
 * @param {string} params.model - Model name
 * @param {string} params.aspectKey - Aspect key (domain::aspect)
 * @param {Object} params.aspect - Aspect object
 * @param {Object} params.answers - All answers for the aspect
 * @param {Object} params.metadata - Assessment metadata
 * @returns {Promise<{text: string, highlights: Array<{term: string, type: string}>}>}
 */
export const generateAspectRecommendations = async ({
  apiKey,
  apiBase = 'https://api.x.ai/v1/',
  model = 'grok-4-latest',
  aspectKey,
  aspect,
  answers,
  metadata,
}) => {
  if (!apiKey) {
    return {
      text: 'Provide an API key to generate recommendations.',
      highlights: [],
    };
  }

  const normalizedBase = (apiBase?.trim() || 'https://api.x.ai/v1/').replace(/\/+$/, '') || 'https://api.x.ai/v1';
  const budget = metadata.budgetAmount
    ? `${metadata.budgetCurrency || '$'}${metadata.budgetAmount}`
    : 'not specified';

  // Get only answers for this aspect with question details
  const aspectQuestionsAndAnswers = [];
  aspect.questions.forEach((q) => {
    if (q.isAnswerable && answers[q.code]) {
      aspectQuestionsAndAnswers.push({
        questionCode: q.code,
        questionText: q.text,
        answer: answers[q.code],
        answerOptions: q.answerOptions,
      });
    }
  });

  // Build a detailed question-answer summary
  const questionAnswerSummary = aspectQuestionsAndAnswers.map((qa) => {
    // Determine maturity level from answer
    const answerIndex = qa.answerOptions.indexOf(qa.answer);
    const totalOptions = qa.answerOptions.length;
    const maturityLevel = answerIndex >= 0 && totalOptions > 0 
      ? `Position ${answerIndex + 1} of ${totalOptions} (${qa.answer})`
      : qa.answer;
    
    return `Q: ${qa.questionText}\nA: ${qa.answer}${totalOptions > 0 ? ` (maturity: ${maturityLevel})` : ''}`;
  }).join('\n\n');

  const prompt = `You are a SOC assessment advisor specializing in aspect-specific recommendations. A user has just completed answering ALL questions for the "${aspect.aspect}" aspect under the "${aspect.domain}" domain.

**CRITICAL: Focus ONLY on this specific aspect. Do NOT reference other aspects or domains.**

**Organization Context:**
- Name: ${metadata.name || 'Unknown'}
- Size: ${metadata.size || 'size n/a'}
- Sector: ${metadata.sector || 'n/a'}
- Budget: ${budget}
- SOC Age: ${metadata.socAge || 'n/a'}
- Key Objectives: ${(metadata.objectives || []).join(', ') || 'Not specified'}

**Aspect: "${aspect.aspect}" (Domain: "${aspect.domain}")**

**Questions and Answers for THIS Aspect ONLY:**
${questionAnswerSummary}

**Your Task:**
Generate ONE specific, actionable recommendation (2-3 sentences maximum) that:
1. **Focuses EXCLUSIVELY on the "${aspect.aspect}" aspect** - do not mention other aspects or make general recommendations
2. **Analyzes the specific answers provided above** - reference the actual maturity levels/answers given
3. **Identifies a key gap, strength, or opportunity** within this aspect based on the answers
4. **Provides a concrete, actionable next step** that directly addresses findings from this aspect's answers
5. **Considers the organization's context** (budget, size, sector, objectives) when suggesting the recommendation
6. **Uses specific details from the answers** - mention actual maturity levels, question topics, or answer patterns

**Output Requirements:**
- Plain text only - no markdown, no bullets, no formatting
- 2-3 sentences maximum
- Flowing paragraph style
- Be specific and reference the actual answers provided
- Focus ONLY on "${aspect.aspect}" - do not generalize to other aspects`;

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
          { 
            role: 'system', 
            content: 'You are a SOC assessment advisor specializing in aspect-specific recommendations. You analyze question-answer pairs for a single aspect and provide focused, actionable recommendations based ONLY on those specific answers. You never generalize to other aspects or domains.' 
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 250,
        temperature: 0.6,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate recommendations');
    }

    const payload = await response.json();
    const text = (payload.choices?.[0]?.message?.content || '').trim();

    // Extract potential highlight terms (role names, policy names, maturity levels, etc.)
    const highlights = [];
    const highlightPatterns = [
      /(Level \d+|Initial|Managed|Defined|Quantitatively Managed|Optimizing)/gi,
      /(Admin|Administrator|Engineer|Analyst|Manager|Director|CISO)/gi,
      /(Policy|Procedure|Process|Framework|Standard)/gi,
      /(Access|Security|SOC|SIEM|SOAR|Incident Response)/gi,
    ];

    highlightPatterns.forEach((pattern) => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[0] && !highlights.find((h) => h.term.toLowerCase() === match[0].toLowerCase())) {
          highlights.push({
            term: match[0],
            type: match[1] ? 'maturity' : match[2] ? 'role' : match[3] ? 'policy' : 'concept',
          });
        }
      }
    });

    return { text, highlights: highlights.slice(0, 5) }; // Limit to 5 highlights
  } catch (error) {
    return {
      text: 'Unable to generate recommendations at this time.',
      highlights: [],
      error: error.message,
    };
  }
};