


// URSÄKTA MIN SVENGELSKA

import { capitalizeString, setPokeID } from './pokeUtility.mjs';

// TEAM GALLERY
const teamSlots = document.querySelectorAll(".teamSlot");
const emptyText = document.getElementById("teamEmpty");

// TEAM INFO
const teamInfoTypes = document.getElementById("teamInfoTypes");
const teamInfoCons = document.getElementById("teamInfoCons");
const teamInfoPros = document.getElementById("teamInfoPros");

// const typeBarFill = document.getElementById("typeBarFill");
// const typeBar = document.querySelector(".typeBar")
const typeDescription = document.getElementById("typeCoverageDescription");

// WAITLIST (TEAM FULL)
const waitlistInfo = document.getElementById("waitlistInfo");
const waitlistContainer = document.querySelector(".waitlist")

// SUGGESTED TEAMMEMBERS
const suggestionInfo = document.getElementById("suggestionInfo");
const suggestedContainer = document.querySelector(".suggested");

// POKEMON POOLS FOR SUGGESTIONS
// hårdkodade alternativ för dynamiska teamresultat
// pokemon id
const typePools = {
    steel: [823, 376, 448],
    water: [9, 130, 134],
    fire: [6, 59, 136],
    electric: [26, 135, 181],
    ground: [232, 330, 445],
    ice: [131, 471, 473],
    fighting: [68, 106, 448],
    fairy: [282, 468, 700]
};

const fallbackPool = [149, 248, 373, 143, 197, 445, 150];

const specialAttackers = [65, 94, 196];
const physicalAttackers = [149, 248, 373];

const weaknessPools = {
    hp: [143, 242, 134],
    attack: [68, 149, 445],
    defense: [205, 208, 227],
    "special-attack": [65, 94, 150],
    "special-defense": [197, 242, 378],
    speed: [101, 135, 142]
};

//hårdkodade statmeddelanden
const statStrengths = {
    hp: "Your team can take a lot of hits.",
    attack: "Your team can deal strong physical attacks.",
    defense: "Your team handles physical attacks well.",
    "special-attack": "Your team can pressure opponents with special attacks.",
    "special-defense": "Your team can absorb special attacks effectively.",
    speed: "Your Pokémon can outspeed many opponents."
}

const statWeaknesses = {
    hp: "Your team may go down quickly.",
    attack: "Your team may struggle to break bulky opponents.",
    defense: "Strong physical moves may cause problems.",
    "special-attack": "Your team may struggle to deal special damage.",
    "special-defense": "Special attackers may deal heavy damage.",
    speed: "Opponents may attack first in many battles."
}

// från andreas api.js 
// TYPE färger och function
const TYPE = {
    fire: { col: '#ff6b35', bg: 'rgba(204, 133, 107, 0.14)' },
    water: { col: '#4fc3f7', bg: 'rgba(79,195,247,.14)' },
    electric: { col: '#f7d02c', bg: 'rgba(247,208,44,.14)' },
    grass: { col: '#78c850', bg: 'rgba(120,200,80,.14)' },
    psychic: { col: '#f85888', bg: 'rgba(248,88,136,.14)' },
    normal: { col: '#c8c8a0', bg: 'rgba(168,168,120,.14)' },
    poison: { col: '#c060c0', bg: 'rgba(160,64,160,.14)' },
    rock: { col: '#c8b040', bg: 'rgba(184,160,56,.14)' },
    fighting: { col: '#e04030', bg: 'rgba(192,48,40,.14)' },
    ice: { col: '#98d8d8', bg: 'rgba(152,216,216,.14)' },
    dragon: { col: '#7038f8', bg: 'rgba(112,56,248,.14)' },
    ghost: { col: '#9070b8', bg: 'rgba(112,88,152,.14)' },
    steel: { col: '#c0c0e0', bg: 'rgba(184,184,208,.14)' },
    dark: { col: '#907060', bg: 'rgba(112,88,72,.14)' },
    ground: { col: '#d4b070', bg: 'rgba(210,180,100,.14)' },
    flying: { col: '#8090d0', bg: 'rgba(128,144,208,.14)' },
    fairy: { col: '#ffaec9', bg: 'rgba(255,174,201,.14)' },
    bug: { col: '#a8b820', bg: 'rgba(168,184,32,.14)' },
};

function getTypeTheme(type) {
    return TYPE[type] || { col: '#aaa', bg: 'rgba(180,180,180,.12)' };
}

// CACHE
const pokemonCache = {};

// Ändrar namnen på stats
const statDisplayNames = {
    hp: "HP",
    attack: "Attack",
    defense: "Defense",
    "special-attack": "Special Attack",
    "special-defense": "Special Defense",
    speed: "Speed"
};


