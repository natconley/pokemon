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


function renderPokemonDescription(data) {
    // Hämtar flavor text
    const descriptions = data.flavor_text_entries;

    //Flavor texten har har en konstig tecken mitt i strängen
    //Tecknet tas bort via replace. Replace() returnerar en ny sträng
    const rawDescription = descriptions[0].flavor_text;
    const description = rawDescription.replace("", " ");

    //Sätter pokemon description
    pokeDescription.textContent = description;

}

//Hämtar en pokemons alla evolutioner
export async function getPokemonEvolutions(id = 1) {

    try {

        const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
        if (!response.ok) {
            throw new Error("Status: " + response.status);
        }
        const data = await response.json();

        // Andra anropet (URL från första svaret)
        const evoRes = await fetch(data.evolution_chain.url);
        if (!evoRes.ok) {
            throw new Error("Status: " + response.status);
        }
        const evoData = await evoRes.json();

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

        //För att slippa två seperata API anrop till samma endpoint
        renderPokemonDescription(data);

        return evolutions;

    } catch (err) {

    }

};

//export function setTextContent(){}; ?

/* export async function renderEvolutions(evolutionArray = []) {

    try {

        let typesName = [];

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
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${element.name}`);

            if (!response.ok) {
                throw new Error("Status: " + response.status);
            }

            const evoData = await response.json();

            //Sätter bilden och namnet
            evolutionSprite.src = evoData.sprites.front_default;
            evolutionSprite.alt = capitalizeString(element.name) + " sprite";
            evolutionName.textContent = capitalizeString(element.name);
            evolutionName.classList.add("card-name");

            //Sätter 0:or och # i början av ID:t
            setPokeID(evoData.id, evolutionID);

            div.classList.add("pokeCard", "card-types");

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

            setPokemonType(typesName, typeDiv);

        }

    } catch (err) {

    }

}; */

export async function renderEvolutions(evolutionArray = []) {

    //Funktionen förväntar sig en array av objeckt som är uppbyggt på följandesätt:

    /*  evolutionArray = [{
         name: pokemon namn, 
         url: url till pokemonen 
     }] */


    try {

        for (const element of evolutionArray) {

            //Hämtar data för varje pokemon
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${element.name}`);

            if (!response.ok) {
                throw new Error("Status: " + response.status);
            }

            const evoData = await response.json();

            //Bygger ett nytt objekt för varje iteration
            //Objektet innehåller data på det sättet som createCard förväntar sig
            const pokemon = {
                id: evoData.id,
                name: capitalizeString(element.name),
                img: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${evoData.id}.png`,

                //.map() plockar ut typen
                types: evoData.types.map(t => t.type.name)
            };

            //Skickar in objektet till createCard funktionen
            const card = createCard(pokemon, 0);
            //kortert returneras och läggs in i pokeEvolutionDiv div:en
            pokeEvolutionDiv.append(card);

        }

    } catch (err) {

    }

};

//Hämtar vilka typer en pokemon är svag mot
export async function getPokemonWeakness(typeArray = []) {

    try {

        //Här används objekt istället för arrayer för att lättare kunna söka eftere element utan att loopa 
        let typesMultipliers = {};

        for (const element of typeArray) {

            const response = await fetch(`https://pokeapi.co/api/v2/type/${element.type.name}`);

            if (!response.ok) {
                throw new Error("Status: " + response.status);
            }

            //Destructuring
            const { damage_relations } = await response.json();

            //Loopar igenom double_damage_from arrayen
            damage_relations.double_damage_from.forEach(element => {

                //1. (typesMultipliers[element.name] || 1) kollar om nyckeln med namnet element.name (tex "fire") redan finns
                //2. Om nyckeln inte finns sätts default värdet till 1
                //3. Multipliceras med 2 eftersom den här typen gör x2 skada
                //4. Om nyckeln inte fanns sedan innan läggs den in i objektet typesMultipliers

                typesMultipliers[element.name] = (typesMultipliers[element.name] || 1) * 2
            })

            damage_relations.half_damage_from.forEach(element => {
                typesMultipliers[element.name] = (typesMultipliers[element.name] || 1) * 0.5
            })

            damage_relations.no_damage_from.forEach(element => {
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

    } catch (err) {

    }

};

export function getPokemonType(data) {

    //Hämtar types arrayen
    const typesArray = [data.types[0].type.name];

    //Om det finns en andra typ
    if (data.types[1]) {
        typesArray.push(data.types[1].type.name);
    }

    return typesArray;

}

//Sätter pokemon typerna. Tar endast emot en array med namn
export function setPokemonType(pokeArray = [], div) {

    div.classList.add("card-types");

    pokeArray.forEach(element => {
        const th = getTypeTheme(element);

        const span = document.createElement("span");
        span.textContent = capitalizeString(element);

        span.style.paddingRight = "3rem";
        span.classList.add("badge");
        span.style.cssText = `background:${th.bg}; border-color:${th.col}; color:${th.col};`;
        div.append(span);
    })

};

//Skicka in html elementen + parsade JSON objektet dvs javascript objektet
export function setBaseStats(hp, attack, defense, spAttack, spDefense, speed, data) {

    hp.textContent = data.stats[0].base_stat;
    attack.textContent = data.stats[1].base_stat;
    defense.textContent = data.stats[2].base_stat;
    spAttack.textContent = data.stats[3].base_stat;
    spDefense.textContent = data.stats[4].base_stat;
    speed.textContent = data.stats[5].base_stat;

};

//Hämtar pokemon infon
export async function fetchPokemon(id = 1) {

    try {

        //Ha kvar fetch requesten här men rendera ut allting seperat
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)

        if (!response.ok) {
            throw new Error("Status: " + response.status);
        }

        const data = await response.json();

        pokeSprite.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
        pokeSprite.alt = capitalizeString(data.name) + " artwork";
        pokeName.textContent = capitalizeString(data.name);
        document.title = capitalizeString(data.name);

        //Sätter 0:or och # i början av ID:t
        setPokeID(data.id, pokeId);

        //Sätter typerna
        const typesArray = getPokemonType(data);
        setPokemonType(typesArray, pokeTypesDiv);

        //Weakness
        const weaknessArray = await getPokemonWeakness(data.types);
        setPokemonType(weaknessArray, pokeWeaknessDiv);

        setBaseStats(pokeHP, pokeAttack, pokeDefense, pokeSpecialAttack, pokeSpecialDefense, pokeSpeed, data);

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
        shinyImg.alt = capitalizeString(data.name) + " shiny sprite"

        //Evolutioner
        const evolutionArray = await getPokemonEvolutions(id);
        renderEvolutions(evolutionArray);

    } catch (err) {

    }

};

// Hämtar URL parametrarna

//window.location är ett objekt som innehåller information om den nuvarande URL:en
//.search plockar ut allt efter ? från URL:en. tex 3 om URL:en är detail.html?id=3
//URLSearchParams är en inbyggd klass i JavaScript som tar en query sträng och pars den till ett objekt
const params = new URLSearchParams(window.location.search);
//.get() är en metod på URLSearchParams som hämtar värdet för en specifik nyckel 
const id = params.get("id");

//Funktionen som hämtar infon för varje enskild pokemon
fetchPokemon(id);