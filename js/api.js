/* -- api.js -------------------------------------------------------------
   Hämtar all Pokémon-data från PokeAPI en gång per session.
   Vid nästa sidladdning läses datan från sessionStorage — inga extra nätverksanrop.
   ----------------------------------------------------------------------- */

// Nyckel som används för att spara och läsa cache i sessionStorage
const CACHE_KEY = 'pokedex_data_v1';

/* -- FÄRGTEMAN PER TYP -------------------------------------------------- */
// Varje typ har en accentfärg (col) och en bakgrundsfärg (bg)
// som används på kort och badges i gränssnittet
const TYPE = {
  fire:     { col: '#ff6b35', bg: 'rgba(204, 133, 107, 0.14)'  },
  water:    { col: '#4fc3f7', bg: 'rgba(79,195,247,.14)'  },
  electric: { col: '#f7d02c', bg: 'rgba(247,208,44,.14)'  },
  grass:    { col: '#78c850', bg: 'rgba(120,200,80,.14)'  },
  psychic:  { col: '#f85888', bg: 'rgba(248,88,136,.14)'  },
  normal:   { col: '#c8c8a0', bg: 'rgba(168,168,120,.14)' },
  poison:   { col: '#c060c0', bg: 'rgba(160,64,160,.14)'  },
  rock:     { col: '#c8b040', bg: 'rgba(184,160,56,.14)'  },
  fighting: { col: '#e04030', bg: 'rgba(192,48,40,.14)'   },
  ice:      { col: '#98d8d8', bg: 'rgba(152,216,216,.14)' },
  dragon:   { col: '#7038f8', bg: 'rgba(112,56,248,.14)'  },
  ghost:    { col: '#9070b8', bg: 'rgba(112,88,152,.14)'  },
  steel:    { col: '#c0c0e0', bg: 'rgba(184,184,208,.14)' },
  dark:     { col: '#907060', bg: 'rgba(112,88,72,.14)'   },
  ground:   { col: '#d4b070', bg: 'rgba(210,180,100,.14)' },
  flying:   { col: '#8090d0', bg: 'rgba(128,144,208,.14)' },
  fairy:    { col: '#ffaec9', bg: 'rgba(255,174,201,.14)' },
  bug:      { col: '#a8b820', bg: 'rgba(168,184,32,.14)'  },
};

// Returnerar temat för en typ, eller ett grått standardtema om typen inte finns
function getTypeTheme(type) {
  return TYPE[type] || { col: '#aaa', bg: 'rgba(180,180,180,.12)' };
}

/* -- HJÄLPFUNKTIONER FÖR NÄTVERKSANROP ---------------------------------- */

// Hämtar JSON från en URL — försöker upp till `retries` gånger vid fel
// Väntar lite längre mellan varje nytt försök (300ms, 600ms, 900ms…)
// Används för att hämta både listan på alla Pokémon och deras detaljerade data
async function fetchJSON(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise(r => setTimeout(r, 300 * (i + 1)));
    }
  }
}

// Hämtar många URLs parallellt, i omgångar om `batchSize` stycken
// Anropar onProgress() efter varje omgång för att uppdatera laddningsbaren
// Används för att hämta detaljerad data för alla Pokémon och deras art-data
async function batchFetch(urls, batchSize = 50, onProgress) {
  const results = [];
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize).map(url => fetchJSON(url));
    results.push(...await Promise.all(batch));
    if (onProgress) onProgress(Math.min(i + batchSize, urls.length), urls.length);
  }
  return results;
}

/* -- HJÄLP FÖR EVOLUTIONSKEDJOR ------------------------------------------ */
// PokeAPI returnerar evolutionskedjor som ett träd.
// Den här funktionen plattar ut trädet till en lista med namn
// i evolutionsordning (bas → mellanform → slutform)
function extractChainMembers(node) {
  const names = [node.species.name];
  for (const evo of node.evolves_to) names.push(...extractChainMembers(evo));
  return names;
}

