// Kontaktformular.
// Ohne Zieladresse (data-endpoint leer) gibt es zwei Wege, die ohne fremden Dienst auskommen:
// „Per WhatsApp senden“ öffnet WhatsApp mit der fertigen Nachricht, „Per E-Mail senden“ das Mail-Programm.
// Ist eine Zieladresse hinterlegt, schickt der Hauptknopf die Anfrage direkt dorthin.
(function () {
  var form = document.getElementById('anfrage');
  if (!form) return;
  var meldung = form.querySelector('.meldung');
  var knopf = form.querySelector('button[type="submit"]');
  var whatsapp = form.querySelector('[data-weg="whatsapp"]');
  var ziel = form.dataset.endpoint;
  var NUMMER = '491602812351', ADRESSE = 'info@tulemo.de';

  if (!ziel && knopf) knopf.firstChild.nodeValue = 'Per E-Mail senden ';

  function zeige(text, fehler) {
    meldung.textContent = text;
    meldung.classList.toggle('fehler', !!fehler);
    meldung.hidden = false;
  }
  function wert(name) {
    var el = form.elements[name];
    return el ? String(el.value || '').trim() : '';
  }
  // Liest das Formular. Gibt null zurück, wenn Pflichtangaben fehlen.
  function anfrage() {
    if (wert('website')) return null; // Falle für automatische Einträge
    var name = wert('name'), kontakt = wert('kontakt');
    if (!name || !kontakt) {
      zeige('Bitte tragen Sie Ihren Namen und eine Telefonnummer oder E-Mail-Adresse ein.', true);
      (name ? form.elements.kontakt : form.elements.name).focus();
      return null;
    }
    var rueckruf = form.elements.rueckruf && form.elements.rueckruf.checked;
    return {
      betreff: form.dataset.betreff || 'Anfrage über tulemo.de',
      name: name, betrieb: wert('betrieb'), kontakt: kontakt, rueckruf: rueckruf ? 'ja' : 'nein', nachricht: wert('nachricht'),
      zeilen: ['Name: ' + name, 'Betrieb: ' + (wert('betrieb') || '–'), 'Erreichbar unter: ' + kontakt,
               'Rückruf gewünscht: ' + (rueckruf ? 'ja' : 'nein'), '', wert('nachricht') || '(keine Nachricht)']
    };
  }

  if (whatsapp) whatsapp.addEventListener('click', function () {
    var a = anfrage();
    if (!a) return;
    var url = 'https://wa.me/' + NUMMER + '?text=' + encodeURIComponent(a.betreff + '\n\n' + a.zeilen.join('\n'));
    var fenster = window.open(url, '_blank', 'noopener');
    if (!fenster) window.location.href = url;
    zeige('WhatsApp öffnet sich mit der fertigen Nachricht. Bitte dort noch auf „Senden“ tippen.');
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var a = anfrage();
    if (!a) return;

    if (!ziel) {
      window.location.href = 'mailto:' + ADRESSE + '?subject=' + encodeURIComponent(a.betreff) + '&body=' + encodeURIComponent(a.zeilen.join('\n'));
      zeige('Ihr Mail-Programm öffnet sich mit der fertigen Nachricht. Falls nichts passiert, erreichen Sie uns unter ' + ADRESSE + ' oder 0160 2812351.');
      return;
    }

    knopf.disabled = true;
    var daten = { subject: a.betreff, from_name: 'tulemo.de', name: a.name, betrieb: a.betrieb, kontakt: a.kontakt, rueckruf: a.rueckruf, nachricht: a.nachricht };
    if (form.dataset.key) daten.access_key = form.dataset.key;
    fetch(ziel, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(daten) })
      .then(function (r) { if (!r.ok) throw new Error('Antwort ' + r.status); return r; })
      .then(function () {
        form.reset();
        zeige('Danke, Ihre Anfrage ist bei uns angekommen. Wir melden uns schnell bei Ihnen.');
      })
      .catch(function () {
        zeige('Das Senden hat gerade nicht geklappt. Bitte schreiben Sie an ' + ADRESSE + ' oder rufen Sie an: 0160 2812351.', true);
      })
      .then(function () { knopf.disabled = false; });
  });
})();
