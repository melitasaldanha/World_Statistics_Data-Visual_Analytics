// Dimensions
function drawDimensions(radioValue) {

  $.ajax({
  	url: "http://127.0.0.1:5000/getDimensions",
  	type: 'POST',
    data: JSON.stringify({radioValue}),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    crossDomain: true,
  	success: function(dt) {

      // Data Received
      dimensions = dt.dimensions;

      // Display cross for attributes not present
      node = $(".col");
      for(i=0; i<node.length; i++) {
        id = node[i].id;

        if(dimensions.includes(id))
          document.querySelector("#"+id).querySelector(".cross").style.display = "none";
        else
          document.querySelector("#"+id).querySelector(".cross").style.display = "block";
      }

    }
  });

}
