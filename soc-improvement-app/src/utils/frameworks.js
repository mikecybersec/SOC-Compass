import socCmm from '../../frameworks/soc_cmm.json';
import sim3 from '../../frameworks/sim3.json';
import inform from '../../frameworks/inform.json';

const minutesPerQuestion = 1.5;
const minimumEstimateMinutes = 10;

const mapQuestion = (question) => {
  const answerOptions = question.answer_options || [];

  return {
    code: question.code,
    text: question.text,
    type: question.item_type,
    answerOptions,
    guidance: question.guidance,
    placeholder: question.placeholder,
    questionType: question.question_type,
    importanceOptions: question.importance_options,
    isAnswerable: answerOptions.length > 0,
    isSoctom: question.item_type === 'soctom',
  };
};

const flattenTree = (tree) => {
  const aspects = [];
  Object.entries(tree || {}).forEach(([domain, aspectMap]) => {
    Object.entries(aspectMap || {}).forEach(([aspect, questions]) => {
      const mappedQuestions = questions.map(mapQuestion);
      aspects.push({
        domain,
        aspect,
        questions: mappedQuestions,
        questionCount: mappedQuestions.filter((q) => q.isAnswerable).length,
      });
    });
  });
  return aspects;
};

const buildFramework = (id, name, data) => {
  const aspects = flattenTree(data.tree);
  const questionCount = aspects.reduce((total, aspect) => total + (aspect.questionCount || 0), 0);
  const estimatedMinutes = Math.max(
    minimumEstimateMinutes,
    Math.round(questionCount * minutesPerQuestion)
  );

  return {
    id,
    name,
    data,
    aspects,
    questionCount,
    estimatedMinutes,
  };
};

export const frameworks = {
  soc_cmm: buildFramework('soc_cmm', 'SOC-CMM', socCmm),
  sim3: buildFramework('sim3', 'SIM3', sim3),
  inform: buildFramework('inform', 'MITRE INFORM', inform),
};

export const defaultFrameworkId = 'soc_cmm';
