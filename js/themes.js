/* ── TEMA (mörkt / ljust) ────────────────────────── */

// Sätter temat på <html>-elementet, sparar valet och uppdaterar knappens ikon
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('pokedex_theme', theme);
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}
// Läser sparat tema vid start av sidan, annars används mörkt som standard
// Sparar senaste temat i localStorage så att det återanvänds vid nästa besök
function initTheme() {
  applyTheme(localStorage.getItem('pokedex_theme') || 'dark');
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme');
    applyTheme(cur === 'dark' ? 'light' : 'dark');
  });
}
  initTheme();
