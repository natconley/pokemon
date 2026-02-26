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

//Beräknar progressbarens längd
export function setProgressBar(array = []) {

    //Går igenom varje objekt i arrayen
    array.forEach(element => {
        //Blissey har högst bas stats i spelet (255 hp) 
        element.bar.style.width = ((element.stat / 255) * 100) + "%";
    })

};