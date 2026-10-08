// ================================================
// 不在ロック: オーナーが一定期間 事務所ツールを使っていないと、ページの中身を隠す
// 各ツールの <head> で <script src="lock.js"></script> と読み込む
// GASにつながらないときは普通に表示する(電波が悪くても現場で使えるように)
// ================================================
(function () {
  var GAS_URL = 'https://script.google.com/macros/s/AKfycbxKW8JNfxJs2HLOGGRZVWvSgUhsDG-oLFT0Bw0osTJy6wqtc4Ngtg9s_36py_Ae39_J/exec';

  // 「ロックされていない」と確認できた時刻を全ツール共通で覚えておく
  // 確認から少しの間は隠さずにすぐ表示して、確認は裏で続ける(ロックされていたらその時点でロック画面にする)
  var OK_KEY = 'officeLockOkAt';
  var OK_TTL = 30 * 60 * 1000;   // 30分
  var recentOk = false;
  try { recentOk = Date.now() - Number(localStorage.getItem(OK_KEY) || 0) < OK_TTL; } catch (e) { /* 使えなくてもOK */ }
  function rememberOk(ok) {
    try { if (ok) localStorage.setItem(OK_KEY, String(Date.now())); else localStorage.removeItem(OK_KEY); } catch (e) { /* 使えなくてもOK */ }
  }

  // 確認が終わるまでは中身を見せない(最近確認済みなら隠さない)
  var hide = document.createElement('style');
  hide.textContent = 'body{visibility:hidden}';
  if (!recentOk) document.head.appendChild(hide);
  function show() { if (hide.parentNode) hide.parentNode.removeChild(hide); }
  var timer = recentOk ? null : setTimeout(show, 5000);   // 返事が遅いときは先に表示する

  function lock() {
    function run() {
      document.title = '利用できません';
      document.body.innerHTML =
        '<style>' +
        '#lockScreen{color-scheme:light dark;position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;' +
        'padding:16px;background:#f5f6f8;color:#172033;font-family:-apple-system,"Hiragino Sans","Noto Sans JP","Yu Gothic UI","Meiryo",sans-serif;text-align:center}' +
        '#lockScreen h1{font-size:22px;margin:0 0 12px}' +
        '#lockScreen p{font-size:16px;line-height:1.8;margin:0}' +
        '@media (prefers-color-scheme: dark){#lockScreen{background:#15171a;color:#e6e8eb}}' +
        '</style>' +
        '<div id="lockScreen"><div><h1>現在このツールは利用できません</h1>' +
        '<p>管理者にお問い合わせください。</p></div></div>';
      show();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
    else run();
  }

  fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ action: 'status' }),
  })
    .then(function (r) { return r.json(); })
    .then(function (j) {
      clearTimeout(timer);
      var expired = !!(j.ok && j.result && j.result.expired);
      if (j.ok) rememberOk(!expired);
      if (expired) lock();
      else show();
    })
    .catch(function () { clearTimeout(timer); show(); });
})();