// LOAD TEAM
// laddar team från locakStorage, kallar på fetch funktion och renderfunktion
// returnerar tom array om fetch ej fungerat 
async function loadTeam() {
    try {
        // Hämtar id från localStorage, converterar från sträng. Om inget är sparat är teamIds en tom array
        //   OBS: item heter här pokemonTeam
        const teamIds = JSON.parse(localStorage.getItem("pokemonTeam")) || [];
        // Promise.all tillåter att data hämtas från alla idn sparade i localStorage
        const pokemonData = await Promise.all(
            // map omvandlar alla idn till fetch calls
            teamIds.map(id => fetchPokemon(id))
        );
        //Placerar ut informationen i egna slots
        teamSlots.forEach((slot, index) => {
            // Om pokemon finns sparat för att fylla platsen, fyll, annars låt vara tom
            if (pokemonData[index]) {
                renderFilledSlot(slot, pokemonData[index]);
            } else {
                renderEmptySlot(slot, index);
            }
        });
        // Göm text om tomt team om en eller fler pokemon finns
        if (teamIds.length > 0) {
            emptyText.classList.add("hidden");
        } else {
            emptyText.classList.remove("hidden");
        }
        // return för användning i loadStats
        return pokemonData;
    } catch (error) {
        console.error("Error loading team:", error);
        // return empty array för at loadsuggested och teamstats inte ska crasha
        return [];
    }
}

// FETCH POKEMON FROM API
// returnerar pokemon data som objekt eller null om fail
async function fetchPokemon(id) {
    // för att minimera API calls när init körs
    if (pokemonCache[id]) {
        return pokemonCache[id];
    }
    try {
        // Hämtar data från API
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        // Validerar att information kunde hämtas
        // response.ok = statskod 200 - 299, !response.ok = alla andra statuskoder
        if (!response.ok) {
            throw new Error(`Failed to fetch Pokémon ID ${id}. Status: ${response.status}`);
        }
        // Omvandlar till JSON
        const data = await response.json();
        // spara i cache innan return
        pokemonCache[id] = data;
        return data;
    } catch (error) {
        console.error("Error fetching Pokémon", error);
        // loadTeam renderar null som empty slot
        return null;
    }
}


//FILL SLOT W. POKE INFO (img, name, id, types, actions)
// renderar kort med pokemon info och bild
// toggle på knappar för se mer och ta bort
function renderFilledSlot(slot, pokemon) {
    // Tömmer kortets tidigare innehåll, innerHTML bör inte vara en risk här
    slot.innerHTML = "";
    // Ändrar class från empty till filled
    slot.classList.remove("teamSlot--empty");
    slot.classList.add("teamSlot--filled");
    // Ändrar aria-label
    slot.setAttribute("aria-label", `Team member: #${pokemon.id}: ${pokemon.name}`);
    // för att kunna 'tab' igenom korten
    slot.setAttribute("tabindex", "0");

    // eventlistener for button visibility toggle
    slot.addEventListener("click", () => {
        slot.classList.toggle("active");
    });

    //keydown för tillgänglighet
    slot.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            slot.classList.toggle("active");
        }
    });

    // skapar container för bilder och knappar
    const imgWrapper = document.createElement("div");
    imgWrapper.classList.add("imgWrapper");
    // hämtar primärtypens färg
    const wrapperTheme = getTypeTheme(pokemon.types[0].type.name);
    // sätter primärtypens färg som bakgrund
    imgWrapper.style.background = wrapperTheme.bg;

    const btnGroup = document.createElement("div");
    btnGroup.classList.add("btnGroup");

    imgWrapper.appendChild(btnGroup);

    // Skapar bild till slot
    const pokeImg = document.createElement("img");
    pokeImg.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;
    // laddar bild när den är påväg att synas   
    pokeImg.loading = "lazy";
    pokeImg.alt = pokemon.name;

    imgWrapper.appendChild(pokeImg);

    // Lägger till namn och id i ny div
    const slotInfo = document.createElement("div");
    slotInfo.classList.add("slotInfo");

    const nameRow = document.createElement("div");
    nameRow.classList.add("slotNameRow");

    const pokeId = document.createElement("span");
    pokeId.classList.add("pokemonId");
    // använd funktionen för att hämta och sätta # och 0 på id
    setPokeID(pokemon.id, pokeId);

    const pokeName = document.createElement("p");
    pokeName.classList.add("pokemonName");
    // lägger till stor bokstav i början på namnet
    pokeName.textContent = capitalizeString(pokemon.name);

    // append till container div
    nameRow.appendChild(pokeId);
    nameRow.appendChild(pokeName);


    // lägger till types i listformat
    const typesAll = document.createElement("ul");
    typesAll.classList.add("pokemonTypes");
    // loopar igenom types för att ta fram namn
    pokemon.types.forEach(item => {
        //Skapar list items för varje type
        const pokeType = document.createElement("li");
        // Skapar innehåll på list item = type name
        pokeType.textContent = item.type.name;
        // Hämtar stil från getTypeTheme funktionen
        const theme = getTypeTheme(item.type.name);
        pokeType.style.background = theme.bg;
        pokeType.style.color = theme.col;
        // lägger till li i ul
        typesAll.appendChild(pokeType);
    });

    // append till gemensam div
    slotInfo.appendChild(nameRow);
    slotInfo.appendChild(typesAll);


    // DELETE TEAM MEMBER
    //Lägg till radera-knapp med innehåll och aria label
    const pokemonDelete = document.createElement("button");
    pokemonDelete.classList.add("btnDeletePokemon");
    pokemonDelete.setAttribute("aria-label", `Remove ${pokemon.name} from team`);
    const deleteIcon = document.createElement("img");
    deleteIcon.src = "../assets/trash.png";
    deleteIcon.alt = "";
    pokemonDelete.appendChild(deleteIcon);

    // lägger till knapp i bildcontainer för placering
    btnGroup.appendChild(pokemonDelete);

    // event listener för att radera lagmedlem
    pokemonDelete.addEventListener("click", (event) => {
        // to not listen to slot event listener
        event.stopPropagation();
        // confirmationsmeddelande
        const confirmed = confirm(`Do you want to remove ${pokemon.name} from your team?`);
        if (confirmed) {
            const teamIds = JSON.parse(localStorage.getItem("pokemonTeam")) || [];
            // hämtar de idn som är lika med de idn som finns kvar
            const updatedTeam = teamIds.filter(id => id !== pokemon.id);
            // skickar tillbaks uppdaterad array
            localStorage.setItem("pokemonTeam", JSON.stringify(updatedTeam));
            // återställer tom plats och skapar nya suggestions
            init();
        }
    });

    // Lägg till "se mer info" knapp med innehåll och aria label
    const pokemonSee = document.createElement("button");
    pokemonSee.classList.add("btnSeeMore");
    pokemonSee.setAttribute("aria-label", `See more about ${pokemon.name}`);
    const seeIcon = document.createElement("img");
    seeIcon.src = "../assets/eye.png";
    seeIcon.alt = "";
    pokemonSee.appendChild(seeIcon);

    //eventlistener för klick av se mer knapp
    pokemonSee.addEventListener('click', (event) => {
        // to not listen to slot event listener
        event.stopPropagation();
        // navigera till ny sida
        window.location.href = `../pages/detail.html?id=${pokemon.id}`;

    });

    // lägger till knapp i bildcontainer för placering
    btnGroup.appendChild(pokemonSee);

    // Lägger till containers i container
    slot.appendChild(imgWrapper);
    slot.appendChild(slotInfo);
}

