// script.js

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
  const resultLines = [];

  Object.entries(scores).forEach(([anchor, value]) => {
    const p = document.createElement('p');
    p.textContent = `${anchor}: ${value}`;
    app.appendChild(p);
    resultLines.push(`${anchor}: ${value}`);
  });

  const maxAnchor = Object.entries(scores).reduce((max, entry) => entry[1] > max[1] ? entry : max);

  const dominantBox = document.createElement('div');
  dominantBox.style.backgroundColor = '#eee';
  dominantBox.style.padding = '1em';
  dominantBox.style.margin = '1em 0';
  dominantBox.style.borderRadius = '6px';
  dominantBox.innerHTML = `<strong>La tua ancora dominante è: ${maxAnchor[0]}</strong><br><em>${getAnchorComment(maxAnchor[0])}</em>`;
  app.appendChild(dominantBox);

  const average = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;
  const aboveAverage = Object.entries(scores).filter(([_, v]) => v >= average);

  const section = document.createElement('div');
  section.innerHTML = '<h3>Ancore sopra la media:</h3>';
  aboveAverage.forEach(([anchor]) => {
    const p = document.createElement('p');
    p.innerHTML = `<strong>${anchor}</strong>: <em>${getAnchorComment(anchor)}</em>`;
    section.appendChild(p);
  });
  app.appendChild(section);

  const chart = document.createElement('canvas');
  chart.id = 'radarChart';
  app.appendChild(chart);

  showRadarChart(scores);
  addExportButton(resultLines);
}

function getAnchorComment(anchor) {
  const map = {
    'Competenza tecnica/funzionale': '🧠 Ti realizzi quando puoi approfondire una specifica area di competenza... (descrizione completa)',
    'Competenza gestionale': '👔 Ti senti naturalmente attratto dalla possibilità di guidare persone... (descrizione completa)',
    'Autonomia/indipendenza': '🕊️ Per te è fondamentale poter decidere come, quando e con quali modalità lavorare... (descrizione completa)',
    'Sicurezza/stabilità': '🛡️ Attribuisci grande valore alla continuità e alla prevedibilità... (descrizione completa)',
    'Creatività imprenditoriale': '🚀 Hai uno spirito pionieristico: ami generare idee nuove... (descrizione completa)',
    'Servizio/dedizione a una causa': '❤️ Ciò che ti muove è il desiderio di contribuire al bene comune... (descrizione completa)',
    'Sfida pura': '🎯 Ami confrontarti con obiettivi difficili, superare ostacoli... (descrizione completa)',
    'Stile di vita': '🌱 Dai priorità a un equilibrio sostenibile tra lavoro, relazioni personali... (descrizione completa)'
  };
  return map[anchor] || '';
}

function showRadarChart(scores) {
  const ctx = document.getElementById('radarChart');
  const data = {
    labels: Object.keys(scores),
    datasets: [{
      label: 'Punteggi',
      data: Object.values(scores),
      fill: true,
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgba(54, 162, 235, 1)',
      pointBackgroundColor: 'rgba(54, 162, 235, 1)'
    }]
  };

  new Chart(ctx, {
    type: 'radar',
    data: data,
    options: {
      responsive: true,
      scales: {
        r: {
          angleLines: { display: false },
          suggestedMin: 0,
          suggestedMax: 60
        }
      }
    }
  });
}

function addExportButton(lines) {
  const btn = document.createElement('button');
  btn.textContent = 'Esporta PDF';
  btn.onclick = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 10;
    lines.forEach(line => {
      doc.text(line, 10, y);
      y += 10;
    });
    doc.save('ancore_carriera.pdf');
  };
  document.getElementById('app').appendChild(btn);
}
