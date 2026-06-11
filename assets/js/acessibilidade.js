/**
 * HITBOXE — Painel de Acessibilidade
 */
(function () {
  'use strict';

  const styleVLibras = document.createElement('style');
  styleVLibras.innerHTML = `
    #a11y-fab, #a11y-panel { z-index: 2147483647 !important; }
    
    /* VLibras EM CIMA do ícone do painel (Verticalmente) */
    div[vw] {
      position: fixed !important;
      bottom: 95px !important;  /* Distância exata para ficar acima do botão do painel */
      right: 28px !important;    /* Mesmo alinhamento do botão do painel */
      top: auto !important;
      left: auto !important;
      transform: none !important;
      z-index: 2147483646 !important; /* Atrás do painel se ele abrir */
      pointer-events: none !important; /* Impede a caixa invisível de bloquear os cliques */
    }
    
    /* Mantém o avatar do Libras clicável */
    div[vw] [vw-access-button], div[vw] [vw-plugin-wrapper] {
      pointer-events: auto !important;
    }
    
    /* Animação: Sobe o Libras se abrir o painel */
    body.a11y-panel-open div[vw] {
      bottom: 480px !important;
    }
  `;
  document.head.appendChild(styleVLibras);

  const STORAGE_KEY = 'hitboxe_a11y';
  function loadState() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; } }
  function saveState(obj) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(obj)); } catch {} }

  function injectVLibras() {
    if (document.getElementById('vlibras-widget-script')) return;
    const s = document.createElement('script');
    s.id = 'vlibras-widget-script';
    s.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
    s.onload = () => { try { new window.VLibras.Widget('https://vlibras.gov.br/app'); } catch {} };
    document.head.appendChild(s);
    if (!document.querySelector('[vw]')) {
      const vw = document.createElement('div');
      vw.setAttribute('vw', '');
      vw.className = 'enabled';
      vw.innerHTML = '<div vw-access-button class="active"></div><div vw-plugin-wrapper><div class="vw-plugin-top-wrapper"></div></div>';
      document.body.appendChild(vw);
    }
  }
  injectVLibras();

  /* TTS */
  let ttsActive = false;
  function ttsSpeak(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'pt-BR'; u.rate = 0.95; u.pitch = 1;
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(v => v.lang.startsWith('pt'));
    if (ptVoice) u.voice = ptVoice;
    window.speechSynthesis.speak(u);
  }
  function ttsClickHandler(e) {
    const el = e.target.closest('p, h1, h2, h3, h4, li, label, span, a, button');
    if (!el) return;
    const text = el.innerText || el.textContent;
    if (text && text.trim().length > 2) ttsSpeak(text.trim());
  }
  function enableTTS() {
    ttsActive = true;
    document.body.classList.add('a11y-tts-mode');
    document.addEventListener('click', ttsClickHandler, true);
    ttsSpeak('Leitor ativado.');
  }
  function disableTTS() {
    ttsActive = false;
    document.body.classList.remove('a11y-tts-mode');
    document.removeEventListener('click', ttsClickHandler, true);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }

  /* Filtros */
  const FILTERS = { nenhum: '', deuteranopia:'url(#a11y-deuteranopia)', protanopia:'url(#a11y-protanopia)', tritanopia:'url(#a11y-tritanopia)' };
  function injectSVGFilters() {
    if (document.getElementById('a11y-svg-filters')) return;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('id', 'a11y-svg-filters');
    svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;';
    svg.innerHTML = `<defs>
      <filter id="a11y-deuteranopia"><feColorMatrix type="matrix" values="0.367 0.861 -0.228 0 0 0.280 0.673 0.047 0 0 -0.012 0.043 0.969 0 0 0 0 0 1 0"/></filter>
      <filter id="a11y-protanopia"><feColorMatrix type="matrix" values="0.152 1.053 -0.205 0 0 0.115 0.786 0.099 0 0 -0.004 -0.048 1.052 0 0 0 0 0 1 0"/></filter>
      <filter id="a11y-tritanopia"><feColorMatrix type="matrix" values="1.256 -0.077 -0.179 0 0 -0.078 0.931 0.148 0 0 0.005 0.692 0.303 0 0 0 0 0 1 0"/></filter>
    </defs>`;
    document.body.insertAdjacentElement('afterbegin', svg);
  }
  function applyColorFilter(type) {
    injectSVGFilters();
    document.documentElement.style.filter = FILTERS[type] || '';
    document.body.classList.remove('a11y-deuteranopia','a11y-protanopia','a11y-tritanopia');
    if (type !== 'nenhum') document.body.classList.add('a11y-' + type);
  }

  function buildPanel() {
    const state = loadState();
    const fab = document.createElement('button');
    fab.id = 'a11y-fab';
    fab.innerHTML = `<svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="4" r="2"/><path d="M4 8h16M8 8v8l4-2 4 2V8M12 14v6"/></svg>`;

    const panel = document.createElement('div');
    panel.id = 'a11y-panel';
    panel.innerHTML = `
      <div class="a11y-panel-header">
        <h2 class="a11y-panel-title">Acessibilidade</h2>
        <button id="a11y-close" class="a11y-close-btn"><svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M6 18L18 6M6 6l12 12"/></svg></button>
      </div>
      <div class="a11y-section">
        <div class="a11y-section-label">Leitor de texto</div>
        <button id="a11y-tts-btn" class="a11y-toggle-btn ${state.tts ? 'active' : ''}">
          <span class="a11y-toggle-track"><span class="a11y-toggle-thumb"></span></span>
          <span class="a11y-toggle-label">${state.tts ? 'Ativado' : 'Desativado'}</span>
        </button>
      </div>
      <div class="a11y-section a11y-section--color">
        <div class="a11y-section-label">Modo daltônico</div>
        <div class="a11y-color-options">
          ${[{v:'nenhum',l:'Normal'},{v:'deuteranopia',l:'Deuteranopia'},{v:'protanopia',l:'Protanopia'},{v:'tritanopia',l:'Tritanopia'}].map(o => `
            <label class="a11y-radio-label ${(state.colorFilter||'nenhum')===o.v?'checked':''}">
              <input type="radio" name="a11y-color" value="${o.v}" ${(state.colorFilter||'nenhum')===o.v?'checked':''}><span>${o.l}</span>
            </label>`).join('')}
        </div>
      </div>
    `;
    document.body.appendChild(fab);
    document.body.appendChild(panel);

    function openPanel() { panel.classList.add('open'); document.body.classList.add('a11y-panel-open'); }
    function closePanel() { panel.classList.remove('open'); document.body.classList.remove('a11y-panel-open'); }
    fab.addEventListener('click', () => panel.classList.contains('open') ? closePanel() : openPanel());
    document.getElementById('a11y-close').addEventListener('click', closePanel);

    const ttsBtn = document.getElementById('a11y-tts-btn');
    if (state.tts) enableTTS();
    ttsBtn.addEventListener('click', () => {
      const active = ttsBtn.classList.toggle('active');
      ttsBtn.querySelector('.a11y-toggle-label').textContent = active ? 'Ativado' : 'Desativado';
      active ? enableTTS() : disableTTS();
      saveState({ ...loadState(), tts: active });
    });

    if (state.colorFilter && state.colorFilter !== 'nenhum') applyColorFilter(state.colorFilter);
    panel.querySelectorAll('input[type="radio"]').forEach(radio => {
      radio.addEventListener('change', () => {
        panel.querySelectorAll('.a11y-radio-label').forEach(l => l.classList.remove('checked'));
        radio.closest('.a11y-radio-label').classList.add('checked');
        applyColorFilter(radio.value);
        saveState({ ...loadState(), colorFilter: radio.value });
      });
    });
  }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', buildPanel); } else { buildPanel(); }
})();
