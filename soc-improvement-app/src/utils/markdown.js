const escapeHtml = (value = '') =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatInline = (text = '') => {
  const escaped = escapeHtml(text);
  const codeFormatted = escaped.replace(/`([^`]+)`/g, '<code>$1</code>');
  const strongFormatted = codeFormatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  return strongFormatted.replace(/\*([^*]+)\*/g, '<em>$1</em>');
};

export const renderMarkdown = (markdown = '') => {
  const lines = markdown.split(/\r?\n/);
  let html = '';
  let inUl = false;
  let inOl = false;

  const closeLists = () => {
    if (inUl) {
      html += '</ul>';
      inUl = false;
    }
    if (inOl) {
      html += '</ol>';
      inOl = false;
    }
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      closeLists();
      return;
    }

    const orderedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (orderedMatch) {
      if (inUl) {
        html += '</ul>';
        inUl = false;
      }
      if (!inOl) {
        html += '<ol>';
        inOl = true;
      }
      html += `<li>${formatInline(orderedMatch[2])}</li>`;
      return;
    }

    const unorderedMatch = trimmed.match(/^[-*+]\s+(.*)$/);
    if (unorderedMatch) {
      if (inOl) {
        html += '</ol>';
        inOl = false;
      }
      if (!inUl) {
        html += '<ul>';
        inUl = true;
      }
      html += `<li>${formatInline(unorderedMatch[1])}</li>`;
      return;
    }

    closeLists();
    html += `<p>${formatInline(trimmed)}</p>`;
  });

  closeLists();
  return html || '<p></p>';
};
