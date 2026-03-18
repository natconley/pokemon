/* ----render.js ---------------------------------------------------------
   Ansvarar för att skapa och rita ut DOM-element.
   Bara utseende - ingen datahantering eller logik, det sköts av api.js och app.js.
   ----------------------------------------------------------------------- */

// Skapar och returnerar ett DOM-element som representerar en Pokémon-kort i grid:en.
function createCard(pokemon, index) {
  const card = document.createElement('div');
  card.className = 'card';
  card.style.animationDelay = `${Math.min(index, 20) * 40}ms`;

  const th = getTypeTheme(pokemon.types[0]);

  const getTeamBtnText = () => {
    const { team, waitlist } = _readTeam();
    if (team.includes(pokemon.id)) return 'In Team';
    if (waitlist.includes(pokemon.id)) return 'In Waitlist';
    if (team.length >= 6) return 'Add To Waitlist';
    // returnerar standardtexten om pokemons inte finns i team eller waitlist.
    return 'Add To Team';
  };

  const getTeamBtnClass = () => {
    const { team, waitlist } = _readTeam();
    if (team.includes(pokemon.id)) return 'active';
    if (waitlist.includes(pokemon.id)) return 'active waitlist';
    // returnerar tom sträng om pokemons inte finns i team eller waitlist för att använda standardknappens utseende.
    return '';
  };

  const badges = pokemon.types.map(t => {
    const bth = getTypeTheme(t);
    return `<span class="badge" style="background:${bth.bg}; color:${bth.col};">${t}</span>`;
  }).join('');

  // Bygger kortets struktur enligt HTML strukturen
  // VI ÄR MEDVETNA ATT DETTA ÄR OSÄKERT, DET SKALL UNDVIKAS
  card.innerHTML = `
  <div class="card-glow" style="background: linear-gradient(90deg, ${th.col}88, transparent);"></div>
  <a class="card-link" href="detail.html?id=${pokemon.id}">
    <div class="card-img-wrap" style="background: ${th.bg};">
      <span class="card-number">#${String(pokemon.id).padStart(3, '0')}</span>
      <img src="${pokemon.img}" alt="${pokemon.name}" loading="lazy" />
    </div>
    <div class="card-info">
      <div class="card-name">${pokemon.name}</div>
      <div class="card-types-row">
        <div class="card-types">${badges}</div>
        <button class="btn-team ${getTeamBtnClass()}" data-id="${pokemon.id}">${getTeamBtnText()}</button>
      </div>
    </div>
  </a>
`;

  card.onmouseenter = () => { card.style.boxShadow = `0 20px 50px rgba(0,0,0,.3), 0 0 35px ${th.col}28`; };
  card.onmouseleave = () => { card.style.boxShadow = ''; };

  card.querySelector('.btn-team').addEventListener('click', e => {
    e.preventDefault(); 
    e.stopPropagation();
    toggleTeamMember(pokemon.id);
  });

  document.addEventListener('teamchange', e => {
    if (e.detail.id === pokemon.id) {
      const btn = card.querySelector('.btn-team');
      btn.textContent = getTeamBtnText();
      btn.className = `btn-team ${getTeamBtnClass()}`;
    }
  });

  return card;
}

// Skapar en klickbar filter-chip för en Pokémon-typ.
// Sätter färg på chipet baserat på typen och kopplar onClick vid just klick.
function createChip(type, onClick) {
  const th   = getTypeTheme(type);
  const chip = document.createElement('div');
  chip.className    = 'chip';
  chip.dataset.type = type;
  chip.textContent  = type;
  chip.style.cssText = `background:${th.bg}; border-color:${th.col}; color:${th.col};`;
  chip.addEventListener('click', () => onClick(type));
  return chip;
}

// Ritar ut en lista av Pokémon-kort i gridEl. Rensar först befintliga kort.
//Om listan är tom visas ett meddelande istället.
// Rensar befintliga kort och bygger nya med ett DocumentFragment
// för bättre prestanda (lägger till allt på en gång i DOM:en).
function renderGrid(gridEl, entries) {
  gridEl.innerHTML = '';

  if (!entries.length) {
    gridEl.innerHTML = `<div class="empty"><span>?</span>No Pokémon found</div>`;
    return;
  }

  const fragment = document.createDocumentFragment();
  entries.forEach(({ pokemon }, i) => {
    fragment.appendChild(createCard(pokemon, i));
  });
  gridEl.appendChild(fragment);
}
  