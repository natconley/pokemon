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

//Abilities
const pokeHeight = document.getElementById("pokeHeight");
const pokeWeight = document.getElementById("pokeWeight");
const pokeAbility = document.getElementById("pokeAbility");

//Utility function
export function capitalizeString(string = "") {
    //1.charAt() hämtar första bokstaven
    //2.toUpperCase() konverterar första bokstaven till storbokstav men ändrar inte originella strängen
    //3.Tar bort första bokstaven och returnnerar resten av strängen
    return string.charAt(0).toUpperCase() + string.slice(1);
}

//Beräknar progressbarens längd
export function setProgressBar(pokeArray = []) {

    //Går igenom varje objekt i arrayen
    pokeArray.forEach(element => {
        //Blissey har högst bas stats i spelet (255 hp) 
        element.bar.style.width = ((element.stat / 255) * 100) + "%";
    });

}

//Hämtar pokemon beskrivning
export function fetchPokeDescription(id = 1) {
    fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`)
        .then(res => res.json())
        .then(data => {
            // Hämtar flavor text
            const descriptions = data.flavor_text_entries;

            //Flavor texten har har en konstig tecken mitt i strängen
            //Tecknet tas bort via replace. Replace() returnerar en ny sträng
            const rawDescription = descriptions[0].flavor_text;
            const description = rawDescription.replace("", " ");

            pokeDescription.textContent = description;

        })
};

//Hämtar pokemon infon
export function fetchPokemon(id = 900) {
    fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
        .then(res => res.json())
        .then(data => {

            pokeSprite.src = data.sprites.front_default;
            pokeName.textContent = capitalizeString(data.name);
            document.title = capitalizeString(data.name);

            //Lägger till hashtag och nollor i början
            //padStart är en string metod som lägger till tecken i början av en string
            pokeId.textContent = "#" + data.id.toString().padStart(4, '0');

            const types = data.types;
            type1.textContent = capitalizeString(types[0].type.name);

            //Om det finns mer än en typ visas även andra typ labeln
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

            fetchPokeDescription(id);

        })
};

fetchPokemon();