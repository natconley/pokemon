

// TEAM GALLERY
const fillRandom = document.getElementById("randomTeam");
const teamOverviewContainer = document.querySelector("teamOverview");
const teamSlots = document.querySelectorAll(".teamSlot");

// TEAM INFO
const teamStatbars = document.querySelector(".teamStatbars");
const teamInfoPros = document.querySelector(".teamInfoPros");
const teamInfoCons = document.querySelector(".teamInfoCons");
const teamInfoTips = document.querySelector(".teamInfoTips");

// WAITLIST (TEAM FULL)
const waitlistInfo = document.getElementById("waitlistInfo");
const waitSlot = document.querySelectorAll(".waitSlot");

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
function renderFilledSlot (slot, pokemon) {
// Tömmer kortets tidigare innehåll, innerHTML bör inte vara en risk här
slot.innerHTML = "";
// Ändrar class från empty till filled
slot.classList.remove("teamSlot--empty");
slot.classList.add("teamSlot--filled");
// Ändrar aria-label
slot.setAttribute("aria-label", `Slot ${pokemon.id}: ${pokemon.name}`);

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

//eventlistener för klick av see mer knapp
pokemonSee.addEventListener('click', () => {
               // LÄGG TILL MER BREOENDE PÅ OM DET ÄR MODAL ELLER EGEN SIDA
})
//eventlistener see more
    // navigate too see more page

// Lägger in det skapade i förälderelement
slot.appendChild(pokeImg);
slot.appendChild(slotInfo);
slot.appendChild(pokemonDelete);
slot.appendChild(pokemonSee);

}

function renderEmptySlot() {}


async function loadStatbars() {}
async function loadWaitlist() {}
async function loadSuggested() {}



// LOAD DATA ON PAGE
async function init() {
    await loadTeam();
    await loadStatbars();
    await loadWaitlist();
    await loadSuggested();
}

init ();

