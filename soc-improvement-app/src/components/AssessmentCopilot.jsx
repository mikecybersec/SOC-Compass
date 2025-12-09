import React, { useEffect, useMemo, useRef, useState } from 'react';
import { frameworks, defaultFrameworkId } from '../utils/frameworks';
import { useAssessmentStore } from '../hooks/useAssessmentStore';
import { Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import suggestionsData from '../data/copilot_suggestions_soccmm.json';

const normalizeBase = (apiBase) => (apiBase?.trim() || 'https://api.x.ai/v1/').replace(/\/+$/, '');

const buildAssessmentContext = (assessment) => {
  if (!assessment) return 'No assessment available.';

  const framework = frameworks[assessment.frameworkId] || frameworks[defaultFrameworkId];
  const questionLookup = {};

  framework.aspects.forEach((aspect) => {
    aspect.questions.forEach((question) => {
      questionLookup[question.code] = {
        domain: aspect.domain,
        aspect: aspect.aspect,
        text: question.text,
        guidance: question.guidance,
        answerOptions: question.answerOptions,
        questionType: question.questionType,
      };
    });
  });

  return JSON.stringify(
    {
      framework: { id: framework.id, name: framework.name },
      metadata: assessment.metadata,
      answers: assessment.answers,
      notes: assessment.notes,
      actionPlan: assessment.actionPlan,
      questionLookup,
    },
    null,
    2
  );
};

const AssessmentCopilot = ({ onOpenApiModal }) => {
  const apiKey = useAssessmentStore((s) => s.apiKey);
  const apiKeyValidated = useAssessmentStore((s) => s.apiKeyValidated);
  const apiBase = useAssessmentStore((s) => s.apiBase);
  const model = useAssessmentStore((s) => s.model);
  const assessment = useAssessmentStore((s) => s.currentAssessment);
  const activeAspectKey = useAssessmentStore((s) => s.activeAspectKey);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const listRef = useRef(null);

  const assessmentContext = useMemo(() => buildAssessmentContext(assessment), [assessment]);

  // Get suggestions for current aspect
  const suggestions = useMemo(() => {
    if (!activeAspectKey || !suggestionsData[activeAspectKey]) {
      return [];
    }
    return suggestionsData[activeAspectKey] || [];
  }, [activeAspectKey]);

  // Initialize messages when copilot opens
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: "Hi, I'm Compass Copilot. Ask me anything about this assessment and I'll answer using the data on the page.",
        },
      ]);
      setShowSuggestions(true);
    }
  }, [open]);

  const systemPrompt = useMemo(
    () => {
      const assessmentData = JSON.parse(assessmentContext);
      const metadata = assessmentData.metadata || {};
      const framework = assessmentData.framework || {};
      
      return [
        'You are Compass Copilot, an expert security leadership and SOC management advisor embedded in a security assessment tool.',
        'Your role is to provide practical, actionable guidance for SOC leaders, managers, and teams.',
        '',
        'CRITICAL CONTEXT - Always consider these factors when providing recommendations:',
        `- Organization Sector: ${metadata.sector || 'Not specified'}`,
        `- Organization Size: ${metadata.size || 'Not specified'}`,
        `- Budget: ${metadata.budgetCurrency || '$'}${metadata.budgetAmount || 'Not specified'}`,
        `- SOC Age/Maturity: ${metadata.socAge || 'Not specified'}`,
        `- Key Objectives: ${(metadata.objectives || []).join(', ') || 'Not specified'}`,
        `- Assessment Framework: ${framework.name || 'Not specified'}`,
        '',
        'GUIDANCE PRINCIPLES:',
        '1. Tailor all recommendations to the organization\'s specific context (sector, size, budget, maturity level)',
        '2. Ensure suggestions are realistic and attainable given the stated resources and constraints',
        '3. Focus on security leadership, SOC management, team management, and operational excellence',
        '4. Consider the organization\'s stated objectives when providing advice, but maintain flexibility - objectives are guidance, not rigid constraints',
        '5. Provide practical, actionable advice that generally aligns with objectives while allowing for valuable recommendations that may extend beyond them',
        '6. Consider the SOC\'s current maturity level when suggesting improvements',
        '7. Prioritize recommendations that provide the most value within budget constraints',
        '8. Reference specific assessment data (answers, notes, scores) when relevant',
        '',
        'RESPONSE STYLE:',
        '- Be concise but comprehensive',
        '- Use the assessment data to provide context-specific advice',
        '- Explain why recommendations are suitable for this organization',
        '- If asked about something not in the assessment, acknowledge the limitation and suggest how to gather that information',
        '',
        'Assessment JSON Data:',
        assessmentContext,
      ].join('\n');
    },
    [assessmentContext]
  );

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open]);

  const handleSend = async (event) => {
    event.preventDefault();
    if (!input.trim() || loading || !apiKey || !apiKeyValidated) return;

    const userMessage = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setShowSuggestions(false);
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${normalizeBase(apiBase)}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model || 'grok-4-latest',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            userMessage,
          ],
        }),
      });

      if (!response.ok) {
        let message = 'Grok could not complete that request.';
        try {
          const errorPayload = await response.json();
          message = errorPayload?.error?.message || message;
        } catch (parseError) {
          message = response.statusText || message;
        }
        throw new Error(message);
      }

      const payload = await response.json();
      const reply = (payload.choices?.[0]?.message?.content || '').trim() || 'I could not find an answer.';

      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setError(err.message || 'Something went wrong while contacting Grok.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className={`copilot-toggle ${open ? 'copilot-toggle-open' : ''}`} onClick={() => setOpen((v) => !v)} aria-label="Open Compass Copilot">
        <div className="copilot-toggle-content">
          <Bot className="copilot-toggle-icon" />
          <span className="copilot-toggle-text">Compass Copilot</span>
        </div>
        <div className="copilot-toggle-pulse" />
      </button>

      {open && (
        <div className="copilot-panel">
          <div className="copilot-header">
            <div>
              <p className="copilot-title">Compass Copilot</p>
            </div>
            <button className="copilot-close" onClick={() => setOpen(false)} aria-label="Close chat">
              ✕
            </button>
          </div>

          {!apiKey || !apiKeyValidated ? (
            <div className="copilot-api-key-prompt">
              <p className="copilot-api-key-label">
                {!apiKey ? 'No API key detected' : 'API key not validated'}
              </p>
              <p className="copilot-api-key-message">
                Please configure and validate your API key in{' '}
                <button
                  type="button"
                  onClick={onOpenApiModal}
                  className="copilot-api-key-link"
                  style={{ color: 'hsl(var(--primary))' }}
                >
                  AI API Key Management
                </button>{' '}
                to use Compass Copilot.
              </p>
            </div>
          ) : (
            <div className="copilot-body" ref={listRef}>
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`copilot-message ${message.role === 'assistant' ? 'copilot-message-assistant' : 'copilot-message-user'}`}
              >
                {message.role === 'assistant' && (
                  <div className="copilot-message-avatar">
                    <Bot className="copilot-avatar-icon" />
                  </div>
                )}
                <div className={`copilot-message-content ${message.role === 'user' ? 'copilot-message-content-user' : ''}`}>
                  {message.role === 'assistant' ? (
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  ) : (
                    <p>{message.content}</p>
                  )}
                </div>
              </div>
            ))}
            {showSuggestions && suggestions.length > 0 && (
              <div className="copilot-suggestions">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    className="copilot-suggestion-button"
                    onClick={() => {
                      setInput(suggestion);
                      setShowSuggestions(false);
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
            {loading && <p className="copilot-status">Compass Copilot is thinking…</p>}
          </div>
          )}

          {apiKey && apiKeyValidated && (
            <form className="copilot-input" onSubmit={handleSend}>
              <div className="input-with-hint">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about this assessment…"
                  disabled={loading}
                />
                <span className="enter-hint" aria-hidden="true">
                  Enter ↵
                </span>
              </div>
            </form>
          )}

          {error && <div className="copilot-error">{error}</div>}
        </div>
      )}
    </>
  );
};

export default AssessmentCopilot;
