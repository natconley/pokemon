// TO DO
// team stats/bars
// team info
// random??
// design på fyllda kort
// Weakness använder fallbackpool, ändra till näst lägsta stat
// lägg till text om varför pokemon i suggestions valdes?


// TEAM GALLERY
const fillRandom = document.getElementById("randomTeam");
const teamOverviewContainer = document.querySelector(".teamOverview");
const teamSlots = document.querySelectorAll(".teamSlot");
const emptyText = document.getElementById("teamEmpty");

// TEAM INFO
const teamStatbars = document.querySelector(".teamStatbars");
const teamInfoPros = document.querySelector(".teamInfoPros");
const teamInfoCons = document.querySelector(".teamInfoCons");
const teamInfoTips = document.querySelector(".teamInfoTips");

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


// LOAD TEAM
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
    } catch {
        console.error("Error loading team:", error);
        // return empty array för at loadsuggested och teamstats inte ska crasha
        return [];
    }
}

// FETCH POKEMON FROM API
async function fetchPokemon(id) {
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
        return data;
    } catch (error) {
        console.error("Error fetching Pokémon", error);
        // loadTeam renderar null som empty slot
        return null;
    }
}


//FILL SLOT W. POKE INFO (img, name, id, types, actions)
function renderFilledSlot(slot, pokemon) {
    // Tömmer kortets tidigare innehåll, innerHTML bör inte vara en risk här
    slot.innerHTML = "";
    // Ändrar class från empty till filled
    slot.classList.remove("teamSlot--empty");
    slot.classList.add("teamSlot--filled");
    // Ändrar aria-label
    slot.setAttribute("aria-label", `Team member: #${pokemon.id}: ${pokemon.name}`);

    // Skapar bild till slot
    const pokeImg = document.createElement("img");
    pokeImg.src = pokemon.sprites.front_default;
    pokeImg.alt = pokemon.name;

    // Lägger till namn och id i ny div
    const slotInfo = document.createElement("div");
    const pokeName = document.createElement("p");
    pokeName.textContent = pokemon.name;
    const pokeId = document.createElement("p");
    pokeId.textContent = `#${pokemon.id}`;

    slotInfo.appendChild(pokeName);
    slotInfo.appendChild(pokeId);

    // lägger till types i listformat
    const typesAll = document.createElement("ul");
    // loopar igenom types för att ta ut namn på alla types
    pokemon.types.forEach(item => {
        //Skapar list items för varje type
        const pokeType = document.createElement("li");
        // Skapar innehåll på list item = type name
        pokeType.textContent = item.type.name;
        // lägger till li i ul
        typesAll.appendChild(pokeType);
    });
    slotInfo.appendChild(typesAll);

    // DELETE TEAM MEMBER
    //Lägg till radera-knapp med innehåll och aria label
    const pokemonDelete = document.createElement("button");
    pokemonDelete.setAttribute("aria-label", `Remove ${pokemon.name} from team`);
    const deleteIcon = document.createElement("img");
    deleteIcon.src = "/assets/trash.png";
    deleteIcon.alt = "";
    pokemonDelete.appendChild(deleteIcon);

    // event listener för att radera lagmedlem
    pokemonDelete.addEventListener("click", () => {
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
    pokemonSee.setAttribute("aria-label", `See more about ${pokemon.name}`);
    const seeIcon = document.createElement("img");
    seeIcon.src = "/assets/eye.png";
    seeIcon.alt = "";
    pokemonSee.appendChild(seeIcon);

    //eventlistener för klick av se mer knapp
    pokemonSee.addEventListener('click', () => {
        // LÄGG TILL MER BREOENDE PÅ OM DET ÄR MODAL ELLER EGEN SIDA
        //eventlistener see more
        // navigate to see more page
    });

    // Lägger in det skapade i förälderelement
    slot.appendChild(pokeImg);
    slot.appendChild(slotInfo);
    slot.appendChild(pokemonDelete);
    slot.appendChild(pokemonSee);
}


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
    emptyImg.src = "/assets/q-mark.png";
    emptyImg.alt = "";
    // add to slot
    slot.appendChild(emptyImg);
}

// GET AND COMBINES INDIVIDUAL STATS FOR TEAM STATS
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
        })
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
async function loadWaitlist() {
    try {
        // Hämta id fron localStorage, convertera till sträng. Om inget är sparat är waitlistIds en tom array
        // OBS: item heter här pokemonWaitlist
        const waitlistIds = JSON.parse(localStorage.getItem("pokemonWaitlist")) || [];
        // om det inte finns sparade pokemons, gör ingenting
        if (waitlistIds.length === 0) {
            //lägg tillbaks info för tom lista
            waitlistInfo.classList.remove("hidden");
            return;
        }
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
function renderFilledCarousel(slot, pokemon) {
    // Tömmer kortets tidigare innehåll, innerHTML bör inte vara en risk här
    slot.innerHTML = "";
    // Ändrar class från empty till filled
    slot.classList.remove("waitSlot--empty");
    slot.classList.add("waitSlot--filled");
    // Ändrar aria-label
    slot.setAttribute("aria-label", `Saved pokémon: #${pokemon.id}: ${pokemon.name}`);

    // Skapar bild till slot
    const pokeImg = document.createElement("img");
    pokeImg.src = pokemon.sprites.front_default;
    pokeImg.alt = pokemon.name;

    // Lägger till namn och id i ny div
    const slotInfo = document.createElement("div");
    const pokeName = document.createElement("p");
    pokeName.textContent = pokemon.name;
    const pokeId = document.createElement("p");
    pokeId.textContent = `#${pokemon.id}`;

    slotInfo.appendChild(pokeName);
    slotInfo.appendChild(pokeId);

    // lägger till types i listformat
    const typesAll = document.createElement("ul");
    // loopar igenom types för att ta ut namn på alla types
    pokemon.types.forEach(item => {
        //Skapar list items för varje type
        const pokeType = document.createElement("li");
        // Skapar innehåll på list item = type name
        pokeType.textContent = item.type.name;
        // lägger till li i ul
        typesAll.appendChild(pokeType);
    });
    slotInfo.appendChild(typesAll);

    // DELETE FROM WAITLIST
    //Lägg till radera-knapp med innehåll och aria label
    const pokemonDelete = document.createElement("button");
    pokemonDelete.setAttribute("aria-label", `Remove ${pokemon.name} from waitlist`);
    const deleteIcon = document.createElement("img");
    deleteIcon.src = "/assets/trash.png";
    deleteIcon.alt = "";
    pokemonDelete.appendChild(deleteIcon);

    // event listener för att radera från sparade
    pokemonDelete.addEventListener("click", () => {
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

    //Lägg till "add to team" knapp med innehåll och aria label
    const addToTeam = document.createElement("button");
    addToTeam.setAttribute("aria-label", `Add ${pokemon.name} to your team`);
    const plusIcon = document.createElement("img");
    plusIcon.src = "/assets/plus.png";
    plusIcon.alt = "";
    addToTeam.appendChild(plusIcon);

    // Event listener för att lägga till pokemon i team
    addToTeam.addEventListener("click", () => {
        //Ta reda på om Det finns plats att lägga till i team (under 6 finns plats, annars fullt)
        // Hämtar id från localStorage, converterar från sträng.       
        const teamIds = JSON.parse(localStorage.getItem("pokemonTeam")) || [];
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
            // återställer utseendet på tom slot
            // OBS : ÄNDRA TILL TA BORT SLOT HELT
            loadTeam();
            loadWaitlist();
        } else {
            alert("Your team is full! Remove a Pokémon to add another.");
        }
    });

    // Lägg till "se mer info" knapp med innehåll och aria label
    const pokemonSee = document.createElement("button");
    pokemonSee.setAttribute("aria-label", `See more about ${pokemon.name}`);
    const seeIcon = document.createElement("img");
    seeIcon.src = "/assets/eye.png";
    seeIcon.alt = "";
    pokemonSee.appendChild(seeIcon);

    //eventlistener för klick av se mer knapp
    pokemonSee.addEventListener('click', () => {
        // LÄGG TILL MER BREOENDE PÅ OM DET ÄR MODAL ELLER EGEN SIDA
        //eventlistener see more
        // navigate to see more page
    });

    // Lägger in det skapade i förälderelement
    slot.appendChild(pokeImg);
    slot.appendChild(slotInfo);
    slot.appendChild(pokemonDelete);
    slot.appendChild(pokemonSee);
    slot.appendChild(addToTeam);
}

async function loadSuggested(pokemonData, teamStats) {
    try {
        // ser till att pokemon finns & att id är rätt
        const validPokemon = pokemonData.filter(pokemon => pokemon !== null);
        const teamIds = validPokemon.map(pokemon => pokemon.id);
        // TYPE suggestion
        // Brigittas weakness calculator är mere specifik/bättre, men skulle kräva upp till 12 API anrop beroende på lagkonstellation
        // Ändra till Brigittas version om tid finns över (Type weakness istället för Type Coverage)

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

        suggestedContainer.innerHTML = "";

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

function renderFilledSuggestions(slot, pokemon) {
    // Tömmer kortets tidigare innehåll, innerHTML bör inte vara en risk här
    slot.innerHTML = "";
    // Ändrar class från empty till filled
    slot.classList.remove("sugSlot--empty");
    slot.classList.add("sugSlot--filled");
    // Ändrar aria-label
    slot.setAttribute("aria-label", `Suggested pokémon: #${pokemon.id}: ${pokemon.name}`);

    // Skapar bild till slot
    const pokeImg = document.createElement("img");
    pokeImg.src = pokemon.sprites.front_default;
    pokeImg.alt = pokemon.name;

    const slotInfo = document.createElement("div");
    const pokeName = document.createElement("p");
    pokeName.textContent = pokemon.name;
    const pokeId = document.createElement("p");
    pokeId.textContent = `#${pokemon.id}`;

    slotInfo.appendChild(pokeName);
    slotInfo.appendChild(pokeId);

    // lägger till types i listformat
    const typesAll = document.createElement("ul");
    // loopar igenom types för att ta ut namn på alla types
    pokemon.types.forEach(item => {
        //Skapar list items för varje type
        const pokeType = document.createElement("li");
        // Skapar innehåll på list item = type name
        pokeType.textContent = item.type.name;
        // lägger till li i ul
        typesAll.appendChild(pokeType);
    });
    slotInfo.appendChild(typesAll);

    //Lägg till "add to team" knapp med innehåll och aria label
    const addToTeam = document.createElement("button");
    addToTeam.setAttribute("aria-label", `Add ${pokemon.name} to your team`);
    const plusIcon = document.createElement("img");
    plusIcon.src = "/assets/plus.png";
    plusIcon.alt = "";
    addToTeam.appendChild(plusIcon);

    // Event listener för att lägga till pokemon i team
    addToTeam.addEventListener("click", () => {
        //Ta reda på om Det finns plats att lägga till i team (under 6 finns plats, annars fullt)
        // Hämtar id från localStorage, converterar från sträng.       
        const teamIds = JSON.parse(localStorage.getItem("pokemonTeam")) || [];
        if (teamIds.length < 6) {
            // lägg till i team array
            teamIds.push(pokemon.id);
            // skickar tillbaks uppdaterad pokemonTeam
            localStorage.setItem("pokemonTeam", JSON.stringify(teamIds));
            // updatera team
            //init skickar nya fetch calls 
            //för mycket tryck på apin????
            init();
        } else {
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
    pokemonSee.setAttribute("aria-label", `See more about ${pokemon.name}`);
    const seeIcon = document.createElement("img");
    seeIcon.src = "/assets/eye.png";
    seeIcon.alt = "";
    pokemonSee.appendChild(seeIcon);

    //eventlistener för klick av se mer knapp
    pokemonSee.addEventListener('click', () => {
        // LÄGG TILL MER BREOENDE PÅ OM DET ÄR MODAL ELLER EGEN SIDA
        //eventlistener see more
        // navigate to see more page
    });

    // Lägger in det skapade i förälderelement
    slot.appendChild(pokeImg);
    slot.appendChild(slotInfo);
    slot.appendChild(pokemonSee);
    slot.appendChild(addToTeam);
}



// LOAD DATA ON PAGE
async function init() {
    try {
        //Hämta team data från loadTeam
        const pokemonData = await loadTeam();
        const teamStats = loadStats(pokemonData);
        await loadWaitlist();
        await loadSuggested(pokemonData, teamStats);
    } catch (error) {
        console.error("Error initializing page:", error);
    }
}

init();