// RENDERS SLOT FOR DELETED POKEMON
function renderEmptySlot(slot) {
    // clear slot contents
    slot.innerHTML = "";
    // change class from teamSlot--filled to teamSlot--empty
    slot.classList.remove("teamSlot--filled");
    slot.classList.add("teamSlot--empty");
    // change aria-label
    slot.setAttribute("aria-label", "Team slot, empty. Add Pokémon.");
    // add q-mark img
    const emptyImg = document.createElement("img");
    emptyImg.src = "../assets/q-mark.png";
    emptyImg.alt = "";
    // add to slot
    slot.appendChild(emptyImg);
}

// GET AND COMBINES INDIVIDUAL STATS FOR TEAM STATS
// Returns teamStats objekt
function loadStats(pokemonData) {
    // tomt objekt för att lagra resultat
    const teamStats = {};
    // array med types inuti objektet
    teamStats.types = [];
    // filtrera bort null
    const validPokemon = pokemonData.filter(pokemon => pokemon !== null);

    // loopa igenom pokemon 
    validPokemon.forEach(pokemon => {
        // loopa igenom types
        pokemon.types.forEach(t => {
            // push type names to stat object
            teamStats.types.push(t.type.name);
        });
        // loopa igenom stats
        pokemon.stats.forEach(s => {
            // stats namn
            const statName = s.stat.name;
            // stats namn + kombinerade resultat
            teamStats[statName] = (teamStats[statName] || 0) + s.base_stat;
        });
    });
    return teamStats;
}


// LOAD WAITLIST
// laddar väntlista från localStorage, använder fetchfunktion och renderfunktion
async function loadWaitlist() {
    try {
        // Hämta id fron localStorage, convertera till sträng. Om inget är sparat är waitlistIds en tom array
        // OBS: item heter här pokemonWaitlist
        const waitlistIds = JSON.parse(localStorage.getItem("pokemonWaitlist")) || [];
        // om det inte finns sparade pokemons, gör ingenting
        if (waitlistIds.length === 0) {
            //lägg tillbaks info för tom lista
            waitlistInfo.classList.remove("hidden");
            waitlistContainer.innerHTML = "";
            return;
        }
        waitlistInfo.classList.add("hidden");
        // Töm waitlist på placeholders
        waitlistContainer.innerHTML = "";
        // fyll slots med pokemons
        // Promise.all tillåter att data hämtas från alla idn sparade i localStorage
        const pokemonData = await Promise.all(
            // map omvandlar alla idn till fetch calls
            waitlistIds.map(id => fetchPokemon(id))
        );
        //Skapar och placerar ut informationen i egna slots
        pokemonData.forEach(pokemon => {
            if (pokemon) {
                const slot = document.createElement("li");
                renderFilledCarousel(slot, pokemon);
                waitlistContainer.appendChild(slot);
            }
        });
    } catch (error) {
        console.error("Could not load waitlist:", error);
        return;
    }
}

