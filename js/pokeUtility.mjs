// FETCH POKEMON FROM API (Natalies funktion)
export async function fetchPokemon(pokemon) {
    //funktionen förväntar sig antingen ett pokemon id eller namnet på pokemonen
    try {

        // Hämtar data från API
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);
        // Validerar att information kunde hämtas
        // response.ok = statskod 200 - 299, !response.ok = alla andra statuskoder
        if (!response.ok) {
            throw new Error(`Failed to fetch Pokémon ID ${pokemon}. Status: ${response.status}`);
        }

        // parse:ar JSON svaret till ett javaScript objekt
        const data = await response.json();
        // Returnerar javascript objektet
        return data;

    } catch (err) {
        // Fångar fel (nätverksfel eller kastade fel ovan) och returnerar null
        console.error("Error fetching Pokémon" + "\n" + err);
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

            // parse:ar JSON svaret till ett javaScript objekt
            const data = await response.json();
            //lägger datan i session storage
            sessionStorage.setItem(type, JSON.stringify(data));
            // Returnerar javascript objektet
            return data;

        } else {

            const data = sessionStorage.getItem(type);
            return JSON.parse(data);

        }

    } catch (err) {
        console.error("Error fetching type" + "\n" + err);
        return null;
    }

}

export async function fetchSpecies(id = 1) {

    try {

        //Lägger till species informationen i session storage för att minska API anropen
        if (!sessionStorage.getItem(`species_${id}`)) {

            // Hämtar data från API
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
            // Validerar att information kunde hämtas
            // response.ok = statskod 200 - 299, !response.ok = alla andra statuskoder
            if (!response.ok) {
                throw new Error(`Failed to fetch Pokémon species ${id}. Status: ${response.status}`);
            }

            // parse:ar JSON svaret till ett javaScript objekt
            const data = await response.json();
            //lägger datan i session storage
            sessionStorage.setItem(`species_${id}`, JSON.stringify(data));
            // Returnerar javascript objektet
            return data;

        } else {

            const data = sessionStorage.getItem(`species_${id}`);
            return JSON.parse(data);

        }

    } catch (err) {
        console.error("Error fetching species" + "\n" + err);
        return null;
    }

}

export async function fetchEvolutionChain(id = 1) {

    try {

        //Lägger till evolutionerna i session storage för att minska API anropen
        if (!sessionStorage.getItem(`evolution-chain_${id}`)) {

            // Hämtar data från API
            const response = await fetch(`https://pokeapi.co/api/v2/evolution-chain/${id}`);
            // Validerar att information kunde hämtas
            // response.ok = statskod 200 - 299, !response.ok = alla andra statuskoder
            if (!response.ok) {
                throw new Error(`Failed to fetch Pokémon evolution-chain ${id}. Status: ${response.status}`);
            }
            // Omvandlar till JSON
            const data = await response.json();
            //lägger datan i session storage
            sessionStorage.setItem(`evolution-chain_${id}`, JSON.stringify(data));
            // Returnerar javascript objektet
            return data;

        } else {

            const data = sessionStorage.getItem(`evolution-chain_${id}`);
            return JSON.parse(data);

        }

    } catch (err) {
        console.error("Error fetching evolution-chain" + "\n" + err);
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

// läser och returnerar team och waitlist från localStorage som två separata arrayer.
// går något fel returneras tomma arrayer.
export function _readTeam() {
  try {
    const team = JSON.parse(localStorage.getItem('pokemonTeam') || '[]');
    const waitlist = JSON.parse(localStorage.getItem('pokemonWaitlist') || '[]');
    return { team, waitlist };
  } catch {
    return { team: [], waitlist: [] };
  }
}

export function toggleTeamMember(id) {
  const { team, waitlist } = _readTeam();

  if (team.includes(id)) {
    const updated = team.filter(x => x !== id);
    waitlist.push(id);
    localStorage.setItem('pokemonTeam', JSON.stringify(updated));
    localStorage.setItem('pokemonWaitlist', JSON.stringify(waitlist));
  } else if (waitlist.includes(id)) {
    if (team.length < 6) {
      const updated = waitlist.filter(x => x !== id);
      team.push(id);
      localStorage.setItem('pokemonTeam', JSON.stringify(team));
      localStorage.setItem('pokemonWaitlist', JSON.stringify(updated));
    }
  } else {
    if (team.length < 6) {
      team.push(id);
      localStorage.setItem('pokemonTeam', JSON.stringify(team));
    } else if (waitlist.length < 10) {
      waitlist.push(id);
      localStorage.setItem('pokemonWaitlist', JSON.stringify(waitlist));
    }
  }
  document.dispatchEvent(new CustomEvent('teamchange', { detail: { id } }));
}