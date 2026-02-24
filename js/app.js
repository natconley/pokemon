/* -- app.js ---------------------------------------------------------
   Huvudfilen som kopplar ihop allt.
   Hanterar sök, filter, sortering, tema och laddning av data.
   ------------------------------------------------------------------- */

/* -- GLOBAL STATE ---------------------------------------------------
   Dessa variabler håller reda på vad användaren valt.
   De uppdateras när användaren interagerar med sidan. */
let CHAINS       = [];         // Alla evolutionskedjor, t.ex. [[Bulbasaur, Ivysaur, Venusaur], …]
let POKEMON      = [];         // Platt lista av alla Pokémon — används för att bygga typ-chips
let activeType   = 'all';     // Vilket typ-filter är valt? ('all', 'fire', 'water', …)
let visibleCount = 24;        // Antal Pokémon som visas åt gången

/* -- DOM-REFERENSER -------------------------------------------------
   Vi sparar referenser till HTML-element vi behöver manipulera.
   Görs en gång här istället för att söka i DOM:en om och om igen. */
const gridEl      = document.getElementById('grid');
const filtersEl   = document.getElementById('filters');
const searchEl    = document.getElementById('search');
const sortEl      = document.getElementById('sort-select');
const loadingEl   = document.getElementById('loading-overlay');
const loadingText = document.getElementById('loading-msg');
const loadingBar  = document.getElementById('loading-bar');

// Enkel Teamhantering (lokal storage) så render.js kan använda `isInTeam`/`toggleTeamMember`
function _readTeam() {
   try { return new Set(JSON.parse(localStorage.getItem('pokedex_team') || '[]')); }
   catch { return new Set(); }
}
function isInTeam(id) { return _readTeam().has(id); }
function toggleTeamMember(id) {
   const s = _readTeam();
   if (s.has(id)) s.delete(id); else s.add(id);
   localStorage.setItem('pokedex_team', JSON.stringify([...s]));
   document.dispatchEvent(new CustomEvent('teamchange', { detail: { id } }));
}

// Uppdatera laddnings-UI
function setLoading(msg, percent) {
   if (loadingText) loadingText.textContent = msg || '';
   if (loadingBar) loadingBar.style.width = (Number(percent) || 0) + '%';
}

// Bygg typ-chip-listan (behåll befintliga "All" och "Team")
function buildTypeChips() {
   // Ta bort redan skapade chips (utom de fasta i HTML)
   const existing = Array.from(filtersEl.querySelectorAll('.chip')).filter(c => c.id !== 'chip-all' && c.id !== 'chip-team');
   existing.forEach(c => c.remove());

   const types = new Set();
   POKEMON.forEach(p => p.types.forEach(t => types.add(t)));
   Array.from(types).sort().forEach(t => {
      const chip = createChip(t, () => {
         activeType = t;
         // Markera aktiv chip
         filtersEl.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c.dataset.type === t));
         applyFiltersAndRender();
      });
      chip.dataset.type = t;
      filtersEl.appendChild(chip);
   });

   // Hook för "All" och "Team"
   document.getElementById('chip-all')?.addEventListener('click', () => {
      activeType = 'all';
      filtersEl.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c.dataset.type === 'all'));
      applyFiltersAndRender();
   });
   document.getElementById('chip-team')?.addEventListener('click', () => {
      activeType = 'team';
      filtersEl.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c.dataset.type === 'team'));
      applyFiltersAndRender();
   });
}

// Filtrera, sortera och rendera
function applyFiltersAndRender() {
   const q = (searchEl.value || '').trim().toLowerCase();

   let entries = POKEMON.filter(p => {
      if (activeType === 'team' && !isInTeam(p.id)) return false;
      if (activeType !== 'all' && activeType !== 'team' && !p.types.includes(activeType)) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || String(p.id).includes(q);
   });

   const sortVal = sortEl.value;
   if (sortVal === 'az') entries.sort((a, b) => a.name.localeCompare(b.name));
   else if (sortVal === 'number') entries.sort((a, b) => a.id - b.id);

   // Visa bara visibleCount antal
   const visible = entries.slice(0, visibleCount);
   renderGrid(gridEl, visible.map(p => ({ pokemon: p })));

   // Visa/dölj load more-knappen
   const btn = document.getElementById('load-more');
   if (btn) btn.style.display = entries.length > visibleCount ? 'block' : 'none';
}

// Init — hämta data och visa allt
async function init() {
   try {
      setLoading('Starting…', 0);
      const data = await loadAllPokemon((msg, pct) => setLoading(msg, pct));
      CHAINS = data.CHAINS || [];
      POKEMON = data.POKEMON || CHAINS.flat();

      buildTypeChips();
      applyFiltersAndRender();
   } catch (e) {
      setLoading('Error loading data', 100);
      console.error('Failed to load Pokémon:', e);
      gridEl.innerHTML = `<div class="empty"><span>!</span>Could not load Pokémon data</div>`;
   } finally {
      // Dölj overlay efter kort fördröjning
      setTimeout(() => loadingEl && (loadingEl.style.display = 'none'), 400);
   }
}

// Händelsebindningar — nollställ visibleCount vid ny sökning eller sortering
searchEl?.addEventListener('input', () => { visibleCount = 24; applyFiltersAndRender(); });
sortEl?.addEventListener('change', () => { visibleCount = 24; applyFiltersAndRender(); });
document.getElementById('load-more')?.addEventListener('click', () => {
   visibleCount += 24;
   applyFiltersAndRender();
});

// Starta när DOM är redo
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();