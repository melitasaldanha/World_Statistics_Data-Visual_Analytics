function processData() {

  // Display Spinner
  document.getElementById("spinner").style.display = "block";

  $.ajax({
  	url: "http://127.0.0.1:5000/",
  	type: 'GET',
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    crossDomain: true,
  	success: function(dt) {

      // CLose spinner
      document.getElementById("spinner").style.display="none";

      // Get the element with id="defaultOpen" and click on it
      document.getElementById("defaultOpen").click();
    }
  });
}
