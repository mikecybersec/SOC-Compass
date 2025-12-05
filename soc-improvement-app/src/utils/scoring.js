const scaleValue = (option, options) => {
  if (!options || options.length === 0) return null;
  const index = options.indexOf(option);
  return index >= 0 ? index + 1 : null;
};

export const computeScores = (framework, answers) => {
  const domainScores = {};
  const aspectScores = {};
  framework.aspects.forEach((aspect) => {
    const key = `${aspect.domain}::${aspect.aspect}`;
    const responseValues = aspect.questions
      .filter((q) => q.isAnswerable)
      .map((q) => {
        const answer = answers[q.code];
        const val = scaleValue(answer, q.answerOptions);
        return val;
      })
      .filter((v) => v !== null);

    const avg = responseValues.length
      ? responseValues.reduce((a, b) => a + b, 0) / responseValues.length
      : 0;
    aspectScores[key] = avg;
    domainScores[aspect.domain] = domainScores[aspect.domain]
      ? [...domainScores[aspect.domain], avg]
      : [avg];
  });

  const domainAverages = Object.fromEntries(
    Object.entries(domainScores).map(([domain, scores]) => [
      domain,
      scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
    ])
  );

  const maturity = Object.values(domainAverages).length
    ? Object.values(domainAverages).reduce((a, b) => a + b, 0) / Object.values(domainAverages).length
    : 0;

  return {
    aspectScores,
    domainScores: domainAverages,
    maturity: Number(maturity.toFixed(2)),
  };
};
