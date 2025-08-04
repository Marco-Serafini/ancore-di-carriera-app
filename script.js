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

  app.innerHTML = '<h2>Ancore di Carriera</h2>';

  const pageContainer = document.createElement('div');

  pageQuestions.forEach(q => {
    const container = document.createElement('div');
    container.className = 'question';
    container.innerHTML = `
      <label>${q.text}</label><br>
      <input type="number" min="1" max="5" data-id="${q.id}" required>
    `;
    pageContainer.appendChild(container);
  });

  const nextBtn = document.createElement('button');
  nextBtn.textContent = (end >= window.questions.length) ? 'Vedi risultato' : 'Avanti';
  nextBtn.onclick = () => {
    const inputs = document.querySelectorAll('input');
    for (let input of inputs) {
      const val = parseInt(input.value);
      if (isNaN(val) || val < 1 || val > 5) {
        alert('Inserisci un valore compreso tra 1 e 5 per ogni domanda.');
        return;
      }
      responses.push({ id: parseInt(input.dataset.id), value: val });
    }

    if (end >= window.questions.length) {
      calculateResults();
    } else {
      currentPage++;
      showPage();
    }
  };

  app.appendChild(pageContainer);
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
  app.innerHTML = '<h2>Risultati</h2>';

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

  const strong = document.createElement('div');
  strong.className = 'box-dominante';
  strong.innerHTML = `<strong>La tua ancora dominante è: ${max.anchor}</strong><br><br>${getAnchorComment(max.anchor, scores[max.anchor], average)}`;
  app.appendChild(strong);
  resultLines.push(`Ancora dominante: ${max.anchor}`);

  const mediaTitle = document.createElement('h3');
  mediaTitle.textContent = 'Ancore sopra la media';
  app.appendChild(mediaTitle);
  resultLines.push('Ancore sopra la media:');

  aboveAverage.forEach(anchor => {
    const comment = document.createElement('p');
    comment.style.marginTop = '1em';
    comment.innerHTML = `<strong>${anchor}</strong><br>${getAnchorComment(anchor, scores[anchor], average)}`;
    app.appendChild(comment);
    resultLines.push(`${anchor}: ${getAnchorComment(anchor, scores[anchor], average)}`);
  });

  const guidance = document.createElement('div');
  guidance.style.marginTop = '2em';
  guidance.style.padding = '1em';
  guidance.style.backgroundColor = '#eef';
  guidance.style.border = '1px solid #99c';
  guidance.style.borderRadius = '8px';
  guidance.innerHTML = `<h3>Suggerimenti di carriera e sviluppo</h3><p><strong>${max.anchor}:</strong> ${getCareerSuggestions(max.anchor)}</p>`;
  app.appendChild(guidance);
  resultLines.push(`Suggerimenti carriera: ${getCareerSuggestions(max.anchor)}`);

  showRadarChart(scores);
  addExportButton(resultLines);
}

