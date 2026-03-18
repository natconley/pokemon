/* -- detail.mjs ---------------------------------------------------------
   JS filen för detail.html sidan.
   Visar detaljerad information om pokemon. 
   ------------------------------------------------------------------- */

import {
    fetchPokemon,
    fetchType,
    fetchSpecies,
    fetchEvolutionChain,
    getPokemonType,
    setPokemonType,
    capitalizeString,
    setPokeID,
    setBaseStats,
    setProgressBar
} from "./pokeUtility.mjs"

//Basic info
const pokeSprite = document.getElementById("pokeSprite");
const pokeName = document.getElementById("pokeName");
const pokeId = document.getElementById("pokeId");
const pokeDescription = document.getElementById("pokeDescription");
const teamBtn = document.querySelector(".pokeHero button");

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
const pokeTypesDiv = document.querySelector("#typesSection>div:nth-child(1)>div");
const pokeWeaknessDiv = document.querySelector("#typesSection>div:nth-child(2)>div");
const pokeStrengthsDiv = document.querySelector("#typesSection>div:nth-child(3)>div");

//Evoluiton 
const pokeEvolutionDiv = document.getElementById("pokeEvolution");

//Shiny
const shinyImg = document.querySelector("#shiny img");

//Abilities
const pokeHeight = document.getElementById("pokeHeight");
const pokeWeight = document.getElementById("pokeWeight");
const pokeCategory = document.querySelector("#TraitsSection>div>div:nth-child(3) p");
const pokeAbility = document.getElementById("pokeAbility");

//Suggestions
const suggestionsDiv = document.querySelector("#suggestions div");

// POKEMON POOLS FOR SUGGESTIONS
// hårdkodade alternativ för dynamiska teamresultat
// pokemon id

const typePools = {
    normal: [143, 242, 446],
    fire: [6, 59, 136],
    water: [9, 130, 134],
    electric: [26, 135, 181],
    grass: [3, 154, 470],
    ice: [131, 471, 473],
    fighting: [68, 106, 448],
    poison: [89, 110, 454],
    ground: [232, 330, 445],
    flying: [18, 142, 384],
    psychic: [65, 150, 282],
    bug: [212, 291, 748],
    rock: [141, 248, 377],
    ghost: [94, 302, 487],
    dragon: [149, 373, 445],
    dark: [197, 248, 359],
    steel: [205, 208, 376],
    fairy: [282, 468, 700]
};

//Sätter pokemon beskrivningen
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

        //API anrop för att hämta URL:en till evolutions kedjan
        const response = await fetchSpecies(id);
        const url = response.evolution_chain.url.split("/");

        //Andra API anropet för att hämta evolutions kedjan för pokemonen
        const data = await fetchEvolutionChain(url[6]);

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

        parseChain(data.chain);

        //returnerar en array av objekt med pokemon namn och URl till pokemon species för varje pokemon i evolutions kedjan
        return evolutions;

    } catch (err) {
        console.error("Could not get pokemon evolutions:" + "\n" + err);
        return;
    }

};

