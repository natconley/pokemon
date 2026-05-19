function LoadingAnime(){
    hideloadmore();
  const loadingimg = document.createElement('img');
  const loadingtext = document.createElement('p')
  loadingimg.src = "/pokemon/assets/Pokeball-15.png";
  loadingimg.className = "loadingimg"
  loadingtext.className = "loadingtxt";
  loadingtext.innerText = "Loading Content Please Wait......"
  const grid = document.getElementById('grid');
if (grid) {
    grid.appendChild(loadingimg);
    grid.appendChild(loadingtext);
    grid.style.display = "flex";
    grid.style.justifyContent = "center";
    grid.style.minHeight = "100lhv";
}
}
function stoploadingAnime (){
  const grid = document.getElementById('grid');
  grid.innercontent = '';
  grid.style.display = "grid";
  grid.style.justifyContent = "";
  grid.style.height = "";
  showloadmore();

}
function hideloadmore(){
    const loadbtn = document.querySelector('.load-more-wrap');
    if (loadbtn) loadbtn.style.display = "none";
}
function showloadmore(){
    const loadbtn = document.querySelector('.load-more-wrap');
    if (loadbtn) loadbtn.style.display = "flex";
}