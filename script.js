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
      const val = parseInt(input.value);
      if (!isNaN(val)) {
        responses.push({ id: parseInt(input.dataset.id), value: val });
      }
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
  const validResponses = [];

  window.questions.forEach(q => {
    const response = responses.find(r => r.id === q.id);
    if (response && !isNaN(response.value)) {
      if (!scores[q.anchor]) scores[q.anchor] = 0;
      scores[q.anchor] += response.value;
      validResponses.push(response);
    }
  });

  const app = document.getElementById('app');
  app.innerHTML = '<h2>Risultati:</h2>';

  let max = { anchor: null, value: -1 };
  const resultLines = [];
  const anchors = Object.keys(scores);
  const values = Object.values(scores);
  const average = values.reduce((a, b) => a + b, 0) / anchors.length;
  const aboveAverage = [];

  anchors.forEach(anchor => {
    const value = scores[anchor];
    const p = document.createElement('p');
    p.textContent = `${anchor}: ${value}`;
    app.appendChild(p);
    resultLines.push(`${anchor}: ${value}`);
    if (value > max.value) max = { anchor, value };
    if (value >= average) aboveAverage.push(anchor);
  });

  const dominantComment = getAnchorComment(max.anchor, max.value, average);
  const dominantBox = document.createElement('div');
  dominantBox.style.backgroundColor = '#f0f0f0';
  dominantBox.style.padding = '1em';
  dominantBox.style.marginTop = '2em';
  dominantBox.style.borderRadius = '8px';
  dominantBox.style.border = '1px solid #ccc';
  dominantBox.innerHTML = `
    <h3>La tua ancora dominante è: <em>${max.anchor}</em></h3>
    <p>${dominantComment}</p>
  `;
  app.appendChild(dominantBox);
  resultLines.push(`Ancora dominante: ${max.anchor}`);
  resultLines.push(dominantComment);

  aboveAverage.forEach(anchor => {
    const comment = document.createElement('div');
    comment.style.marginTop = '1em';
    comment.style.padding = '0.75em';
    comment.style.backgroundColor = '#eaf6ff';
    comment.style.borderLeft = '4px solid #3399cc';
    comment.innerHTML = `<strong>${anchor}</strong>: ${getAnchorComment(anchor, scores[anchor], average)}`;
    app.appendChild(comment);
  });

  const guidance = document.createElement('div');
  guidance.style.marginTop = '2em';
  guidance.style.padding = '1em';
  guidance.style.backgroundColor = '#eef';
  guidance.style.border = '1px solid #99c';
  guidance.style.borderRadius = '8px';
  guidance.innerHTML = `<h3>Suggerimenti di carriera e sviluppo</h3><p><strong>${max.anchor}:</strong> ${getCareerSuggestions(max.anchor)}</p>`;
  app.appendChild(guidance);

  showRadarChart(scores);
  addExportButton(resultLines);
}

function getAnchorComment(anchor, score, avg) {
  const intensity = score > avg + 4 ? "in modo particolarmente marcato. " : "";
  const base = {
    'Competenza tecnica/funzionale': `🧠 Competenza tecnica/funzionale\nTi realizzi quando puoi approfondire una specifica area di competenza e raggiungere un alto livello di padronanza tecnica. [...]`,
    'Competenza gestionale': `👔 Competenza gestionale\nTi senti naturalmente attratto dalla possibilità di guidare persone, gestire risorse e prendere decisioni complesse. [...]`,
    'Autonomia/indipendenza': `🕊️ Autonomia/indipendenza\nPer te è fondamentale poter decidere come, quando e con quali modalità lavorare. [...]`,
    'Sicurezza/stabilità': `🛡️ Sicurezza/stabilità\nAttribuisci grande valore alla continuità e alla prevedibilità. [...]`,
    'Creatività imprenditoriale': `🚀 Creatività imprenditoriale\nHai uno spirito pionieristico: ami generare idee nuove, trasformarle in progetti concreti [...].`,
    'Servizio/dedizione a una causa': `❤️ Servizio/dedizione a una causa\nCiò che ti muove è il desiderio di contribuire al bene comune. [...]`,
    'Sfida pura': `🎯 Sfida pura\nAmi confrontarti con obiettivi difficili, superare ostacoli e raggiungere risultati che altri ritengono impossibili. [...]`,
    'Stile di vita': `🌱 Stile di vita\nDai priorità a un equilibrio sostenibile tra lavoro, relazioni personali e tempo per te stesso. [...]`
  };
  return intensity + (base[anchor] || '');
}

function getCareerSuggestions(anchor) {
  const suggestions = {
    'Competenza tecnica/funzionale': 'Valuta master di specializzazione, corsi tecnici avanzati, certificazioni professionali o ruoli da esperto senior. [...]',
    'Competenza gestionale': 'Approfondisci soft skill manageriali, leadership e strategia organizzativa. [...]',
    'Autonomia/indipendenza': 'Cerca percorsi di autoimprenditorialità, digital nomadismo, o micro-consulenza. [...]',
    'Sicurezza/stabilità': 'Orientati verso concorsi pubblici, aziende con welfare forte o percorsi di carriera lineari. [...]',
    'Creatività imprenditoriale': 'Esplora incubatori, startup lab, acceleratori. [...]',
    'Servizio/dedizione a una causa': 'Formati in ambito socioeducativo, coaching, nonprofit management. [...]',
    'Sfida pura': 'Scegli ruoli con target sfidanti, percorsi ad alte performance. [...]',
    'Stile di vita': 'Cerca ambienti flessibili, smart working, forme ibride. [...]'
  };
  return suggestions[anchor] || '';
}

function showRadarChart(scores) {
  const ctx = document.getElementById('radarChart');
  ctx.style.display = 'block';
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

function addExportButton(resultLines) {
  const button = document.createElement('button');
  button.textContent = 'Esporta PDF';
  button.onclick = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 10;
    resultLines.forEach(line => {
      doc.text(line, 10, y);
      y += 10;
    });
    doc.save('ancore_di_carriera.pdf');
  };
  document.getElementById('app').appendChild(button);
}