// FILL WAITLIST SLOT W. POKE INFO (img, name, id, types, actions)
// renderar kort i väntlista med pokemon info och bild
// eventlistener för add to team, delete och see more knappar
function renderFilledCarousel(slot, pokemon) {
    // Tömmer kortets tidigare innehåll, innerHTML bör inte vara en risk här
    slot.innerHTML = "";
    // Ändrar class från empty till filled
    slot.classList.remove("waitSlot--empty");
    slot.classList.add("waitSlot--filled");
    // Ändrar aria-label
    slot.setAttribute("aria-label", `Saved pokémon: #${pokemon.id}: ${pokemon.name}`);
    // för att kunna 'tab' igenom korten
    slot.setAttribute("tabindex", "0");

    // eventlistener for button visibility toggle
    slot.addEventListener("click", () => {
        slot.classList.toggle("active");
    });

    //keydown för tillgänglighet
    slot.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            slot.classList.toggle("active");
        }
    });

    // skapar container för bilder och knappar
    const imgWrapper = document.createElement("div");
    imgWrapper.classList.add("imgWrapper");
    // hämtar primärtypens färg
    const wrapperTheme = getTypeTheme(pokemon.types[0].type.name);
    // sätter primärtypens färg som bakgrund
    imgWrapper.style.background = wrapperTheme.bg;

    const btnGroup = document.createElement("div");
    btnGroup.classList.add("btnGroup");

    imgWrapper.appendChild(btnGroup);

    // Skapar bild till slot
    const pokeImg = document.createElement("img");
    pokeImg.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;
    // laddar bild när den är påväg att synas   
    pokeImg.loading = "lazy";
    pokeImg.alt = pokemon.name;

    imgWrapper.appendChild(pokeImg);

    // Lägger till namn och id i ny div
    const slotInfo = document.createElement("div");
    slotInfo.classList.add("slotInfo");

    const nameRow = document.createElement("div");
    nameRow.classList.add("slotNameRow");

    const pokeName = document.createElement("p");
    pokeName.classList.add("pokemonName");
    // lägger till stor bokstav i början på namnet
    pokeName.textContent = capitalizeString(pokemon.name);

    const pokeId = document.createElement("span");
    pokeId.classList.add("pokemonId")
    // använd funktionen för att hämta och sätta # och 0 på id
    setPokeID(pokemon.id, pokeId);

    nameRow.appendChild(pokeId);
    nameRow.appendChild(pokeName);

    // lägger till types i listformat
    const typesAll = document.createElement("ul");
    typesAll.classList.add("pokemonTypes");
    // loopar igenom types för att ta ut namn på alla types
    pokemon.types.forEach(item => {
        //Skapar list items för varje type
        const pokeType = document.createElement("li");
        // Skapar innehåll på list item = type name
        pokeType.textContent = item.type.name;
        // hämtar type style från getTypeTheme funktionen
        const theme = getTypeTheme(item.type.name);
        pokeType.style.background = theme.bg;
        pokeType.style.color = theme.col;
        // lägger till li i ul
        typesAll.appendChild(pokeType);
    });

    // append alla till container div
    slotInfo.appendChild(nameRow);
    slotInfo.appendChild(typesAll);

    // DELETE FROM WAITLIST
    //Lägg till radera-knapp med innehåll och aria label
    const pokemonDelete = document.createElement("button");
    pokemonDelete.setAttribute("aria-label", `Remove ${pokemon.name} from waitlist`);
    const deleteIcon = document.createElement("img");
    deleteIcon.src = "../assets/trash.png";
    deleteIcon.alt = "";
    pokemonDelete.appendChild(deleteIcon);

    // lägger till knapp i bildcontainer för placering
    btnGroup.appendChild(pokemonDelete);

    // event listener för att radera från sparade
    pokemonDelete.addEventListener("click", (event) => {
        // to not listen to slot event listener
        event.stopPropagation();
        // confirmation message
        const confirmed = confirm(`Do you want to remove ${pokemon.name} from your waitlist?`);
        if (confirmed) {
            const waitlistIds = JSON.parse(localStorage.getItem("pokemonWaitlist")) || [];
            // hämtar de idn som är lika med de idn som finns kvar
            const updatedWaitlist = waitlistIds.filter(id => id !== pokemon.id);
            // skickar tillbaks uppdaterad array
            localStorage.setItem("pokemonWaitlist", JSON.stringify(updatedWaitlist));
            // återställer tom slot 
            loadWaitlist();
        }
    });

    // ADD TO TEAM
    //Lägg till "add to team" knapp med innehåll och aria label
    const addToTeam = document.createElement("button");
    addToTeam.classList.add("addToTeam");
    addToTeam.setAttribute("aria-label", `Add ${pokemon.name} to your team`);
    const plusIcon = document.createElement("img");
    plusIcon.src = "../assets/plus.png";
    plusIcon.alt = "";
    addToTeam.appendChild(plusIcon);
    // lägger till knapp i bildcontainer för placering
    btnGroup.appendChild(addToTeam);

    // Event listener för att lägga till pokemon i team
    addToTeam.addEventListener("click", (event) => {
        // to not listen to slot event listener
        event.stopPropagation();
        // Hämtar id från localStorage, converterar från sträng.       
        const teamIds = JSON.parse(localStorage.getItem("pokemonTeam")) || [];
        // fråga om de vill lägga till i team, om nej - återgå
        const confirmed = confirm(`Add ${pokemon.name} to your team?`);
        if (!confirmed) return;
        // Kolla om pokemon är i team, alert om den är det
        if (teamIds.includes(pokemon.id)) {
            alert(`${pokemon.name} is already in your team!`);
            return;
        }
        //Ta reda på om Det finns plats att lägga till i team (under 6 finns plats, annars fullt)
        if (teamIds.length < 6) {
            // lägg till i team array
            teamIds.push(pokemon.id);
            // skickar tillbaks uppdaterad pokemonTeam
            localStorage.setItem("pokemonTeam", JSON.stringify(teamIds));
            // ta bort från waitlist array
            const waitlistIds = JSON.parse(localStorage.getItem("pokemonWaitlist")) || [];
            // hämtar de idn som är lika med de idn som finns kvar    
            const updatedWaitlist = waitlistIds.filter(id => id !== pokemon.id);
            // skickar tillbaks uppdaterad pokemonWaitlist
            localStorage.setItem("pokemonWaitlist", JSON.stringify(updatedWaitlist));
            init();
        } else {
            alert("Your team is full! Remove a Pokémon to add another.");
        }
    });

    // Lägg till "se mer info" knapp med innehåll och aria label
    const pokemonSee = document.createElement("button");
    pokemonSee.classList.add("btnSeeMore");
    pokemonSee.setAttribute("aria-label", `See more about ${pokemon.name}`);
    const seeIcon = document.createElement("img");
    seeIcon.src = "../assets/eye.png";
    seeIcon.alt = "";
    pokemonSee.appendChild(seeIcon);
    btnGroup.appendChild(pokemonSee);

    //eventlistener för klick av se mer knapp
    pokemonSee.addEventListener('click', (event) => {
        // to not listen to slot event listener
        event.stopPropagation();
        // navigera till ny sida
        window.location.href = `../pages/detail.html?id=${pokemon.id}`;
    });

    // Lägger in det skapade i förälderelement
    slot.appendChild(imgWrapper);
    slot.appendChild(slotInfo);

}
// LOAD SUGGESTIONS
// hämtar/laddar och renderar tre suggestionskort baserat på teamanalysis
// empty state meddelande om team ej har pokemon
async function loadSuggested(pokemonData, teamStats) {
    // töm på tidigare innehåll
    suggestedContainer.innerHTML = "";
    // ser till att pokemon finns & att id är rätt
    const validPokemon = pokemonData.filter(pokemon => pokemon !== null);
    const teamIds = validPokemon.map(pokemon => pokemon.id);

    // om pokemon, ta bort text
    if (validPokemon.length === 0) {
        suggestionInfo.classList.remove("hidden");
        return;
    }
    suggestionInfo.classList.add("hidden");

    try {
        // takes keys(types) from typePools and finds a non match in team.
        const missingType = Object.keys(typePools).find(type => !teamStats.types.includes(type));

        // get pokemon pool for missing type, if types from pool is covered, pick from fallbackPool
        const typePool = missingType ? typePools[missingType] : fallbackPool;
        // remove pokemon on team from pool
        const availableTypePool = typePool.filter(id => !teamIds.includes(id));
        //randomize type pool pick
        const typeSuggestionId = availableTypePool[Math.floor(Math.random() * availableTypePool.length)];

        // BALANCE suggestion
        let balanceSuggestionId;
        // if physical attack is higher than special attack, suggest special attacker, else suggest physical attacker
        if (teamStats.attack > teamStats["special-attack"]) {
            // remove from pokemon pool, pokemon already in team
            const availableSpecialAttackers = specialAttackers.filter(id => !teamIds.includes(id));
            // pick random pokemon from pokemon in pool, not in team
            balanceSuggestionId = availableSpecialAttackers[Math.floor(Math.random() * availableSpecialAttackers.length)];
        } else {
            // remove pokemon already in team from suggestion pool
            const availableAttackers = physicalAttackers.filter(id => !teamIds.includes(id));
            // pick random pokemon from pokemon in pool, not in team
            balanceSuggestionId = availableAttackers[Math.floor(Math.random() * availableAttackers.length)];
        }

        // STAT WEAKNESS suggestion (lowest stat)
        // reduce compares stats and keeps the lowest, weakestStat is name of found lowest stat
        const weakestStat = Object.keys(weaknessPools).reduce((lowest, current) => {
            // if current stat is lower than lowest so far, replace as lowest, if not keep previous lowest
            return teamStats[current] < teamStats[lowest] ? current : lowest;
        });
        // remove pokemon already in team from suggestion pool
        let availablePool = weaknessPools[weakestStat].filter(id => !teamIds.includes(id));
        // pick random from suggestion pool
        let weaknessSuggestionId = availablePool[Math.floor(Math.random() * availablePool.length)];
        // if all suggested are in team, use fallbackpool
        // -------alternatively change to next lowest stat if theres an available pokemon in it ????
        if (availablePool.length === 0) {
            availablePool = fallbackPool.filter(id => !teamIds.includes(id));
            weaknessSuggestionId = availablePool[Math.floor(Math.random() * availablePool.length)];
        }

        const suggestionData = await Promise.all([
            fetchPokemon(typeSuggestionId),
            fetchPokemon(balanceSuggestionId),
            fetchPokemon(weaknessSuggestionId)
        ]);

        suggestionData.forEach(pokemon => {
            if (pokemon) {
                const slot = document.createElement("li");
                renderFilledSuggestions(slot, pokemon);
                suggestedContainer.appendChild(slot);
            }
        });
    } catch (error) {
        console.error("Could not load suggestions:", error);
        return;
    }
}

