//Basic info
const pokeSprite = document.getElementById("pokeSprite");
const pokeName = document.getElementById("pokeName");
const pokeId = document.getElementById("pokeId");
const pokeDescription = document.getElementById("pokeDescription");

//Stats
const pokeHP = document.getElementById("pokeHP");
const pokeAttack = document.getElementById("pokeAttack");
const pokeDefense = document.getElementById("pokeDefense");

//Type
const type1 = document.getElementById("type1");
const type2 = document.getElementById("type2");

//Utility function
function capitalizeString(string = "") {
    //1.charAt() hämtar första bokstaven
    //2.toUpperCase() konverterar första bokstaven till storbokstav men ändrar inte originella strängen
    //3.Tar bort första bokstaven och returnnerar resten av strängen
    return string.charAt(0).toUpperCase() + string.slice(1);
}

fetch(`https://pokeapi.co/api/v2/pokemon/1`)
    .then(res => res.json())
    .then(data => {

        pokeSprite.src = data.sprites.front_default;
        pokeName.textContent = capitalizeString(data.name);

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

    });

fetch(`https://pokeapi.co/api/v2/characteristic/1`)
    .then(res => res.json())
    .then(data => {
        const descriptions = data.descriptions;
        pokeDescription.textContent = descriptions[7].description;
    });