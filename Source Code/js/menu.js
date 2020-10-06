var currentTabName = null;


// Menu
function drawFunctions(radioValue, tabName) {

  d3.selectAll("svg").remove();
  d3.selectAll(".d3-tip").remove();
  document.querySelector('#text_info').style.display = "none";

  if(tabName=="Sampling")
    drawMap(radioValue);
  else if(tabName=="Clustering")
    drawElbowPlot();
  else if(tabName=="Dimensions")
    drawDimensions(radioValue);
  else if(tabName=="Scree Plot")
    drawScreePlot(radioValue);
  else if(tabName=="Top 2 PCA Vectors - Scatter Plot")
    PCA_Top2(radioValue);
  else if(tabName=="Top 3 PCA Data ScatterPlot Matrix")
    PCA_Top3(radioValue);
  else
    MDS(radioValue, tabName);

}


function openTab(evt, tabName) {
  var i, tabcontent, dropbtn;

  currentTabName = tabName;

  tabcontent = document.getElementsByClassName("tabcontent");

  for (i = 0; i < tabcontent.length; i++)
    tabcontent[i].style.display = "none";

  dropbtn = document.getElementsByClassName("dropbtn");
  for (i = 0; i < dropbtn.length; i++) {
    dropbtn[i].className = dropbtn[i].className.replace(" active", "");
  }

  if(tabName=="Clustering")
    document.getElementById("Clustering_Content").style.display = "block";
  else {
    document.getElementById("common_radio_buttons").style.display = "block";
    document.getElementById("default_checked").checked = true;

    radioValue = $("input[name='sampling']:checked").val();

    if(tabName=="Dimensions") {
      document.getElementById("visualize").style.display = "none";
      document.getElementById("dimensions").style.display = "block";
    } else {
        document.getElementById("visualize").style.display = "block";
        document.getElementById("dimensions").style.display = "none";
    }
  }

  document.getElementById("page_header").innerHTML = tabName;

  if(evt.currentTarget.className=="dropbtn") {
    evt.currentTarget.className += " active";
  } else {
    // Change this (Get child "dropbtn" and make it active)
    evt.currentTarget.parentNode.parentNode.className += " active";
  }

  drawFunctions(radioValue, tabName);
}


// Top Nav - Responsive
function responsiveTopnav() {
  var x = document.getElementById("myTopnav");
  if (x.className === "topnav") {
    x.className += " responsive";
  } else {
    x.className = "topnav";
  }
}


// Radio Buttons - Sampling
function radio_select() {
  radioValue = $("input[name='sampling']:checked").val();
  drawFunctions(radioValue, currentTabName);
}