export async function renderEvolutions(evolutionArray = []) {

    //Funktionen förväntar sig en array av objeckt som är uppbyggt på följandesätt:

    /*  evolutionArray = [{
         name: pokemon namn, 
         url: url till pokemonen 
     }] */


    try {

        for (const element of evolutionArray) {

            const evoData = await fetchPokemon(element.name);

            setCard();

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
        console.error("Could not render pokemon evolutions: " + "\n" + err);
        return;
    }

};

//Hämtar vilka typer en pokemon är svag mot
export async function getPokemonWeakness(typeArray = []) {

    try {

        //Här används objekt istället för arrayer för att lättare kunna söka eftere element utan att loopa 
        let typesMultipliers = {};

        //Loopar igenom varje typ som pokemonen har tex gräs, eld 
        for (const element of typeArray) {

            //Destructuring. Plockar ut id och damage_relations direkt från objektet som fetchType returnerar
            const { damage_relations } = await fetchType(element);

            //Loopar igenom double_damage_from arrayen
            damage_relations.double_damage_from.forEach(element => {

                //1. (typesMultipliers[element.name] || 1) kollar om nyckeln med namnet element.name (tex "fire") redan finns
                //2. Om nyckeln inte finns sätts default värdet till 1
                //3. Multipliceras med 2 eftersom den här typen gör x2 skada
                //4. Om nyckeln inte fanns sedan innan läggs den in i objektet typesMultipliers

                typesMultipliers[element.name] = (typesMultipliers[element.name] || 1) * 2
            })

            //Typer som gör 0.5x skada mot den här typen
            damage_relations.half_damage_from.forEach(element => {
                typesMultipliers[element.name] = (typesMultipliers[element.name] || 1) * 0.5
            })

            //Typer som gör 0x skada mot den här typen
            damage_relations.no_damage_from.forEach(element => {
                typesMultipliers[element.name] = (typesMultipliers[element.name] || 1) * 0
            })

        };

        //Gör om typesMultipliers objektet till en array
        //tex { fire: 2, water: 0.5 } → [["fire", 2], ["water", 0.5]]
        const results = Object.entries(typesMultipliers);

        //Tom array som samlar typerna som pokemonen är svag mot
        const doubleDamage = [];

        //Loopar igenom alla typer och pushar typerna med multiplier över 1 in i doubleDamage arrayen
        for (const [key, value] of results) {
            if (value > 1) { doubleDamage.push(key) }
        };

        //Returnerar en string array med typerna som pokemonen är svag mot
        return doubleDamage;

    } catch (err) {
        console.error("Could not get pokemon weaknesses: " + "\n" + err);
        return;
    }

};

//Hämtar vilka typer en pokemon är stark mot
export async function getPokemonStrengths(typeArray = []) {

    try {

        //Här används objekt istället för arrayer för att lättare kunna söka eftere element utan att loopa 
        let typesMultipliers = {};

        for (const element of typeArray) {

            //Destructuring
            const { damage_relations } = await fetchType(element);

            //Loopar igenom double_damage_from arrayen
            damage_relations.double_damage_to.forEach(element => {

                //1. (typesMultipliers[element.name] || 1) kollar om nyckeln med namnet element.name (tex "fire") redan finns
                //2. Om nyckeln inte finns sätts default värdet till 1
                //3. Multipliceras med 2 eftersom den här typen gör x2 skada
                //4. Om nyckeln inte fanns sedan innan läggs den in i objektet typesMultipliers

                typesMultipliers[element.name] = (typesMultipliers[element.name] || 1) * 2
            })

            damage_relations.half_damage_to.forEach(element => {
                typesMultipliers[element.name] = (typesMultipliers[element.name] || 1) * 0.5
            })

            damage_relations.no_damage_to.forEach(element => {
                typesMultipliers[element.name] = (typesMultipliers[element.name] || 1) * 0
            })

        };

        //Gör om typesMultipliers objektet till en array
        //tex { fire: 2, water: 0.5 } → [["fire", 2], ["water", 0.5]]
        const results = Object.entries(typesMultipliers);

        //Tom array som samlar typerna som pokemonen är stark mot
        const doubleDamage = [];

        //Loopar igenom alla typer och pushar typerna med multiplier över 1 in i doubleDamage arrayen
        for (const [key, value] of results) {
            if (value > 1) { doubleDamage.push(key) }
        };

        //Returnerar en string array med typerna som pokemonen är stark mot
        return doubleDamage;

    } catch (err) {
        console.error("Could not get pokemon strengths: " + "\n" + err);
        return;
    }

};

//Hämtar pokemon rekommendationer baserat på pokemonens svagheter för att täcka upp luckor i laget
export async function getSugesstedPokemon(weaknessArray = []) {

    try {

        let suggestions = [];
        let result = [];

        //hämtar pokemon typer som är starka mot pokemonens svagheter
        //Tex Bulbasaur är svag mot eld. Då kommer den hämta pokemon typerna som är starka mot eld
        const suggestedTypes = await getPokemonWeakness(weaknessArray);

        //Hämtar alla rekommendationer från typePoolen för de rekommenderade typerna
        for (const element of suggestedTypes) {
            //Spread operatorn gör så att alla id:n sparas på samma nivå och det blir inte en array av arrayer
            suggestions.push(...typePools[element]);
        }

        //begrönsar rekommendationerna till 6 stycken 
        while (result.length < 6) {

            //randomize type pool pick
            const id = suggestions[Math.floor(Math.random() * suggestions.length)];

            //hindrar att dubbleter kommer med i rekommendationerna
            if (!result.includes(id)) {
                result.push(id);
            }

        }

        //returnerar en array med pokemon id:n
        return result;

    } catch (err) {
        console.error("Could not get sugessted pokemon: " + "\n" + err);
        return;
    }

}

//sätter "category" under "traits" sektionen
export async function setPokemonCategory(id = 1, p) {

    try {

        const category = await fetchSpecies(id);

        p.textContent = category.genera[7].genus;

    } catch (err) {
        console.error("Could not get pokemon category: " + "\n" + err);
        return;
    }

}

//Formaterar datan på sättet som createCard funktionen förväntar sig
export async function setCard(pokeArray = [], div) {

    try {

        for (const element of pokeArray) {

            const data = await fetchPokemon(element);
            //Bygger ett nytt objekt för varje iteration
            //Objektet innehåller data på det sättet som createCard förväntar sig
            const pokemon = {
                id: data.id,
                name: capitalizeString(element.name),
                img: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${data.id}.png`,

                //.map() plockar ut typen
                types: data.types.map(t => t.type.name)
            };

            //Skickar in objektet till createCard funktionen
            const card = createCard(pokemon, 0);
            //kortert returneras och läggs in i pokeEvolutionDiv div:en
            div.append(card);

        }

    } catch (err) {
        console.error("Could not set pokemon card: " + "\n" + err);
        return;
    }

}

//sätter team knappens textinnehåll och klass
export function setTeamBtn(id) {

    //parse:ar id:t. 
    const numericId = Number(id);

    //hämtar ut teamet och waitlistan från localstorage
    const { team, waitlist } = _readTeam();

    //Tar bort tidigare klasser
    teamBtn.classList.remove("active", "waitlist");

    //sätter knappens text och klass. Kändes smidigast med en switch
    switch (true) {

        case team.includes(numericId):
            teamBtn.textContent = "In Team";
            teamBtn.classList.add("active");
            break;

        case waitlist.includes(numericId):
            teamBtn.textContent = "In Waitlist";
            teamBtn.classList.add("active", "waitlist");
            break;

        case team.length >= 6:
            teamBtn.textContent = "Add To Waitlist";
            break;

        default:
            teamBtn.textContent = "Add To Team";

    }

};

//Hämtar pokemon infon
export async function renderPokemonDetail(id) {

    try {

        //Ha kvar fetch requesten här men rendera ut allting seperat
        const data = await fetchPokemon(id);

        pokeSprite.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
        pokeSprite.alt = capitalizeString(data.name) + " artwork";
        pokeName.textContent = capitalizeString(data.name);
        document.title = capitalizeString(data.name);

        //Sätter 0:or och # i början av ID:t
        setPokeID(data.id, pokeId);

        //För att slippa två seperata API anrop till samma endpoint
        const description = await fetchSpecies(id);
        renderPokemonDescription(description);

        //Sätter typerna
        const typesArray = getPokemonType(data);
        setPokemonType(typesArray, pokeTypesDiv);

        //knappen
        setTeamBtn(id);

        //Weakness
        const weaknessArray = await getPokemonWeakness(typesArray);
        setPokemonType(weaknessArray, pokeWeaknessDiv);

        //Strengths
        const strengthsArray = await getPokemonStrengths(typesArray);

        //Typen normal är inte stark mot någon annan typ så arrayen kan vara tom
        if (strengthsArray.length === 0) {
            const span = document.createElement("span");
            span.textContent = "None";
            pokeStrengthsDiv.append(span);
        } else {
            setPokemonType(strengthsArray, pokeStrengthsDiv);
        }

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

        //Evolutioner
        const evolutionArray = await getPokemonEvolutions(id);
        renderEvolutions(evolutionArray);

        //Shiny
        shinyImg.src = data.sprites.front_shiny;
        shinyImg.alt = capitalizeString(data.name) + " shiny sprite"

        //Abilities
        pokeHeight.textContent = data.height
        pokeWeight.textContent = data.weight;
        pokeAbility.textContent = capitalizeString(data.abilities[0].ability.name);

        //Kategori
        setPokemonCategory(id, pokeCategory);

        //Suggestions
        const suggestions = await getSugesstedPokemon(weaknessArray, pokeStats);
        setCard(suggestions, suggestionsDiv);

    } catch (err) {
        console.error("Could not render pokemon: " + "\n" + err);
        return;
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
renderPokemonDetail(id);

//Hanterar knapptryck för team knappen
teamBtn.addEventListener("click", () => {
    //parse:ar id till ett nummer eftersom det är det toggleTeamMember och setTeamBtnText förväntar sig
    const numericId = Number(id);

    //funktionen som togglar om pokemonen är i teamet eller waitlist i localstorage
    toggleTeamMember(numericId);
    //sätter texten på knappen och bytter CSS klasssen
    setTeamBtn(numericId);
});