// RENDER SUGGESTION SLOT
// renderar suggestion slots med info och bild
// eventlisteners för knappar see more och add to team
function renderFilledSuggestions(slot, pokemon) {
    // Tömmer kortets tidigare innehåll, innerHTML bör inte vara en risk här
    slot.innerHTML = "";
    // Ändrar class från empty till filled
    slot.classList.remove("sugSlot--empty");
    slot.classList.add("sugSlot--filled");
    // Ändrar aria-label
    slot.setAttribute("aria-label", `Suggested pokémon: #${pokemon.id}: ${pokemon.name}`);
    // för att kunna 'tab' igenom korten
    slot.setAttribute("tabindex", "0");

    // eventlistener for button visibility toggle
    slot.addEventListener("click", () => {
        slot.classList.toggle("active");
    });

    //keydown för tillgänglighet
    slot.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            slot.classList.toggle("active");
        }
    });

    // skapar container för bilder och knappar
    const imgWrapper = document.createElement("div");
    imgWrapper.classList.add("imgWrapper");
    // hämtar primärtypens färg
    const wrapperTheme = getTypeTheme(pokemon.types[0].type.name);
    // sätter primärtypens färg som bakgrund
    imgWrapper.style.background = wrapperTheme.bg;

    const btnGroup = document.createElement("div");
    btnGroup.classList.add("btnGroup");

    imgWrapper.appendChild(btnGroup);

    // Skapar bild till slot
    const pokeImg = document.createElement("img");
    pokeImg.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;
    // laddar bild när den är påväg att synas   
    pokeImg.loading = "lazy";
    pokeImg.alt = pokemon.name;

    imgWrapper.appendChild(pokeImg);

    // lägger till namn och id i ny div
    const slotInfo = document.createElement("div");
    slotInfo.classList.add("slotInfo");

    const nameRow = document.createElement("div");
    nameRow.classList.add("slotNameRow");

    const pokeName = document.createElement("p");
    pokeName.classList.add("pokemonName");
    // lägger till stor bokstav i början på namnet
    pokeName.textContent = capitalizeString(pokemon.name);

    const pokeId = document.createElement("span");
    pokeId.classList.add("pokemonId")
    // använd funktionen för att hämta och sätta # och 0 på id
    setPokeID(pokemon.id, pokeId);

    // append till container
    nameRow.appendChild(pokeId);
    nameRow.appendChild(pokeName);


    // lägger till types i listformat
    const typesAll = document.createElement("ul");
    typesAll.classList.add("pokemonTypes");
    // loopar igenom types för att ta ut namn på alla types
    pokemon.types.forEach(item => {
        //Skapar list items för varje type
        const pokeType = document.createElement("li");
        // Skapar innehåll på list item = type name
        pokeType.textContent = item.type.name;
        // hämtar teman från getThemeType funktionen
        const theme = getTypeTheme(item.type.name);
        pokeType.style.background = theme.bg;
        pokeType.style.color = theme.col;
        // lägger till li i ul
        typesAll.appendChild(pokeType);
    });

    // append till gemensam div
    slotInfo.appendChild(nameRow);
    slotInfo.appendChild(typesAll);


    //Lägg till "add to team" knapp med innehåll och aria label
    const addToTeam = document.createElement("button");
    addToTeam.classList.add("addToTeam");
    addToTeam.setAttribute("aria-label", `Add ${pokemon.name} to your team`);
    const plusIcon = document.createElement("img");
    plusIcon.src = "../assets/plus.png";
    plusIcon.alt = "";
    addToTeam.appendChild(plusIcon);
    btnGroup.appendChild(addToTeam);

    // Event listener för att lägga till pokemon i team
    addToTeam.addEventListener("click", (event) => {
        // to not listen to slot event listener
        event.stopPropagation();
        // Hämtar id från localStorage, converterar från sträng.       
        const teamIds = JSON.parse(localStorage.getItem("pokemonTeam")) || [];
        // Kolla om pokemon är i team, alert om den är det
        if (teamIds.includes(pokemon.id)) {
            alert(`${pokemon.name} is already in your team!`);
            return;
        }

        //Ta reda på om Det finns plats att lägga till i team (under 6 finns plats, annars fullt)
        if (teamIds.length < 6) {
            const confirmed = confirm(`Add ${pokemon.name} to your team?`)
            if (!confirmed) return
            // lägg till i team array
            teamIds.push(pokemon.id);
            // skickar tillbaks uppdaterad pokemonTeam
            localStorage.setItem("pokemonTeam", JSON.stringify(teamIds));
            // updatera team
            //init laddar om sidan
            init();

        } else {
            // fråga om att lägga till i waitlist
            const confirmedWaitlist = confirm(`Your team is full. Add ${pokemon.name} to the waitlist?`)
            if (!confirmedWaitlist) return

            const waitlistIds = JSON.parse(localStorage.getItem("pokemonWaitlist")) || [];

            if (!waitlistIds.includes(pokemon.id)) {
                waitlistIds.push(pokemon.id);
                localStorage.setItem("pokemonWaitlist", JSON.stringify(waitlistIds));
                loadWaitlist();
            } else {
                alert("This pokemon is already in your waitlist!");
            }
        }
    });
    // Lägg till "se mer info" knapp med innehåll och aria label
    const pokemonSee = document.createElement("button");
    pokemonSee.classList.add("btnSeeMore");
    pokemonSee.setAttribute("aria-label", `See more about ${pokemon.name}`);
    const seeIcon = document.createElement("img");
    seeIcon.src = "../assets/eye.png";
    seeIcon.alt = "";
    pokemonSee.appendChild(seeIcon);

    btnGroup.appendChild(pokemonSee);

    //eventlistener för klick av se mer knapp
    pokemonSee.addEventListener('click', (event) => {
        // to not listen to slot event listener
        event.stopPropagation();
        // navigera till ny sida
        window.location.href = `../pages/detail.html?id=${pokemon.id}`;
    });

    // Lägger in det skapade i förälderelement
    slot.appendChild(imgWrapper);
    slot.appendChild(slotInfo);
}

