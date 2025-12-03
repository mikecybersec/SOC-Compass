import socCmm from '../../frameworks/soc_cmm.json';
import sim3 from '../../frameworks/sim3.json';
import inform from '../../frameworks/inform.json';

const mapQuestion = (question) => ({
  code: question.code,
  text: question.text,
  type: question.item_type,
  answerOptions: question.answer_options || [],
  guidance: question.guidance,
  placeholder: question.placeholder,
  questionType: question.question_type,
  importanceOptions: question.importance_options,
});

const flattenTree = (tree) => {
  const aspects = [];
  Object.entries(tree || {}).forEach(([domain, aspectMap]) => {
    Object.entries(aspectMap || {}).forEach(([aspect, questions]) => {
      aspects.push({
        domain,
        aspect,
        questions: questions.map(mapQuestion),
      });
    });
  });
  return aspects;
};

export const frameworks = {
  soc_cmm: {
    id: 'soc_cmm',
    name: 'SOC-CMM',
    data: socCmm,
    aspects: flattenTree(socCmm.tree),
  },
  sim3: {
    id: 'sim3',
    name: 'SIM3',
    data: sim3,
    aspects: flattenTree(sim3.tree),
  },
  inform: {
    id: 'inform',
    name: 'MITRE INFORM',
    data: inform,
    aspects: flattenTree(inform.tree),
  },
};

export const defaultFrameworkId = 'soc_cmm';
