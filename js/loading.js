function LoadingAnime(){
    hideloadmore();
  const loadingimg = document.createElement('img');
  const loadingtext = document.createElement('p')
  loadingimg.src = "/assets/Pokeball-15.png";
  loadingimg.className = "loadingimg"
  loadingtext.className = "loadingtxt";
  loadingtext.innerText = "Loading Content Please Wait......"
  document.getElementById(`grid`).appendChild(loadingimg);
  document.getElementById(`grid`).appendChild(loadingtext);
  document.getElementById(`grid`).style.display = "flex";
  document.getElementById(`grid`).style.justifyContent = "center";
  document.getElementById(`grid`).style.minHeight = "100lhv";
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
    loadbtn.style.display = "none";
}
function showloadmore(){
    const loadbtn = document.querySelector('.load-more-wrap');
    loadbtn.style.display = "flex";
}