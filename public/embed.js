(function () {
  var script = document.currentScript;
  if (!script) return;

  var tenant = (script.getAttribute('data-tenant') || 'za').toLowerCase();
  if (tenant !== 'uk') tenant = 'za';

  var appUrl =
    script.getAttribute('data-app-url') ||
    (tenant === 'uk' ? 'https://app.callkudu.com' : 'https://app.callkudu.co.za');

  var targetId = script.getAttribute('data-target') || 'callkudu-embed';
  var height = script.getAttribute('data-height') || '120';
  var source = script.getAttribute('data-source') || '';

  var container = document.getElementById(targetId);
  if (!container && targetId === 'callkudu-embed') {
    container = document.getElementById('callcaddy-embed');
  }
  if (!container) {
    console.warn('[Call Kudu embed] Container #' + targetId + ' not found');
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
  iframe.setAttribute('allow', 'autoplay');
  iframe.style.width = '100%';
  iframe.style.border = '0';
  iframe.style.display = 'block';
  iframe.style.background = 'transparent';

  // Parent-page modal shell — blurs the marketing site behind the signup wizard.
  var modalRoot = null;
  var modalBackdrop = null;
  var inlineHost = document.createElement('div');
  inlineHost.style.width = '100%';
  var popupHeight = 360;

  function postToIframe(message) {
    if (iframe.contentWindow) {
      iframe.contentWindow.postMessage(message, '*');
    }
  }

  function bindExternalTriggers() {
    var selector = script.getAttribute('data-external-trigger');
    if (!selector) return;
    var nodes = document.querySelectorAll(selector);
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].addEventListener('click', function (event) {
        event.preventDefault();
        postToIframe({ type: 'callkudu-embed-open-request' });
      });
    }
  }

  window.CallKuduEmbed = {
    open: function () {
      postToIframe({ type: 'callkudu-embed-open-request' });
    },
    close: function () {
      postToIframe({ type: 'callkudu-embed-close-request' });
    },
  };

  function applyInlineStyles() {
    iframe.style.position = 'static';
    iframe.style.top = '';
    iframe.style.left = '';
    iframe.style.right = '';
    iframe.style.bottom = '';
    iframe.style.transform = '';
    iframe.style.width = '100%';
    iframe.style.maxWidth = '';
    iframe.style.height = height + 'px';
    iframe.style.minHeight = height + 'px';
    iframe.style.maxHeight = '';
    iframe.style.zIndex = '';
    iframe.style.borderRadius = '12px';
    iframe.style.background = 'transparent';
    iframe.style.boxShadow = '';
    iframe.style.overflow = '';
  }

  function applyModalHeight(nextHeight) {
    var h = Math.max(280, Math.min(720, parseInt(nextHeight, 10) || popupHeight));
    popupHeight = h;
    iframe.style.height = h + 'px';
    iframe.style.minHeight = h + 'px';
    iframe.style.maxHeight = 'min(90vh, ' + h + 'px)';
  }

  function applyModalIframeStyles() {
    applyModalHeight(popupHeight);
    iframe.style.position = 'fixed';
    iframe.style.top = '50%';
    iframe.style.left = '50%';
    iframe.style.right = 'auto';
    iframe.style.bottom = 'auto';
    iframe.style.transform = 'translate(-50%, -50%)';
    iframe.style.width = 'calc(100% - 32px)';
    iframe.style.maxWidth = '440px';
    iframe.style.zIndex = '2147483647';
    iframe.style.borderRadius = '16px';
    iframe.style.background = '#131C2E';
    iframe.style.boxShadow = '0 24px 80px rgba(0,0,0,0.45)';
    iframe.style.overflow = 'hidden';
    iframe.style.pointerEvents = 'auto';
  }

  function collapseHeroSlot(collapsed) {
    if (collapsed) {
      inlineHost.style.height = '0';
      inlineHost.style.minHeight = '0';
      inlineHost.style.overflow = 'hidden';
      container.style.minHeight = '0';
    } else {
      inlineHost.style.height = '';
      inlineHost.style.minHeight = '';
      inlineHost.style.overflow = '';
      container.style.minHeight = '';
    }
  }

  function openModal() {
    if (modalRoot) return;

    modalRoot = document.createElement('div');
    modalRoot.id = 'callkudu-embed-modal-root';
    modalRoot.setAttribute('role', 'dialog');
    modalRoot.setAttribute('aria-modal', 'true');
    modalRoot.setAttribute('aria-label', 'Try Call Kudu');
    modalRoot.style.cssText =
      'position:fixed;inset:0;z-index:2147483646;pointer-events:none;';

    modalBackdrop = document.createElement('div');
    modalBackdrop.style.cssText =
      'position:absolute;inset:0;background:rgba(11,18,33,0.72);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);pointer-events:auto;';
    modalBackdrop.addEventListener('click', function () {
      handleParentCloseRequest();
    });

    modalRoot.appendChild(modalBackdrop);
    document.body.appendChild(modalRoot);
    document.documentElement.style.overflow = 'hidden';

    // Lift iframe to <body> so it escapes hero stacking contexts and sits above the blur.
    document.body.appendChild(iframe);
    collapseHeroSlot(true);
    applyModalIframeStyles();
  }

  function closeModal() {
    if (modalRoot && modalRoot.parentNode) {
      modalRoot.parentNode.removeChild(modalRoot);
    }
    modalRoot = null;
    modalBackdrop = null;
    document.documentElement.style.overflow = '';
    if (iframe.parentNode !== inlineHost) {
      inlineHost.appendChild(iframe);
    }
    applyInlineStyles();
    collapseHeroSlot(false);
  }

  function handleParentCloseRequest() {
    closeModal();
    postToIframe({ type: 'callkudu-embed-close-request' });
  }

  applyInlineStyles();
  inlineHost.appendChild(iframe);
  container.innerHTML = '';
  container.appendChild(inlineHost);
  bindExternalTriggers();

  function isEmbedMessageType(type, suffix) {
    return type === 'callkudu-embed-' + suffix || type === 'callcaddy-embed-' + suffix;
  }

  window.addEventListener('message', function (event) {
    var data = event.data;
    if (!data || typeof data !== 'object') return;
    if (iframe.contentWindow && event.source !== iframe.contentWindow) return;

    if (isEmbedMessageType(data.type, 'overlay')) {
      if (data.open) openModal();
      else closeModal();
      return;
    }

    if (isEmbedMessageType(data.type, 'close-request')) {
      closeModal();
      return;
    }

    if (isEmbedMessageType(data.type, 'resize') && data.height) {
      var h = Math.max(80, parseInt(data.height, 10) || 0);
      if (!modalRoot) {
        iframe.style.height = h + 'px';
        iframe.style.minHeight = h + 'px';
      } else {
        applyModalHeight(h);
      }
    }
  });
})();
