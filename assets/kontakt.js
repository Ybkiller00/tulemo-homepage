// Kontaktformular. Ist am Formular eine Zieladresse hinterlegt (data-endpoint), geht die Anfrage dorthin.
// Ohne Zieladresse öffnet sich das Mail-Programm mit der fertigen Nachricht – so geht keine Anfrage ins Leere.
(function () {
  var form = document.getElementById('anfrage');
  if (!form) return;
  var meldung = form.querySelector('.meldung');
  var knopf = form.querySelector('button[type="submit"]');

  function zeige(text, fehler) {
    meldung.textContent = text;
    meldung.classList.toggle('fehler', !!fehler);
    meldung.hidden = false;
  }
  function wert(name) {
    var el = form.elements[name];
    return el ? String(el.value || '').trim() : '';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (wert('website')) return; // Falle für automatische Einträge
    var name = wert('name'), kontakt = wert('kontakt');
    if (!name || !kontakt) {
      zeige('Bitte tragen Sie Ihren Namen und eine Telefonnummer oder E-Mail-Adresse ein.', true);
      (name ? form.elements.kontakt : form.elements.name).focus();
      return;
    }
    var rueckruf = form.elements.rueckruf && form.elements.rueckruf.checked;
    var betreff = form.dataset.betreff || 'Anfrage über tulemo.de';
    var zeilen = [
      'Name: ' + name,
      'Betrieb: ' + (wert('betrieb') || '–'),
      'Erreichbar unter: ' + kontakt,
      'Rückruf gewünscht: ' + (rueckruf ? 'ja' : 'nein'),
      '',
      wert('nachricht') || '(keine Nachricht)'
    ];
    var ziel = form.dataset.endpoint;

    if (!ziel) {
      window.location.href = 'mailto:info@tulemo.de?subject=' + encodeURIComponent(betreff) + '&body=' + encodeURIComponent(zeilen.join('\n'));
      zeige('Ihr Mail-Programm öffnet sich mit der fertigen Nachricht. Falls nichts passiert, erreichen Sie uns unter info@tulemo.de oder 0160 2812351.');
      return;
    }

    knopf.disabled = true;
    var daten = { subject: betreff, from_name: 'tulemo.de', name: name, betrieb: wert('betrieb'), kontakt: kontakt, rueckruf: rueckruf ? 'ja' : 'nein', nachricht: wert('nachricht') };
    if (form.dataset.key) daten.access_key = form.dataset.key;
    fetch(ziel, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(daten) })
      .then(function (r) { if (!r.ok) throw new Error('Antwort ' + r.status); return r; })
      .then(function () {
        form.reset();
        zeige('Danke, Ihre Anfrage ist bei uns angekommen. Wir melden uns schnell bei Ihnen.');
      })
      .catch(function () {
        zeige('Das Senden hat gerade nicht geklappt. Bitte schreiben Sie an info@tulemo.de oder rufen Sie an: 0160 2812351.', true);
      })
      .then(function () { knopf.disabled = false; });
  });
})();
