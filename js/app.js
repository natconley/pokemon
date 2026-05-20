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

const data = await loadAllPokemon(() => {});
// läser och returnerar team och waitlist från localStorage som två separata arrayer.
// går något fel returneras tomma arrayer.
function _readTeam() {
  try {
    const team = JSON.parse(localStorage.getItem('pokemonTeam') || '[]');
    const waitlist = JSON.parse(localStorage.getItem('pokemonWaitlist') || '[]');
    return { team, waitlist };
  } catch {
    return { team: [], waitlist: [] };
  }
}
// kollar om en Pokémon-id finns i teamet eller waitlist. 
function isInTeam(id) {
  const { team, waitlist } = _readTeam();
  return team.includes(id) || waitlist.includes(id);
}
// Om Pokémon-id finns i team flyttas den till waitlist.
// Om den finns i waitlist flyttas den till team, om laget är färre än sex st.
// Om den inte finns läggs den i team om det finns plats annars i waitlist om den inte är full.
function toggleTeamMember(id) {
  const { team, waitlist } = _readTeam();

  if (team.includes(id)) {
    const updated = team.filter(x => x !== id);
    waitlist.push(id);
    localStorage.setItem('pokemonTeam', JSON.stringify(updated));
    localStorage.setItem('pokemonWaitlist', JSON.stringify(waitlist));
  } else if (waitlist.includes(id)) {
    if (team.length < 6) {
      const updated = waitlist.filter(x => x !== id);
      team.push(id);
      localStorage.setItem('pokemonTeam', JSON.stringify(team));
      localStorage.setItem('pokemonWaitlist', JSON.stringify(updated));
    }
  } else {
    if (team.length < 6) {
      team.push(id);
      localStorage.setItem('pokemonTeam', JSON.stringify(team));
    } else if (waitlist.length < 10) {
      waitlist.push(id);
      localStorage.setItem('pokemonWaitlist', JSON.stringify(waitlist));
    }
  }
  // skickar event så alla korts knappar uppdateras när team/waitlist ändras
  document.dispatchEvent(new CustomEvent('teamchange', { detail: { id } }));
}
/*
// Uppdatera laddnings-UI
function setLoading(msg, percent) {
   if (loadingText) loadingText.textContent = msg || '';
   if (loadingBar) loadingBar.style.width = (Number(percent) || 0) + '%';
}*/

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
   
   const hpsliderval = Number(document.getElementById(`hpslider`).value);

  const defsliderval = Number(document.getElementById(`defslider`).value);

  const attsliderval = Number(document.getElementById(`attslider`).value);

  const weightsliderval = Number(document.getElementById(`weightslider`).value);

  const speedsliderval = Number(document.getElementById(`speedslider`).value);

  const checkedTypes = Array.from(document.querySelectorAll(".filterlist:checked")).map(cb => cb.value);

let entries = POKEMON.filter(p => {
  if (activeType === 'team' && !isInTeam(p.id)) return false;
  if (activeType !== 'all' && activeType !== 'team' && !p.types.includes(activeType)) return false;

  const typeMatch = checkedTypes.length === 0 || checkedTypes.every(type => p.types.includes(type));
  const hpMatch = !hpsliderval || p.HP > hpsliderval;
  const attMatch = !attsliderval || p.attack > attsliderval;
  const defMatch = !defsliderval || p.defence > defsliderval;
  const weightMatch = !weightsliderval || p.weight > weightsliderval;
  const speedMatch = !speedsliderval || p.speed > speedsliderval;
  const searchMatch = !q || p.name.toLowerCase().includes(q) || String(p.id).includes(q);

  // returnerar true om alla aktiva filter stämmer, annars false för att filtrera bort pokemons som inte matchar.
  return typeMatch && hpMatch && attMatch && defMatch && weightMatch && speedMatch && searchMatch;
});

   const sortVal = sortEl.value;
   if (sortVal === 'A-Z') entries.sort((a, b) => a.name.localeCompare(b.name));
   if (sortVal === 'number') entries.sort((a, b) => a.id - b.id);
   if (sortVal === 'Z-A') entries.sort((a,b) => b.name.localeCompare(a.name));
   if (sortVal === "Bywegiht") entries.sort((a,b) => a.weight - b.weight);
   if (sortVal === "HP") entries.sort((a,b) => a.HP - b.HP);
   

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
      const data = await loadAllPokemon();
      CHAINS = data.CHAINS || [];
      POKEMON = data.POKEMON || CHAINS.flat();
      applyFiltersAndRender();
   } catch (e) {
      console.error('Failed to load Pokémon:', e);
      if (gridEl) gridEl.innerHTML = `<div class="empty"><span>!</span>Could not load Pokémon data</div>`;
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