const questions = [
  { domain: 'Balance', text: 'How steady do you feel when walking on uneven ground, such as grass, gravel or a rough path?', answers: ['Steady and confident', 'A little cautious or less confident', 'Unsteady, or I usually avoid it'] },
  { domain: 'Strength', text: 'How do you manage standing up from an ordinary dining chair without using your hands?', answers: ['Comfortably and consistently', 'I can, but it takes effort or more than one attempt', 'I need my hands or another form of support'] },
  { domain: 'Movement', text: 'How easily can you get down to the floor and back up again, using your hands if you wish?', answers: ['Comfortably and confidently', 'Slowly, awkwardly or with some uncertainty', 'I need help, or I avoid getting onto the floor'] },
  { domain: 'Balance', text: 'How confident are you when turning quickly or changing direction while walking?', answers: ['Confident', 'Sometimes cautious or briefly unsteady', 'Often unsteady, or I reach for support'] },
  { domain: 'Strength', text: 'How do you manage a flight of stairs or a reasonable hill?', answers: ['Comfortably', 'I manage, but my legs tire or I need the rail', 'It is very difficult or I usually avoid it'] },
  { domain: 'Movement', text: 'How easily can you bend or lower yourself to reach something near the floor?', answers: ['Comfortably, with different ways to do it', 'With stiffness, effort or some uncertainty', 'Only with support, or I avoid it'] },
  { domain: 'Balance', text: 'In the past year, have you stumbled, had a near-fall or needed to grab something to steady yourself?', answers: ['No, or only in an unusual situation', 'Once or twice', 'Several times, or I have fallen'] },
  { domain: 'Strength', text: 'How confident are you carrying everyday loads such as shopping bags, a full laundry basket or a suitcase?', answers: ['Confident and capable', 'I can, but lighter loads feel more sensible now', 'I struggle, need help or avoid it'] },
  { domain: 'Movement', text: 'How freely can you reach overhead, turn to look behind you and reach across your body?', answers: ['Freely in all these directions', 'One or more directions feel limited', 'These movements are difficult or affect daily tasks'] },
  { domain: 'Balance', text: 'How steady do you feel on stairs, in dim light or when you cannot clearly see the ground?', answers: ['Generally steady and confident', 'More cautious than I used to be', 'Unsteady, or I avoid these situations'] },
  { domain: 'Strength', text: 'Compared with two or three years ago, how capable do your muscles feel in everyday life?', answers: ['About the same or stronger', 'A little less capable', 'Noticeably weaker or less powerful'] },
  { domain: 'Movement', text: 'Do stiffness or restricted movement stop you doing activities that matter to you?', answers: ['Rarely or never', 'Sometimes, or I have adapted how I do them', 'Often, or I have stopped doing some activities'] }
];

const state = { index: 0, answers: [], safety: [] };
const panels = [...document.querySelectorAll('.profile-panel')];
const show = (name) => {
  panels.forEach((panel) => panel.classList.toggle('is-active', panel.dataset.screen === name));
  document.querySelector('.profile-shell')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const renderQuestion = () => {
  const q = questions[state.index];
  document.querySelector('#question-domain').textContent = q.domain;
  document.querySelector('#question-text').textContent = q.text;
  document.querySelector('#progress-label').textContent = `Question ${state.index + 1} of ${questions.length}`;
  document.querySelector('#progress-bar').style.width = `${((state.index + 1) / questions.length) * 100}%`;
  const list = document.querySelector('#answer-list');
  list.innerHTML = '';
  q.answers.forEach((answer, score) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.innerHTML = `<span>${score === 0 ? 'A' : score === 1 ? 'B' : 'C'}</span>${answer}`;
    if (state.answers[state.index]?.score === score) button.classList.add('selected');
    button.addEventListener('click', () => {
      button.blur();
      selectAnswer(score);
    });
    list.appendChild(button);
  });
};

const selectAnswer = (score) => {
  state.answers[state.index] = { domain: questions[state.index].domain, score };
  if (state.index < questions.length - 1) {
    state.index += 1;
    renderQuestion();
  } else {
    renderResult();
    show('result');
  }
};

const scores = () => state.answers.reduce((acc, item) => {
  acc[item.domain] += item.score;
  return acc;
}, { Balance: 0, Movement: 0, Strength: 0 });

const domainContent = {
  Balance: {
    page: 'physio-life-skills.html#priority-list', title: 'Balance may be a useful place to begin',
    summary: 'Your answers suggest that steadiness, balance confidence or adapting to more challenging situations may be the most useful area to explore.',
    copy: 'Your Physio Life Skills assessment can give balance more attention while also exploring relevant strength and movement, then turn the findings into clear personal priorities.'
  },
  Movement: {
    page: 'physio-life-skills.html#priority-list', title: 'Movement may be a useful place to begin',
    summary: 'Your answers suggest that access to positions, freedom of movement or confidence with everyday tasks may be the most useful area to explore.',
    copy: 'Your Physio Life Skills assessment can give movement more attention, including how you reach, turn and change position, alongside relevant strength and balance.'
  },
  Strength: {
    page: 'physio-life-skills.html#priority-list', title: 'Strength may be a useful place to begin',
    summary: 'Your answers suggest that force, power or physical reserve for everyday tasks may be the most useful area to explore.',
    copy: 'Your Physio Life Skills assessment can give strength more attention alongside relevant balance and movement, then help you agree a plan shaped around your life.'
  }
};

