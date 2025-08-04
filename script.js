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

  app.innerHTML = '<h1>Autovalutazione Ancore di Carriera</h1><p><a href="https://marcoserafini.xyz" target="_blank">marcoserafini.xyz</a></p>';
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
  app.innerHTML = '<h2>Risultati:</h2><p><a href="https://marcoserafini.xyz" target="_blank">marcoserafini.xyz</a></p>';
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

  const dominantBox = document.createElement('div');
  dominantBox.className = 'box-dominante';
  dominantBox.innerHTML = `<strong>La tua ancora dominante è: ${max.anchor}</strong><br>${getAnchorComment(max.anchor)}`;
  app.appendChild(dominantBox);
  resultLines.push(`Ancora dominante: ${max.anchor}`);
  resultLines.push(`${getAnchorComment(max.anchor)}`);

  const heading = document.createElement('h3');
  heading.textContent = 'Ancore sopra la media';
  app.appendChild(heading);
  resultLines.push('Ancore sopra la media:');

  aboveAverage.forEach(anchor => {
    const comment = document.createElement('p');
    comment.innerHTML = `<strong>${anchor}</strong>: ${getAnchorComment(anchor)}`;
    app.appendChild(comment);
    resultLines.push(`${anchor}: ${getAnchorComment(anchor)}`);
  });

  const radarContainer = document.createElement('canvas');
  radarContainer.id = 'radarChart';
  radarContainer.style.maxWidth = '500px';
  radarContainer.style.marginTop = '2em';
  app.appendChild(radarContainer);
  showRadarChart(scores);
  addExportButton(resultLines);
}

function getAnchorComment(anchor) {
  const descriptions = {
    'Competenza tecnica/funzionale': '🧠 Ti realizzi quando puoi approfondire una specifica area di competenza e raggiungere un alto livello di padronanza tecnica. La tua motivazione nasce dal desiderio di eccellere in un campo ben definito, dove le tue conoscenze e abilità siano riconosciute e apprezzate. Ti senti appagato quando vieni consultato come riferimento esperto, e preferisci spesso la profondità alla varietà. Esempio: potresti trovarti a tuo agio in ruoli come analista, ingegnere specializzato, medico, artigiano esperto o sviluppatore software, dove il valore si misura in precisione, aggiornamento continuo e competenza tecnica.',
    'Competenza gestionale': '👔 Ti senti naturalmente attratto dalla possibilità di guidare persone, gestire risorse e prendere decisioni complesse. Hai una predisposizione per il coordinamento e una visione strategica che ti spinge a cercare ruoli di responsabilità. Le sfide organizzative ti stimolano, e il tuo senso di realizzazione cresce man mano che il tuo impatto cresce. Esempio: potresti eccellere in posizioni di team leader, responsabile di progetto, manager di area, direttore operativo, o in contesti in cui sia necessario mediare, motivare e organizzare.',
    'Autonomia/indipendenza': '🕊️ Per te è fondamentale poter decidere come, quando e con quali modalità lavorare. La tua soddisfazione non deriva solo dai risultati, ma anche dal senso di padronanza e autodeterminazione che provi nel raggiungerli. Apprezzi ambienti poco gerarchici, orientati agli obiettivi più che ai processi. Esempio: potresti preferire una carriera da freelance, consulente indipendente, autore, ricercatore, imprenditore individuale o ruoli in organizzazioni che valorizzano il lavoro agile.',
    'Sicurezza/stabilità': '🛡️ Attribuisci grande valore alla continuità e alla prevedibilità. Ti impegni molto e cerchi ambienti che sappiano offrirti certezze a lungo termine, benefici concreti e un’organizzazione strutturata. Non si tratta di mancanza di ambizione, ma di un investimento consapevole nel tempo e nella sicurezza personale e familiare. Esempio: potresti preferire ruoli in amministrazione pubblica, grandi aziende stabili, enti regolatori o realtà con piani di carriera definiti e ritmi prevedibili.',
    'Creatività imprenditoriale': '🚀 Hai uno spirito pionieristico: ami generare idee nuove, trasformarle in progetti concreti e accettare il rischio dell’ignoto. L’incertezza per te non è un limite, ma un terreno fertile. Cerchi contesti in cui sperimentare, innovare, proporre soluzioni fuori dagli schemi. Esempio: potresti realizzarti come fondatore di una startup, progettista, innovatore, designer strategico o promotore di nuove iniziative in contesti dinamici.',
    'Servizio/dedizione a una causa': '❤️ Ciò che ti muove è il desiderio di contribuire al bene comune. Il tuo lavoro acquista senso se percepisci un impatto positivo sulla vita degli altri o sulla società. Non sei motivato principalmente dal profitto, ma dal significato. Esempio: potresti essere portato per il terzo settore, la cooperazione internazionale, l’insegnamento, l’assistenza sociale, la sanità o le attività di advocacy e promozione dei diritti.',
    'Sfida pura': '🎯 Ami confrontarti con obiettivi difficili, superare ostacoli e raggiungere risultati che altri ritengono impossibili. Ti motivano l’adrenalina, la competizione (anche con te stesso), e la possibilità di dimostrare quanto vali sotto pressione. Esempio: potresti brillare in ruoli ad alte prestazioni come vendite competitive, sport professionistico, consulenza strategica, gare di innovazione o ambienti in cui la sfida è continua.',
    'Stile di vita': '🌱 Dai priorità a un equilibrio sostenibile tra lavoro, relazioni personali e tempo per te stesso. Lavorare è importante, ma deve essere compatibile con i tuoi valori, il tuo benessere e le tue scelte di vita. Cerchi aziende che comprendano la persona oltre il professionista. Esempio: potresti prediligere ruoli in aziende che offrono flessibilità oraria, lavoro da remoto, benefit per la famiglia, o scegliere carriere che non ti costringano a sacrificare troppo il tempo personale.'
  };
  return descriptions[anchor] || '';
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
    doc.setFontSize(10);
    doc.setTextColor(40);
    const lineHeight = 8;
    let y = 20;
    doc.text("Autovalutazione Ancore di Carriera", 10, 10);
    doc.setTextColor(100);
    doc.text("marcoserafini.xyz", 10, 15);
    doc.setTextColor(40);
    resultLines.forEach(line => {
      const split = doc.splitTextToSize(line, 180);
      split.forEach(txt => {
        if (y > 270) {
          doc.addPage();
          y = 20;
          doc.text("marcoserafini.xyz", 10, 15);
        }
        doc.text(txt, 10, y);
        y += lineHeight;
      });
    });
    doc.save('ancore_di_carriera.pdf');
  };
  document.getElementById('app').appendChild(button);
}

}