function getAnchorComment(anchor, score, avg) {
  const intensity = score > avg + 4 ? "in modo particolarmente marcato. " : "";
  const base = {
    'Competenza tecnica/funzionale': '🧠 Ti realizzi quando puoi approfondire una specifica area di competenza e raggiungere un alto livello di padronanza tecnica. La tua motivazione nasce dal desiderio di eccellere in un campo ben definito, dove le tue conoscenze e abilità siano riconosciute e apprezzate. Ti senti appagato quando vieni consultato come riferimento esperto, e preferisci spesso la profondità alla varietà.\nEsempio: potresti trovarti a tuo agio in ruoli come analista, ingegnere specializzato, medico, artigiano esperto o sviluppatore software, dove il valore si misura in precisione, aggiornamento continuo e competenza tecnica.',
    'Competenza gestionale': '👔 Ti senti naturalmente attratto dalla possibilità di guidare persone, gestire risorse e prendere decisioni complesse. Hai una predisposizione per il coordinamento e una visione strategica che ti spinge a cercare ruoli di responsabilità. Le sfide organizzative ti stimolano, e il tuo senso di realizzazione cresce man mano che il tuo impatto cresce.\nEsempio: potresti eccellere in posizioni di team leader, responsabile di progetto, manager di area, direttore operativo, o in contesti in cui sia necessario mediare, motivare e organizzare.',
    'Autonomia/indipendenza': '🕊️ Per te è fondamentale poter decidere come, quando e con quali modalità lavorare. La tua soddisfazione non deriva solo dai risultati, ma anche dal senso di padronanza e autodeterminazione che provi nel raggiungerli. Apprezzi ambienti poco gerarchici, orientati agli obiettivi più che ai processi.\nEsempio: potresti preferire una carriera da freelance, consulente indipendente, autore, ricercatore, imprenditore individuale o ruoli in organizzazioni che valorizzano il lavoro agile.',
    'Sicurezza/stabilità': '🛡️ Attribuisci grande valore alla continuità e alla prevedibilità. Ti impegni molto e cerchi ambienti che sappiano offrirti certezze a lungo termine, benefici concreti e un’organizzazione strutturata. Non si tratta di mancanza di ambizione, ma di un investimento consapevole nel tempo e nella sicurezza personale e familiare.\nEsempio: potresti preferire ruoli in amministrazione pubblica, grandi aziende stabili, enti regolatori o realtà con piani di carriera definiti e ritmi prevedibili.',
    'Creatività imprenditoriale': '🚀 Hai uno spirito pionieristico: ami generare idee nuove, trasformarle in progetti concreti e accettare il rischio dell’ignoto. L’incertezza per te non è un limite, ma un terreno fertile. Cerchi contesti in cui sperimentare, innovare, proporre soluzioni fuori dagli schemi.\nEsempio: potresti realizzarti come fondatore di una startup, progettista, innovatore, designer strategico o promotore di nuove iniziative in contesti dinamici.',
    'Servizio/dedizione a una causa': '❤️ Ciò che ti muove è il desiderio di contribuire al bene comune. Il tuo lavoro acquista senso se percepisci un impatto positivo sulla vita degli altri o sulla società. Non sei motivato principalmente dal profitto, ma dal significato.\nEsempio: potresti essere portato per il terzo settore, la cooperazione internazionale, l’insegnamento, l’assistenza sociale, la sanità o le attività di advocacy e promozione dei diritti.',
    'Sfida pura': '🎯 Ami confrontarti con obiettivi difficili, superare ostacoli e raggiungere risultati che altri ritengono impossibili. Ti motivano l’adrenalina, la competizione (anche con te stesso), e la possibilità di dimostrare quanto vali sotto pressione.\nEsempio: potresti brillare in ruoli ad alte prestazioni come vendite competitive, sport professionistico, consulenza strategica, gare di innovazione o ambienti in cui la sfida è continua.',
    'Stile di vita': '🌱 Dai priorità a un equilibrio sostenibile tra lavoro, relazioni personali e tempo per te stesso. Lavorare è importante, ma deve essere compatibile con i tuoi valori, il tuo benessere e le tue scelte di vita. Cerchi aziende che comprendano la persona oltre il professionista.\nEsempio: potresti prediligere ruoli in aziende che offrono flessibilità oraria, lavoro da remoto, benefit per la famiglia, o scegliere carriere che non ti costringano a sacrificare troppo il tempo personale.'
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
    let y = 20;
    const lineHeight = 10;
    let page = 1;

    doc.setFontSize(16);
    doc.text('Ancore di Carriera', 10, y);
    y += lineHeight;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('marcoserafini.xyz', 10, y);
    y += lineHeight;
    doc.setDrawColor(150);
    doc.line(10, y, 200, y);
    y += lineHeight;

    doc.setTextColor(0);
    doc.setFontSize(12);

    resultLines.forEach((line, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
        page++;
        doc.setFontSize(16);
        doc.text('Ancore di Carriera', 10, y);
        y += lineHeight;
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text('marcoserafini.xyz', 10, y);
        y += lineHeight;
        doc.setDrawColor(150);
        doc.line(10, y, 200, y);
        y += lineHeight;
        doc.setFontSize(12);
        doc.setTextColor(0);
      }
      const lines = doc.splitTextToSize(line, 180);
      doc.text(lines, 10, y);
      y += lines.length * lineHeight;
    });

    doc.save('ancore_di_carriera.pdf');
  };
  document.getElementById('app').appendChild(button);
}
