// ================================================
// 不在ロック: オーナーが一定期間 事務所ツールを使っていないと、ページの中身を隠す
// 各ツールの <head> で <script src="lock.js"></script> と読み込む
// GASにつながらないときは普通に表示する(電波が悪くても現場で使えるように)
// ================================================
(function () {
  var GAS_URL = 'https://script.google.com/macros/s/AKfycbxKW8JNfxJs2HLOGGRZVWvSgUhsDG-oLFT0Bw0osTJy6wqtc4Ngtg9s_36py_Ae39_J/exec';

  // 確認が終わるまでは中身を見せない
  var hide = document.createElement('style');
  hide.textContent = 'body{visibility:hidden}';
  document.head.appendChild(hide);
  function show() { if (hide.parentNode) hide.parentNode.removeChild(hide); }
  var timer = setTimeout(show, 5000);   // 返事が遅いときは先に表示する

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
      if (j.ok && j.result && j.result.expired) lock();
      else show();
    })
    .catch(function () { clearTimeout(timer); show(); });
})();
