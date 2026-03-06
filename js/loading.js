function LoadingAnime(){
    hideloadmore();
  const loadingdiva = document.createElement('div');
  loadingdiva.className = "loadingdiva";
  const loadingdivb = document.createElement('div');
  loadingdivb.className = "loadingdivb";
    const loadingdivc = document.createElement('div');
  loadingdivc.className = "loadingdivc";
    const loadingtext = document.createElement('p');
  loadingtext.className = "loadingtxt";
  loadingtext.innerText = "Loading Content Please Wait......"
  document.getElementById(`grid`).appendChild(loadingdiva);
  document.getElementById(`grid`).appendChild(loadingdivb);
  document.getElementById(`grid`).appendChild(loadingdivc);
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