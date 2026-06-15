(function () {
  var script = document.currentScript;
  if (!script) return;

  var tenant = (script.getAttribute('data-tenant') || 'za').toLowerCase();
  if (tenant !== 'uk') tenant = 'za';

  var appUrl =
    script.getAttribute('data-app-url') ||
    (tenant === 'uk' ? 'https://app.overtime.talk' : 'https://app.callkudu.co.za');

  var targetId = script.getAttribute('data-target') || 'callcaddy-embed';
  var height = script.getAttribute('data-height') || '64';
  var source = script.getAttribute('data-source') || '';
  var embedBg = 'transparent';
  var parsedHeight = parseInt(height, 10);
  if (Number.isNaN(parsedHeight)) parsedHeight = 64;

  var container = document.getElementById(targetId);
  if (!container) {
    console.warn('[CallCaddy embed] Container #' + targetId + ' not found');
    return;
  }

  var params = new URLSearchParams();
  params.set('tenant', tenant);
  params.set('compact', '1');
  params.set('theme', 'dark');
  if (source) params.set('source', source);

  var iframe = document.createElement('iframe');
  iframe.src = appUrl.replace(/\/$/, '') + '/embed?' + params.toString();
  iframe.title = 'Try your AI phone agent';
  iframe.loading = 'lazy';
  iframe.setAttribute('allow', 'autoplay');
  iframe.style.width = '100%';
  iframe.style.border = '0';
  iframe.style.display = 'block';
  iframe.style.height = parsedHeight + 'px';
  iframe.style.minHeight = '64px';
  iframe.style.maxHeight = '560px';
  iframe.style.borderRadius = '12px';
  iframe.style.background = embedBg;
  iframe.style.transition = 'height 0.2s ease';

  container.innerHTML = '';
  container.appendChild(iframe);

  window.addEventListener('message', function (event) {
    if (!event.data || event.data.type !== 'callcaddy-embed-resize') return;
    var nextHeight = Number(event.data.height);
    if (!Number.isFinite(nextHeight)) return;
    iframe.style.height = Math.max(64, Math.min(560, Math.ceil(nextHeight))) + 'px';
  });
})();