/* -- HUVUDFUNKTION: ladda all data --------------------------------------- */
// Returnerar { CHAINS, POKEMON } där CHAINS är en array av evolutionskedjor,
// t.ex. [ [Bulbasaur, Ivysaur, Venusaur], [Charmander, Charmeleon, Charizard], … ]
async function loadAllPokemon(onProgress) {

  /* Kolla om vi redan har data sparad från tidigare i sessionen */
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      onProgress('Loading from cache…', 99);
      const { CHAINS } = JSON.parse(cached);
      onProgress('Done!', 100);
      return { CHAINS, POKEMON: CHAINS.flat() };
    }
  } catch (_) { /* sessionStorage full eller otillgänglig — hämtar från API istället */ }

  /* 1: hämta listan på alla Pokémon (id, namn och URL till detaljer) */
  onProgress('Fetching Pokémon list…', 0);
  const { results: allEntries } = await fetchJSON('https://pokeapi.co/api/v2/pokemon?limit=10000');

  /* 2: hämta detaljerad data för alla Pokémon i listan — behövs för att bygga korten och typ-chipsen */
  const pokeDetails = await batchFetch(
    allEntries.map(e => e.url),
    50,
    (done, total) => onProgress(`Fetching Pokémon… (${done}/${total})`, (done / total) * 55)
  );

  /* Behåll bara "riktiga" Pokémon (id 1–1025), inte former eller varianter */
  const basePokemon = pokeDetails.filter(p => p.id <= 1025);

  // Bygg en snabb uppslagstabell: id → Pokémon-objekt
  const byId = {};
  for (const p of basePokemon) {
    byId[p.id] = {
      id:    p.id,
      name:  p.name.charAt(0).toUpperCase() + p.name.slice(1),
      types: p.types.map(t => t.type.name),
      img:   `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`,
    };
  }

  /* 3: hämta art-data (species) — behövs för att hitta evolutionskedjornas URLs */
  const allSpecies = await batchFetch(
    basePokemon.map(p => `https://pokeapi.co/api/v2/pokemon-species/${p.id}`),
    50,
    (done, total) => onProgress(`Fetching species… (${done}/${total})`, 55 + (done / total) * 30)
  );

  /* 4: hämta alla unika evolutionskedjor */
  onProgress('Building evolution chains…', 85);
  const chainUrls  = [...new Set(allSpecies.map(s => s.evolution_chain.url))];
  const chainData  = await batchFetch(chainUrls, 50);

  /* 5: sätt ihop CHAINS-listan */
  const seenIds = new Set(); // håller reda på vilka Pokémon vi redan lagt till
  const CHAINS  = [];

  for (const cd of chainData) {
    const members = extractChainMembers(cd.chain)
      .map(name => {
        // Slå upp Pokémon-objektet via art-namnet
        const species = allSpecies.find(s => s.name === name);
        return species ? byId[species.id] : null;
      })
      .filter(Boolean) // ta bort null-värden (Pokémon som filtrerades bort i steg 2)
      .filter(p => {
        // Hoppa över om Pokémon redan finns i en annan kedja
        if (seenIds.has(p.id)) return false;
        seenIds.add(p.id);
        return true;
      });

    if (members.length) {
      // Ordningen från API:et bevaras — det är evolutionsordningen (bas → slutform)
      CHAINS.push(members);
    }
  }

  /* Pokémon som inte ingår i någon kedja får en egen "kedja" med bara sig själv */
  for (const p of Object.values(byId)) {
    if (!seenIds.has(p.id)) CHAINS.push([p]);
  }

  /* Sortera kedjorna efter den lägsta id:n i kedjan
     (t.ex. Pikachu-kedjan sorteras på id 25, inte Pichus id 172) */
  CHAINS.sort((a, b) => Math.min(...a.map(p => p.id)) - Math.min(...b.map(p => p.id)));

  /* Spara i cache för resten av sessionen så att vi slipper ladda om allt */
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ CHAINS }));
  } catch (_) { /* Cache full — kör utan, datan laddas om vid nästa besök */ }

  onProgress('Done!', 100);
  return { CHAINS, POKEMON: CHAINS.flat() };
}