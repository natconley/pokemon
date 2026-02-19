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
const pokeBar = document.querySelector(".pokeBar");

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
export function calculateProgressBar(HPbar = 1) {
    //Denna funktion fungerar endast på hp statsen just nu men tanken är attdet ska vara dynamiskt
    pokeBar.style.width = HPbar + "%";
}

//Hämtar pokemon beskrivning
export function fetchPokeDescription(id = 1) {
    fetch(`https://pokeapi.co/api/v2/characteristic/${id}`)
        .then(res => res.json())
        .then(data => {
            const descriptions = data.descriptions;
            pokeDescription.textContent = descriptions[7].description;
        })
};

//Hämtar pokemon infon
export function fetchPokemon(id = 1) {
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

            //Abilities
            pokeHeight.textContent = data.height
            pokeWeight.textContent = data.weight;
            pokeAbility.textContent = capitalizeString(data.abilities[0].ability.name);

            fetchPokeDescription(id);
            calculateProgressBar(data.stats[0].base_stat);

        })
};

fetchPokemon();