

// TEAM GALLERY
const fillRandom = document.getElementById("randomTeam");
const teamOverviewContainer = document.querySelector("teamOverview");
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
const sugSlot = document.querySelectorAll(".sugSlot");


// LOAD TEAM
async function loadTeam() {
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
}

// FETCH POKEMON FROM API
async function fetchPokemon(id) {
    // Hämtar data från API
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    // Validerar att information kunde hämtas
    // response.ok = statskod 200 - 299, !response.ok = alla andra statuskoder
    // loadTeam renderar null som empty slot
    if (!response.ok) {
        console.error(`Failed to fetch Pokémon with ID ${id}`);
        return null;
    }
    // Omvandlar till JSON
    const data = await response.json();
    return data;
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
            const teamIds = JSON.parse(localStorage.getItem("pokemonTeam"));
            // hämtar de idn som är lika med de idn som finns kvar
            const updatedTeam = teamIds.filter(id => id !== pokemon.id);
            // skickar tillbaks uppdaterad array
            localStorage.setItem("pokemonTeam", JSON.stringify(updatedTeam));
            // återställer tom slot utseende
            renderEmptySlot(slot);
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




async function loadStatbars() { }

// LOAD WAITLIST
async function loadWaitlist() {
    // Hämta id fron localStorage, convertera till sträng. Om inget är sparat är waitlistIds en tom array
    // OBS: item heter här pokemonWaitlist
    const waitlistIds = JSON.parse(localStorage.getItem("pokemonWaitlist")) || [];
    // om det inte finns sparade pokemons, gör ingenting
    if (waitlistIds.length === 0) {
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
            // återställer tom slot utseende
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

async function loadSuggested() { }



// LOAD DATA ON PAGE
async function init() {
    await loadTeam();
    await loadStatbars();
    await loadWaitlist();
    await loadSuggested();
}

init();

