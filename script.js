// File: script.js
let currentPage = 0;
let responses = [];

fetch('anchorsItems.json')
  .then(res => res.json())
  .then(data => {
    window.questions = data;
    showPage();
  });

function showPage() {
  const app = document.getElementById('app');
  const start = currentPage * 5;
  const end = start + 5;
  const pageQuestions = window.questions.slice(start, end);

  app.innerHTML = '';
  pageQuestions.forEach(q => {
    const container = document.createElement('div');
    container.className = 'question';
    container.innerHTML = `
      <label>${q.text}</label><br>
      <input type="number" min="1" max="6" data-id="${q.id}" required>
    `;
    app.appendChild(container);
  });

  const nextBtn = document.createElement('button');
  nextBtn.textContent = (end >= window.questions.length) ? 'Vedi risultato' : 'Avanti';
  nextBtn.onclick = () => {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
      responses.push({ id: parseInt(input.dataset.id), value: parseInt(input.value) });
    });

    if (end >= window.questions.length) {
      calculateResults();
    } else {
      currentPage++;
      showPage();
    }
  };

  app.appendChild(nextBtn);
}

function calculateResults() {
  const scores = {};
  window.questions.forEach(q => {
    const response = responses.find(r => r.id === q.id);
    if (!scores[q.anchor]) scores[q.anchor] = 0;
    scores[q.anchor] += response ? response.value : 0;
  });

  const app = document.getElementById('app');
  app.innerHTML = '<h2>Risultati:</h2>';
  let max = { anchor: null, value: -1 };

  Object.entries(scores).forEach(([anchor, value]) => {
    const p = document.createElement('p');
    p.textContent = `${anchor}: ${value}`;
    app.appendChild(p);
    if (value > max.value) max = { anchor, value };
  });

  const strong = document.createElement('strong');
  strong.textContent = `La tua ancora dominante è: ${max.anchor}`;
  app.appendChild(strong);
}