// TEAM ANALYSIS
// skapar och renderar team analys
// Type coverage, starkast och svagast stats, balans mellan attack stats och defense stats
function loadTeamInfo(teamStats) {
    // nollställer info om inga pokemon i team/ stats är 0
    if (teamStats.types.length === 0) {
        teamInfoTypes.innerHTML = "";
        // typeBarFill.style.height = "0%";
        typeDescription.innerHTML = "";
        teamInfoPros.innerHTML = "";
        teamInfoCons.innerHTML = "";
        return;
    }

    // TYPE COVERAGE
    teamInfoTypes.innerHTML = "";
    // set för att endast spara unika värden, spread operator för att omvandla till array
    const uniqueTypes = [...new Set(teamStats.types)];
    // score för att kunna bedöma type spread
    const score = uniqueTypes.length;
    const typesAll = document.createElement("ul");
    typesAll.classList.add("typeSpread");
    // för varje unik typ, skapa en type badge, append till ul
    uniqueTypes.forEach(type => {
        const uniqueBadge = document.createElement("li");
        uniqueBadge.textContent = type;
        // styla utifrån getTypeTheme funktion
        const theme = getTypeTheme(type);
        uniqueBadge.style.background = theme.bg;
        uniqueBadge.style.color = theme.col;
        // append li till ul
        typesAll.appendChild(uniqueBadge);
    });

    teamInfoTypes.appendChild(typesAll);

    // tog bort bar för type coverage, behöll texten

    // töm på tidigare text
    typeDescription.innerHTML = "";

    const typeBarDescription = document.createElement("p");

    if (score <= 2) {
        typeBarDescription.textContent = "Your team has very limited type coverage.";
    } else if (score <= 4) {
        typeBarDescription.textContent = "Your team has limited type coverage.";
    } else if (score === 5) {
        typeBarDescription.textContent = "Your team has decent type coverage.";
    } else if (score === 6) {
        typeBarDescription.textContent = "Your team has good type coverage.";
    } else if (score >= 7) {
        typeBarDescription.textContent = "Your team has great type coverage!";
    }

    typeDescription.appendChild(typeBarDescription);

    // sorterar stats baserat på värde
    const sortedStats = Object.keys(teamStats)
        // filtrerar bort types från stats
        .filter(key => key !== "types")
        // b först för att gå högst till lägst
        .sort((a, b) => teamStats[b] - teamStats[a]);

    //Header för balanskategori
    const balanceHeader = document.createElement("p");
    balanceHeader.textContent = "Balance";
    balanceHeader.classList.add("statName");

    // STRENGTHS -- two highest stats 
    // töm container på tidigare innehåll
    teamInfoPros.innerHTML = "";
    // skapa rubrik 
    const strengthHeading = document.createElement("h4");
    strengthHeading.textContent = "Strengths";
    teamInfoPros.appendChild(strengthHeading);

    // skapar p för två högsta stats och lägger in hårdkodat meddelande
    [sortedStats[0], sortedStats[1]].forEach(stat => {
        const statName = document.createElement("p");
        statName.textContent = `${statDisplayNames[stat]}`;
        statName.classList.add("statName");

        const statDes = document.createElement("p");
        statDes.textContent = statStrengths[stat];
        statDes.classList.add("statDescription");

        teamInfoPros.appendChild(statName);
        teamInfoPros.appendChild(statDes);
    });

    // Se om balanserad attack och defense
    // balanserad om range på +/- 40
    // Math.abs ger skillnaden mellan statsen, sedan se om skillnaden är mindre än eller 40
    const balanceAttack = Math.abs(teamStats.attack - teamStats["special-attack"]) <= 40;
    const balanceDefense = Math.abs(teamStats.defense - teamStats["special-defense"]) <= 40;

    // om båda är balanserade, skapa p och skriv det, append till div elementet
    if (balanceAttack && balanceDefense) {
        const balanceText = document.createElement("p");
        balanceText.textContent = "Your team has balanced offensive and defensive coverage.";
        teamInfoPros.appendChild(balanceHeader);
        teamInfoPros.appendChild(balanceText);
        // om bara attack har balans, skapa p och skriv det, append till div elementet
    } else if (balanceAttack) {
        const balanceText = document.createElement("p");
        balanceText.textContent = "Your team has balanced offensive coverage.";
        // flytta in i div container
        teamInfoPros.appendChild(balanceHeader);
        teamInfoPros.appendChild(balanceText);
        // om bara defense har balans, skapa p och skriv det, append till div elementet
    } else if (balanceDefense) {
        // skapa p element för att skriva om balansen
        const balanceText = document.createElement("p");
        balanceText.textContent = "Your team has balanced defensive coverage.";
        teamInfoPros.appendChild(balanceHeader);
        teamInfoPros.appendChild(balanceText);
    }

    // WEAKNESS
    // töm container
    teamInfoCons.innerHTML = "";

    // skapa rubrik
    const weaknessHeading = document.createElement("h4");
    weaknessHeading.textContent = "Weaknesses";
    teamInfoCons.appendChild(weaknessHeading);

    // samma som strenghts
    [sortedStats[5], sortedStats[4]].forEach(stat => {
        const statName = document.createElement("p");
        statName.textContent = `${statDisplayNames[stat]}`;
        statName.classList.add("statName");

        const statDes = document.createElement("p");
        statDes.textContent = statWeaknesses[stat];
        statDes.classList.add("statDescription");

        teamInfoCons.appendChild(statName);
        teamInfoCons.appendChild(statDes);
    });

    // om båda är obalanserade, skapa p och skriv det, append till div elementet
    if (!balanceAttack && !balanceDefense) {
        // ta reda på om physical eller special är tyngre
        const heavierAttack = teamStats.attack > teamStats["special-attack"] ? "physical" : "special";
        const heavierDefense = teamStats.defense > teamStats["special-defense"] ? "physical" : "special";
        // skapa p element
        const unbalancedText = document.createElement("p");
        // berätta för användaren vilka stats som är högre.
        unbalancedText.textContent = `Your team is unbalanced. Your defense leans ${heavierDefense} and your attack leans ${heavierAttack}. Your team may benefit from adjustments.`;
        teamInfoCons.appendChild(balanceHeader);
        teamInfoCons.appendChild(unbalancedText);
        // om bara attack är i obalans, skapa p och skriv det, append till div elementet
    } else if (!balanceAttack) {
        // ta reda på vilken stat som är högre
        const heavierSide = teamStats.attack > teamStats["special-attack"] ? "physical" : "special";
        const unbalancedText = document.createElement("p");
        // skriv ut att teamet lutar åt ett håll
        unbalancedText.textContent = `Your team leans heavily ${heavierSide} offensive!`;
        // flytta in i div container
        teamInfoCons.appendChild(balanceHeader);
        teamInfoCons.appendChild(unbalancedText);
        // om bara defense har obalans, skapa p och skriv det, append till div elementet
    } else if (!balanceDefense) {
        // ta reda på vilken stat som är högre
        const heavierSide = teamStats.defense > teamStats["special-defense"] ? "physical" : "special";
        // skapa p element för att skriva om balansen
        const unbalancedText = document.createElement("p");
        unbalancedText.textContent = `Your team's defense leans heavily toward ${heavierSide}.`;
        teamInfoCons.appendChild(balanceHeader);
        teamInfoCons.appendChild(unbalancedText);
    }

    // STATBARS ---- TILL STÖRST DEL BRIGITTAS KOD
    //Stats
    const pokeHP = document.querySelector("#pokeHP p");
    const pokeAttack = document.querySelector("#pokeAttack p");
    const pokeDefense = document.querySelector("#pokeDefense p");
    const pokeSpecialAttack = document.querySelector("#pokeSpecialAttack p");
    const pokeSpecialDefense = document.querySelector("#pokeSpecialDefense p");
    const pokeSpeed = document.querySelector("#pokeSpeed p");
    //Bars
    const hpBar = document.querySelector("#pokeHP .pokeBar");
    const attackBar = document.querySelector("#pokeAttack .pokeBar");
    const defenseBar = document.querySelector("#pokeDefense .pokeBar");
    const specialAttackBar = document.querySelector("#pokeSpecialAttack .pokeBar");
    const specialDefenseBar = document.querySelector("#pokeSpecialDefense .pokeBar");
    const speedBar = document.querySelector("#pokeSpeed .pokeBar");
    // ändrar innehåll till aktuell stat siffra
    pokeHP.textContent = teamStats.hp;
    pokeAttack.textContent = teamStats.attack;
    pokeDefense.textContent = teamStats.defense;
    pokeSpecialAttack.textContent = teamStats["special-attack"];
    pokeSpecialDefense.textContent = teamStats["special-defense"];
    pokeSpeed.textContent = teamStats.speed;
    // rätt stat på rätt plats
    const statBars = [
        { stat: teamStats.hp, bar: hpBar },
        { stat: teamStats.attack, bar: attackBar },
        { stat: teamStats.defense, bar: defenseBar },
        { stat: teamStats["special-attack"], bar: specialAttackBar },
        { stat: teamStats["special-defense"], bar: specialDefenseBar },
        { stat: teamStats.speed, bar: speedBar }
    ];
    // calling progressbar function
    setProgressBar(statBars);
}

//Beräknar progressbarens längd  -------- BRIGITTAS KOD
function setProgressBar(array) {

    //Går igenom varje objekt i arrayen
    array.forEach(element => {
        //Högsta kombinerade stats i spelet (1253)
        element.bar.style.width = ((element.stat / 1253) * 100) + "%";
    });
}

// LOAD DATA ON PAGE
// initialiserar sidan genom att ladda och rendera alla delar i ordning
// blir kallad på vid page load och när lag eller waitlist förändras
async function init() {
    try {
        //Hämta team constellation/data från loadTeam
        const pokemonData = await loadTeam();
        // hämta stats för användning av teaminfo
        const teamStats = loadStats(pokemonData);
        // ladda teaminfo med stats
        loadTeamInfo(teamStats);
        // ladda waitlist
        await loadWaitlist();
        // ladda suggestions
        await loadSuggested(pokemonData, teamStats);
    } catch (error) {
        console.error("Error initializing page:", error);
    }
}

init();

