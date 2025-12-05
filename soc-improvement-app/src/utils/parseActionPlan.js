/**
 * Parses the action plan markdown into structured sections:
 * - bluf: The BLUF (Bottom Line Up Front) summary section
 * - lowHangingFruit: The low-hanging fruit recommendations
 * - actionPlan: The main comprehensive action plan
 */
export const parseActionPlan = (markdown) => {
  if (!markdown || !markdown.trim()) {
    return {
      bluf: '',
      lowHangingFruit: '',
      actionPlan: '',
      hasSections: false,
    };
  }

  // Normalize line endings
  const text = markdown.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Try to find sections by headers
  // Look for ## BLUF, ## Low-Hanging Fruit, ## Action Plan (case-insensitive)
  const blufRegex = /^##\s+(?:BLUF|Bottom\s+Line\s+Up\s+Front|Summary|Executive\s+Summary)/im;
  const lowHangingFruitRegex = /^##\s+Low[- ]Hanging\s+Fruit/im;
  const actionPlanRegex = /^##\s+(?:Action\s+Plan|Comprehensive\s+Action\s+Plan|Detailed\s+Action\s+Plan)/im;

  let bluf = '';
  let lowHangingFruit = '';
  let actionPlan = '';
  let hasSections = false;

  // Find BLUF section
  const blufMatch = text.match(blufRegex);
  if (blufMatch) {
    hasSections = true;
    const blufStart = blufMatch.index + blufMatch[0].length;
    // Find the next section or end of text
    const nextSectionMatch = text.slice(blufStart).search(/^##\s+/m);
    if (nextSectionMatch !== -1) {
      bluf = text.slice(blufStart, blufStart + nextSectionMatch).trim();
    } else {
      bluf = text.slice(blufStart).trim();
    }
  }

  // Find Low-Hanging Fruit section
  const lowHangingFruitMatch = text.match(lowHangingFruitRegex);
  if (lowHangingFruitMatch) {
    hasSections = true;
    const lhfStart = lowHangingFruitMatch.index + lowHangingFruitMatch[0].length;
    // Find the next section or end of text
    const nextSectionMatch = text.slice(lhfStart).search(/^##\s+/m);
    if (nextSectionMatch !== -1) {
      lowHangingFruit = text.slice(lhfStart, lhfStart + nextSectionMatch).trim();
    } else {
      lowHangingFruit = text.slice(lhfStart).trim();
    }
  }

  // Find Action Plan section
  const actionPlanMatch = text.match(actionPlanRegex);
  if (actionPlanMatch) {
    hasSections = true;
    const apStart = actionPlanMatch.index + actionPlanMatch[0].length;
    // Everything after this is the action plan
    actionPlan = text.slice(apStart).trim();
  }

  // If no sections found, try to intelligently split by looking for common patterns
  if (!hasSections) {
    // Try to find BLUF by looking for common intro phrases
    const blufPhrases = [
      /^(?:Overall|Executive|Summary|Assessment|Current\s+State)/im,
      /^(?:The\s+organization|This\s+SOC|The\s+assessment)/im,
    ];

    // Try to find low-hanging fruit by looking for keywords
    const lhfPhrases = [
      /(?:Low[- ]Hanging\s+Fruit|Quick\s+Wins|Quick\s+Wins?|Easy\s+Wins?)/i,
      /(?:Immediate|Quick|Fast|Easy).*?(?:improvement|action|win)/i,
    ];

    // If we find these patterns, try to split
    const lines = text.split('\n');
    let currentSection = 'bluf';
    const sections = { bluf: [], lowHangingFruit: [], actionPlan: [] };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if this line starts a new section
      if (lhfPhrases.some(regex => regex.test(line))) {
        currentSection = 'lowHangingFruit';
      } else if (
        currentSection === 'lowHangingFruit' &&
        (line.match(/^\d+\./) || line.match(/^[-*]/)) &&
        i > 5 // Make sure we're not at the very beginning
      ) {
        // If we're in low-hanging fruit and see numbered/bulleted items, might be transitioning
        // But wait for more context
        if (i < lines.length - 3) {
          const nextLines = lines.slice(i, i + 3).join('\n');
          if (nextLines.match(/action\s+plan|comprehensive|detailed/i)) {
            currentSection = 'actionPlan';
          }
        }
      }

      sections[currentSection].push(line);
    }

    if (sections.bluf.length > 0 || sections.lowHangingFruit.length > 0) {
      bluf = sections.bluf.join('\n').trim();
      lowHangingFruit = sections.lowHangingFruit.join('\n').trim();
      actionPlan = sections.actionPlan.join('\n').trim();
      hasSections = bluf || lowHangingFruit || actionPlan;
    }
  }

  // Fallback: if still no sections, put everything in actionPlan
  if (!hasSections || (!bluf && !lowHangingFruit && !actionPlan)) {
    actionPlan = text.trim();
    hasSections = false;
  }

  return {
    bluf: bluf || '',
    lowHangingFruit: lowHangingFruit || '',
    actionPlan: actionPlan || text.trim(),
    hasSections: hasSections && (bluf || lowHangingFruit),
  };
};

