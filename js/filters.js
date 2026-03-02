/*En funktion som hämtar alla typer för filter "tjuvat styling från api.js och funktionen getTypeTheme()" 
sen rendrar de i html index fil*/
async function poketypes() {
  const response = await fetch(`https://pokeapi.co/api/v2/type`);
  const results = await response.json();
  const typesarray = results.results.map(result => result.name);

  const typeList = document.getElementById("typelist");

  typesarray.forEach((type) => {
    const th = getTypeTheme(type);
    const listitem = document.createElement("li");

    const typebox = document.createElement("input");
    typebox.className = "filterlist";
    typebox.type = "checkbox";
    typebox.value = type;
    typebox.id = type;

    const spantxt = document.createElement("span");
    spantxt.innerText = type;
    spantxt.style.cssText = `background:${th.bg}; border-color:${th.col}; color:${th.col};`;

    const label = document.createElement("label");
    label.className = "type-filter";
    label.htmlFor = type;

    label.appendChild(typebox);
    label.appendChild(spantxt);
    listitem.appendChild(label);
    typeList.appendChild(listitem);

    typebox.addEventListener("change", () => {
      if (typebox.checked) {
        spantxt.style.cssText = `background:${th.bg}; border-color:${th.col}; color:${th.col};  outline: 3px solid white;`;
      } else {
        spantxt.style.cssText = `background:${th.bg}; border-color:${th.col}; color:${th.col};`;
      }
      applyFiltersAndRender();
    });
  });
}
poketypes();
//display filters function
function showfilters() {
  const typelist = document.getElementById(`typelist`);
  const filtersliders = document.getElementById(`filterssliders`);
  const isVisible = filtersliders.style.display === 'flex';

  typelist.style.display = isVisible ? 'none' : 'flex';
  filtersliders.style.display = isVisible ? 'none' : 'flex';
}
//sliders and inputs are linked together and an event listner for the sliders to call a filter function
document.querySelectorAll(".statslider").forEach(slider => {
  slider.addEventListener(`input`, () => {
    document.getElementById(slider.id.replace(`slider`, `number`)).value = slider.value;
    applyFiltersAndRender();
  });
});
document.querySelectorAll(".statsinput").forEach(input => {
  input.addEventListener('input', () => {
    document.getElementById(input.id.replace('number', 'slider')).value = input.value;
    applyFiltersAndRender();
  });
});