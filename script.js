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
  const resultLines = [];

  Object.entries(scores).forEach(([anchor, value]) => {
    const p = document.createElement('p');
    p.textContent = `${anchor}: ${value}`;
    app.appendChild(p);
    resultLines.push(`${anchor}: ${value}`);
    if (value > max.value) max = { anchor, value };
  });

  const strong = document.createElement('strong');
  strong.textContent = `\n\nLa tua ancora dominante è: ${max.anchor}`;
  app.appendChild(strong);
  resultLines.push(`Ancora dominante: ${max.anchor}`);

  // Commento descrittivo
  const comment = document.createElement('p');
  comment.style.marginTop = '2em';
  comment.innerHTML = `<em>${getAnchorComment(max.anchor)}</em>`;
  app.appendChild(comment);

  // Radar Chart
  const chartCanvas = document.getElementById('radarChart');
  chartCanvas.style.display = 'block';
  const ctx = chartCanvas.getContext('2d');
  new Chart(ctx, {
    type: 'radar',
    data: {
      labels: Object.keys(scores),
      datasets: [{
        label: 'Punteggio personale',
        data: Object.values(scores),
        backgroundColor: 'rgba(44, 62, 80, 0.2)',
        borderColor: 'rgba(44, 62, 80, 1)',
        pointBackgroundColor: 'rgba(44, 62, 80, 1)'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top'
        },
        title: {
          display: true,
          text: 'Profilo delle Ancore di Carriera'
        }
      }
    }
  });

  // PDF Export
  const pdfBtn = document.createElement('button');
  pdfBtn.textContent = 'Esporta in PDF';
  pdfBtn.onclick = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text('Risultati delle Ancore di Carriera:', 10, 10);
    resultLines.forEach((line, i) => {
      doc.text(line, 10, 20 + i * 10);
    });
    doc.text('\nCommento:', 10, 30 + resultLines.length * 10);
    doc.text(getAnchorComment(max.anchor), 10, 40 + resultLines.length * 10, { maxWidth: 180 });
    doc.save('risultati-ancore-carriera.pdf');
  };
  app.appendChild(pdfBtn);
}

function getAnchorComment(anchor) {
  const comments = {
    'Competenza tecnica/funzionale': 'Ti realizzi approfondendo una specifica area di competenza e diventando un esperto riconosciuto.',
    'Competenza gestionale': 'Hai una forte motivazione nel guidare, decidere e coordinare persone e risorse.',
    'Autonomia/indipendenza': 'Desideri libertà, flessibilità e controllo sui tuoi tempi e obiettivi.',
    'Sicurezza/stabilità': 'Cerchi stabilità economica e prevedibilità per costruire una carriera solida.',
    'Creatività imprenditoriale': 'Ami creare dal nulla, innovare e avviare nuovi progetti anche con rischio.',
    'Servizio/dedizione a una causa': 'Ti guida l’impatto sociale del tuo lavoro e il desiderio di fare la differenza.',
    'Sfida pura': 'Sei spinto dal superare sfide difficili e competere con te stesso e con gli altri.',
    'Stile di vita': 'Cerchi un equilibrio armonico tra vita privata e lavoro, senza sacrificare i tuoi valori.'
  };
  return comments[anchor] || '';
}
