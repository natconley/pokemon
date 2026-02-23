import { capitalizeString, setPokeID, setProgressBar } from "./pokeUtility.mjs"

//Basic info
const pokeSprite = document.getElementById("pokeSprite");
const pokeName = document.getElementById("pokeName");
const pokeId = document.getElementById("pokeId");
const pokeDescription = document.getElementById("pokeDescription");

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

//Type
const type1 = document.getElementById("type1");
const type2 = document.getElementById("type2");

//Evoluiton 
const pokeEvolution = document.getElementById("pokeEvolution");

//Abilities
const pokeHeight = document.getElementById("pokeHeight");
const pokeWeight = document.getElementById("pokeWeight");
const pokeAbility = document.getElementById("pokeAbility");


//Hämtar pokemon beskrivning
export function getPokeDescription(id = 1) {
    fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`)
        .then(res => res.json())
        .then(data => {
            // Hämtar flavor text
            const descriptions = data.flavor_text_entries;

            //Flavor texten har har en konstig tecken mitt i strängen
            //Tecknet tas bort via replace. Replace() returnerar en ny sträng
            const rawDescription = descriptions[0].flavor_text;
            const description = rawDescription.replace("", " ");

            //Sätter pokemon description
            pokeDescription.textContent = description;

        })
};

//Sätter typerna
export function setPokeTypes(pokeArray = [], div) {
    if (pokeArray.length > 1) {
        const newDiv = document.createElement("div");
        div.append(newDiv);

        pokeArray.forEach(element => {
            const span = document.createElement("span");
            span.textContent = capitalizeString(element.type.name);
            span.style.paddingRight = "1rem";

            newDiv.append(span);
        })
    } else {

        const span = document.createElement("span");
        span.textContent = capitalizeString(pokeArray[0].type.name);

        div.append(span);

    }
};

//Hämtar en pokemons alla evolutioner
export function getPokemonEvolutions(id = 1) {
    return fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`)
        .then(res => res.json())
        //API anrop till URL:en som finns JSON objektet
        .then(data => fetch(data.evolution_chain.url))
        .then(res => res.json())
        .then(evoData => {

            //Tom array som samlar namnen och url på alla evolutioner
            const evolutions = [];

            function parseChain(chain) {

                // Lägg till namnet på den nuvarande pokemonen i arrayen
                // chain.species.name är t.ex. "bulbasaur", "ivysaur" osv.
                evolutions.push({
                    name: chain.species.name,
                    url: chain.species.url
                });

                // evolves_to är en array med chain-objekt för nästa evolution(er)
                // För Bulbasaur: [ivysaur-objekt]
                // För Venusaur: [] (tom, inga fler evolutioner)
                chain.evolves_to.forEach(chainObject =>

                    // chainObject är ett helt chain objekt (med egen species.name och evolves_to)
                    // funktionen körs då igen fast ett steg längre ner i JSON trädet
                    // detta fortsätter tills evolves_to är tom och forEach inte har något att köra
                    parseChain(chainObject));
            }

            parseChain(evoData.chain);

            return evolutions;

        })
};

export async function renderEvolutions(evolutionArray = []) {

    //forEach loopar stödjer inte async på ett bra sätt.
    //Därför används for ... of här
    for (const element of evolutionArray) {

        //Skapar alla element
        const div = document.createElement("div");
        const evolutionSprite = document.createElement("img");
        const evolutionName = document.createElement("span");
        const evolutionID = document.createElement("span");

        //Hämtar data för varje pokemon
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${element.name}`);
        const evoData = await res.json();

        //Sätter bilden och namnet
        evolutionSprite.src = evoData.sprites.front_default;
        evolutionName.textContent = capitalizeString(element.name);

        //Sätter 0:or och # i början av ID:t
        setPokeID(evoData.id, evolutionID);


        div.classList.add("pokeCard");
        div.append(evolutionSprite); // du glömde lägga till spriten!
        div.append(evolutionName);
        div.append(evolutionID);
        //Sätter typen
        setPokeTypes(evoData.types, div);
        pokeEvolution.append(div);
    }

};


//Hämtar pokemon infon
export function fetchPokemon(id = 1) {
    fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
        .then(res => res.json())
        .then(data => {

            pokeSprite.src = data.sprites.front_default;
            pokeName.textContent = capitalizeString(data.name);
            document.title = capitalizeString(data.name);

            //Sätter 0:or och # i början av ID:t
            setPokeID(data.id, pokeId);



            const types = data.types;
            type1.textContent = capitalizeString(types[0].type.name);

            //Om det finns mer än en pokemontyp visas även andra typ labeln
            if (types.length > 1) {
                type2.style.display = "block";
                type2.textContent = capitalizeString(types[1].type.name);
            }

            //Stats
            pokeHP.textContent = data.stats[0].base_stat;
            pokeAttack.textContent = data.stats[1].base_stat;
            pokeDefense.textContent = data.stats[2].base_stat;
            pokeSpecialAttack.textContent = data.stats[3].base_stat;
            pokeSpecialDefense.textContent = data.stats[4].base_stat;
            pokeSpeed.textContent = data.stats[5].base_stat;

            //lägger alla stats i en objects of array
            const pokeStats = [
                { stat: data.stats[0].base_stat, bar: hpBar }, //hp
                { stat: data.stats[1].base_stat, bar: attackBar }, //attack
                { stat: data.stats[2].base_stat, bar: defenseBar }, //defense
                { stat: data.stats[3].base_stat, bar: specialAttackBar }, //Special attack
                { stat: data.stats[4].base_stat, bar: specialDefenseBar }, //Special defense
                { stat: data.stats[5].base_stat, bar: speedBar } //speed
            ];

            setProgressBar(pokeStats);

            //Abilities
            pokeHeight.textContent = data.height
            pokeWeight.textContent = data.weight;
            pokeAbility.textContent = capitalizeString(data.abilities[0].ability.name);

            getPokeDescription(id);
            getPokemonEvolutions(id).then(evolutions => renderEvolutions(evolutions));
        })
};

fetchPokemon();






