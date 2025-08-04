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

  const average = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;
  const aboveAverage = [];

  Object.entries(scores).forEach(([anchor, value]) => {
    const p = document.createElement('p');
    p.textContent = `${anchor}: ${value}`;
    app.appendChild(p);
    resultLines.push(`${anchor}: ${value}`);
    if (value > max.value) max = { anchor, value };
    if (value >= average) aboveAverage.push(anchor);
  });

  const strong = document.createElement('strong');
  strong.textContent = `\n\nLa tua ancora dominante è: ${max.anchor}`;
  app.appendChild(strong);
  resultLines.push(`Ancora dominante: ${max.anchor}`);

  aboveAverage.forEach(anchor => {
    const comment = document.createElement('p');
    comment.style.marginTop = '1em';
    comment.innerHTML = `<em><strong>${anchor}</strong>: ${getAnchorComment(anchor, scores[anchor], average)}</em>`;
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
    'Competenza tecnica/funzionale': 'Ti realizzi approfondendo una specifica area di competenza e diventando un esperto riconosciuto. Apprezzi la qualità, l’accuratezza e la crescita verticale nelle tue conoscenze.',
    'Competenza gestionale': 'Hai una forte motivazione nel guidare, decidere e coordinare persone e risorse. Ti entusiasma avere una visione d’insieme e influenzare i risultati dell’organizzazione.',
    'Autonomia/indipendenza': 'Desideri libertà, flessibilità e controllo sui tuoi tempi e obiettivi. Preferisci lavorare per conto tuo o con ampi margini di autonomia.',
    'Sicurezza/stabilità': 'Cerchi stabilità economica e prevedibilità per costruire una carriera solida. Hai bisogno di un contesto professionale sicuro e ben definito.',
    'Creatività imprenditoriale': 'Ami creare dal nulla, innovare e avviare nuovi progetti anche con rischio. Ti appassiona costruire soluzioni originali e guidare iniziative.',
    'Servizio/dedizione a una causa': 'Ti guida l’impatto sociale del tuo lavoro e il desiderio di fare la differenza. Ti realizzi contribuendo a cause più grandi di te.',
    'Sfida pura': 'Sei spinto dal superare sfide difficili e competere con te stesso e con gli altri. Cerchi situazioni dove metterti alla prova costantemente.',
    'Stile di vita': 'Cerchi un equilibrio armonico tra vita privata e lavoro, senza sacrificare i tuoi valori. Per te è essenziale lavorare in modo coerente con il tuo benessere complessivo.'
  };
  return intensity + (base[anchor] || '');
}

function getCareerSuggestions(anchor) {
  const suggestions = {
    'Competenza tecnica/funzionale': 'Valuta master di specializzazione, corsi tecnici avanzati, certificazioni professionali o ruoli da esperto senior. Ambiti: IT, ingegneria, medicina, artigianato specializzato.',
    'Competenza gestionale': 'Approfondisci soft skill manageriali, leadership e strategia organizzativa. Consigliati MBA, project management, coaching per team. Ambiti: management, direzione, consulenza organizzativa.',
    'Autonomia/indipendenza': 'Cerca percorsi di autoimprenditorialità, digital nomadismo, o micro-consulenza. Corsi su gestione del tempo, fiscalità, marketing personale. Ambiti: freelance, consulenza, professioni autonome.',
    'Sicurezza/stabilità': 'Orientati verso concorsi pubblici, aziende con welfare forte o percorsi di carriera lineari. Formazione su gestione amministrativa, compliance, processi. Ambiti: pubblica amministrazione, banche, grandi aziende.',
    'Creatività imprenditoriale': 'Esplora incubatori, startup lab, acceleratori. Segui corsi su business model, pitch, gestione dell’innovazione. Ambiti: startup, innovazione sociale, imprese creative.',
    'Servizio/dedizione a una causa': 'Formati in ambito socioeducativo, coaching, nonprofit management. Esplora progetti ad impatto sociale o in contesti internazionali. Ambiti: ONG, istruzione, salute pubblica.',
    'Sfida pura': 'Scegli ruoli con target sfidanti, percorsi ad alte performance. Ottimi corsi: vendite complesse, problem solving avanzato, business game. Ambiti: sales, sport, competizioni, consulenza strategica.',
    'Stile di vita': 'Cerca ambienti flessibili, smart working, forme ibride. Formati in time management, work-life balance, mindfulness. Ambiti: HR, formazione, benessere, professioni digitali da remoto.'
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