const renderResult = () => {
  const result = scores();
  const ordered = Object.entries(result).sort((a, b) => b[1] - a[1]);
  const [primary, primaryScore] = ordered[0];
  const [secondary, secondaryScore] = ordered[1];
  const mixed = primaryScore >= 3 && secondaryScore >= 3 && primaryScore - secondaryScore <= 1;
  const prevention = primaryScore <= 2;
  const safetyFirst = state.safety.some((item) => ['recent', 'pain', 'neuro'].includes(item));
  document.querySelector('#primary-domain').textContent = safetyFirst ? 'a clinical starting point' : prevention ? 'maintaining your foundations' : primary;

  const bars = document.querySelector('#profile-bars');
  bars.innerHTML = ['Balance', 'Movement', 'Strength'].map((domain) => `
    <div><header><strong>${domain}</strong><span>${result[domain]} / 8</span></header><div class="score-track"><i style="width:${(result[domain] / 8) * 100}%"></i></div><small>${result[domain] <= 2 ? 'No strong signal' : result[domain] <= 5 ? 'Worth developing' : 'Clear opportunity'}</small></div>
  `).join('');

  if (safetyFirst) {
    document.querySelector('#result-summary').textContent = 'One or more of your answers suggests that understanding your current symptoms should come before choosing a performance-focused assessment.';
    document.querySelector('#recommendation-title').textContent = 'Consider physiotherapy first';
    document.querySelector('#recommendation-copy').textContent = 'A physiotherapy appointment would allow the problem to be assessed properly. Balance, Movement and Strength can still become part of the plan once the clinical picture is clearer.';
    document.querySelector('#recommendation-link').href = 'physiotherapy.html';
    document.querySelector('#recommendation-link').firstChild.textContent = 'Explore physiotherapy ';
  } else if (prevention) {
    document.querySelector('#result-summary').textContent = 'Your answers did not identify a strong difficulty in Balance, Movement or Strength. That is useful information—and a good reason to protect what you already have.';
    document.querySelector('#recommendation-title').textContent = 'Keep all three life skills in view';
    document.querySelector('#recommendation-copy').textContent = 'You may not have one clear priority to explore now. A balanced routine that continues to challenge strength, balance and varied movement can help you preserve your options.';
    document.querySelector('#recommendation-link').href = 'physio-life-skills.html';
    document.querySelector('#recommendation-link').firstChild.textContent = 'Explore Physio Life Skills ';
  } else {
    const content = domainContent[primary];
    document.querySelector('#result-summary').textContent = content.summary;
    document.querySelector('#recommendation-title').textContent = content.title;
    document.querySelector('#recommendation-copy').textContent = content.copy;
    document.querySelector('#recommendation-link').href = content.page;
    document.querySelector('#recommendation-link').firstChild.textContent = 'Join the 2027 priority list ';
  }

  const secondaryBox = document.querySelector('#secondary-result');
  if (!safetyFirst && mixed) {
    secondaryBox.hidden = false;
    secondaryBox.innerHTML = `<p class="profile-kicker">A connected opportunity</p><h3>${secondary} matters too.</h3><p>Your ${primary} and ${secondary} scores were close. Start with ${primary}, while making sure the assessment considers the ${secondary.toLowerCase()} difficulties you identified.</p>`;
  } else secondaryBox.hidden = true;

  const subject = encodeURIComponent(`My Physio Life Skills profile – ${primary}`);
  const body = encodeURIComponent(`Hello Justin,\n\nI have completed the Physio Life Skills profile.\n\nBalance: ${result.Balance}/8\nMovement: ${result.Movement}/8\nStrength: ${result.Strength}/8\n\nSuggested starting point: ${safetyFirst ? 'Physiotherapy' : prevention ? 'Maintain all three foundations' : primary}\n\nI understand this is a signposting profile, not a clinical assessment.`);
  document.querySelector('#email-profile').href = `mailto:office@justinscriven.co.uk?subject=${subject}&body=${body}`;

  localStorage.setItem('pls-profile-latest', JSON.stringify({ ...result, primary: safetyFirst ? 'Physiotherapy' : prevention ? 'Prevention' : primary, createdAt: new Date().toISOString() }));
};

document.addEventListener('click', (event) => {
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (!action) return;
  if (action === 'safety' || action === 'intro') show(action);
  if (action === 'begin') {
    const checked = [...document.querySelectorAll('.safety-options input:checked')].map((input) => input.value);
    if (!checked.length) return document.querySelector('.safety-options').classList.add('needs-choice');
    state.safety = checked;
    state.index = 0;
    renderQuestion();
    show('question');
  }
  if (action === 'back-question') {
    state.index = Math.max(0, state.index - 1);
    renderQuestion(); show('question');
  }
  if (action === 'print-result') window.print();
  if (action === 'restart') {
    state.index = 0; state.answers = []; state.safety = [];
    document.querySelectorAll('input[type="checkbox"]').forEach((input) => { input.checked = false; });
    show('intro');
  }
});

document.querySelectorAll('.safety-options input').forEach((input) => input.addEventListener('change', () => {
  document.querySelector('.safety-options').classList.remove('needs-choice');
  if (input.value === 'none' && input.checked) document.querySelectorAll('.safety-options input:not([value="none"])').forEach((other) => { other.checked = false; });
  if (input.value !== 'none' && input.checked) document.querySelector('.safety-options input[value="none"]').checked = false;
}));
