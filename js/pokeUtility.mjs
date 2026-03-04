// FETCH POKEMON FROM API (Natalies funktion)
export async function fetchPokemon(id) {
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

export async function fetchType(type = "") {

    try {

        //Lägger till typerna i session storage för att minska API anropen
        if (!sessionStorage.getItem(type)) {

            // Hämtar data från API
            const response = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
            // Validerar att information kunde hämtas
            // response.ok = statskod 200 - 299, !response.ok = alla andra statuskoder
            if (!response.ok) {
                throw new Error(`Failed to fetch Pokémon type ${type}. Status: ${response.status}`);
            }
            // Omvandlar till JSON
            const data = await response.json();

            sessionStorage.setItem(type, JSON.stringify(data));

            return data;

        } else {

            const data = sessionStorage.getItem(type);
            return JSON.parse(data);

        }

    } catch (error) {
        console.error("Error fetching type", error);
        // loadTeam renderar null som empty slot
        return null;
    }

}

//Gör förstabokstaven till storbokstav
export function capitalizeString(string = "") {
    //1.charAt() hämtar första bokstaven
    //2.toUpperCase() konverterar första bokstaven till storbokstav men ändrar inte originella strängen
    //3.Tar bort första bokstaven och returnnerar resten av strängen
    return string.charAt(0).toUpperCase() + string.slice(1);
}

//Sätter 0:or och # i början av ID:t
export function setPokeID(id = 0, span = "") {

    //Lägger till hashtag och nollor i början
    //padStart är en string metod som lägger till tecken i början av en string
    return span.textContent = "#" + id.toString().padStart(4, '0');

}

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
export function setPokemonType(typesArray = [], div) {

    div.classList.add("card-types");

    typesArray.forEach(element => {
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

//Beräknar progressbarens längd
export function setProgressBar(array = []) {

    //Går igenom varje objekt i arrayen
    array.forEach(element => {
        //Blissey har högst bas stats i spelet (255 hp) 
        element.bar.style.width = ((element.stat / 255) * 100) + "%";
    })

};