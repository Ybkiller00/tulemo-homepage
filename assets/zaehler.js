// Liest die Kennung aus dem Link der E-Mail (…/amelie/?l=abc123). Es wird nichts auf dem Gerät gespeichert.
// Ist eine Zählstelle eingetragen (window.TULEMO_ZAEHLER), meldet die Seite den Aufruf einmal dorthin.
(function () {
  try {
    var p = new URLSearchParams(location.search), l = p.get('l');
    if (!l || !/^[a-z0-9]{4,12}$/.test(l)) return;
    window.TULEMO_KENNUNG = l;
    var z = window.TULEMO_ZAEHLER;
    if (z && z.url && z.key) {
      fetch(z.url + '/rest/v1/werbung_aufrufe', { method: 'POST', keepalive: true,
        headers: { apikey: z.key, Authorization: 'Bearer ' + z.key, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ code: l, seite: 'amelie' }) }).catch(function () {});
    }
    p.delete('l');
    var rest = p.toString();
    history.replaceState(null, '', location.pathname + (rest ? '?' + rest : '') + location.hash);
  } catch (e) {}
})();
