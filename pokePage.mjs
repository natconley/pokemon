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
const pokeWeaknessDiv = document.getElementById("pokeWeaknessDiv");
const pokeTypesDiv = document.getElementById("pokeTypesDiv");

//Evoluiton 
const pokeEvolutionDiv = document.getElementById("pokeEvolution");

//Shiny
const shinyImg = document.querySelector("#shiny img");

//Abilities
const pokeHeight = document.getElementById("pokeHeight");
const pokeWeight = document.getElementById("pokeWeight");
const pokeAbility = document.getElementById("pokeAbility");

const ID = new URLSearchParams(window.location.search).get('id');

//Hämtar pokemon beskrivning
export function getPokeDescription(id = ID) {
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
        .catch()
};
//Hämtar en pokemons alla evolutioner
export function getPokemonEvolutions(id = ID) {
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
        .catch()
};

//export function setTextContent(){}; ?

export async function renderEvolutions(evolutionArray = []) {

    try {

        let typesName = [];

        //forEach loopar stödjer inte async på ett bra sätt.
        //Därför används for ... of här
        for (const element of evolutionArray) {

            //Tömmer types arreyn
            typesName = [];

            //Skapar alla element
            const div = document.createElement("div");
            const evolutionSprite = document.createElement("img");
            const evolutionName = document.createElement("span");
            const evolutionID = document.createElement("span");
            const typeDiv = document.createElement("div");

            //Hämtar data för varje pokemon
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${element.name}`);
            const evoData = await res.json();

            //Sätter bilden och namnet
            evolutionSprite.src = evoData.sprites.front_default;
            evolutionName.textContent = capitalizeString(element.name);

            //Sätter 0:or och # i början av ID:t
            setPokeID(evoData.id, evolutionID);

            div.classList.add("pokeCard");

            pokeEvolutionDiv.append(div);
            div.append(evolutionSprite); // du glömde lägga till spriten!
            div.append(evolutionName);
            div.append(evolutionID);
            div.append(typeDiv);

            //Sätter typen
            typesName = [evoData.types[0].type.name];

            //Om det finns en andra typ
            if (evoData.types[1]) {
                typesName.push(evoData.types[1].type.name);
            }

            console.log(typesName);

            setPokemonType(typesName, typeDiv);

        }

    } catch (Error) {

    }

};

//Hämtar vilka typer en pokemon är svag mot
export async function getPokemonWeakness(typeArray = []) {

    try {

        //Här används objekt istället för arrayer för att lättare kunna söka eftere element utan att loopa 
        let typesMultipliers = {};

        for (const element of typeArray) {

            const res = await fetch(`https://pokeapi.co/api/v2/type/${element.type.name}`);
            const typeData = await res.json();

            //Loopar igenom double_damage_from arrayen
            typeData.damage_relations.double_damage_from.forEach(element => {

                //1. (typesMultipliers[element.name] || 1) kollar om nyckeln med namnet element.name (tex "fire") redan finns
                //2. Om nyckeln inte finns sätts default värdet till 1
                //3. Multipliceras med 2 eftersom den här typen gör x2 skada
                //4. Om nyckeln inte fanns sedan innan läggs den in i objektet typesMultipliers

                typesMultipliers[element.name] = (typesMultipliers[element.name] || 1) * 2
            })

            typeData.damage_relations.half_damage_from.forEach(element => {
                typesMultipliers[element.name] = (typesMultipliers[element.name] || 1) * 0.5
            })

            typeData.damage_relations.no_damage_from.forEach(element => {
                typesMultipliers[element.name] = (typesMultipliers[element.name] || 1) * 0
            })

        };

        //Gör om objektet till en array genom Object.entries
        const results = Object.entries(typesMultipliers);
        //De slutliga värdena sparas i den här arrayen
        const doubleDamage = [];

        for (const [key, value] of results) {
            if (value > 1) { doubleDamage.push(key) }
        };

        //Ingenting händer med resultatet här, utan värdet returneras endast. Detta för att göra funkitonen återanvändbar
        return doubleDamage;

    } catch (Error) {

    }

};

//Sätter pokemon typerna. Tar endast emot en array med namn
export function setPokemonType(pokeArray = [], div) {

    pokeArray.forEach(element => {
        const span = document.createElement("span");
        span.textContent = capitalizeString(element);

        span.style.paddingRight = "1rem";
        div.append(span);
    })

};

//Hämtar pokemon infon
export function fetchPokemon(id = ID) {
    fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
        .then(res => res.json())
        .then(data => {

            pokeSprite.src = data.sprites.front_default;
            pokeName.textContent = capitalizeString(data.name);
            document.title = capitalizeString(data.name);

            //Sätter 0:or och # i början av ID:t
            setPokeID(data.id, pokeId);

            //Hämtar types arrayen
            const typesdata = data.types;
            const typesName = [data.types[0].type.name];

            //Om det finns en andra typ
            if (data.types[1]) {
                typesName.push(data.types[1].type.name);
            }

            setPokemonType(typesName, pokeTypesDiv);

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

            //Sätter progressbaren utifrån pokemon statsen
            setProgressBar(pokeStats);

            //Abilities
            pokeHeight.textContent = data.height
            pokeWeight.textContent = data.weight;
            pokeAbility.textContent = capitalizeString(data.abilities[0].ability.name);

            //Shiny
            shinyImg.src = data.sprites.front_shiny;

            getPokeDescription(id);
            getPokemonWeakness(typesdata).then(weaknessArray => setPokemonType(weaknessArray, pokeWeaknessDiv));
            //1. Anroppar getPokemonEvolutions med pokemon id:t
            //2. Får tillbaka ett return värde (promise)
            //3. Anropar renderEvolutions funktionen med return värdet
            getPokemonEvolutions(id).then(evolutions => renderEvolutions(evolutions));
        })
        .catch()
};

fetchPokemon();






