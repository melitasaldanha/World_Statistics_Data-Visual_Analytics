// Draw Scatter Plot
function drawScatterPlot(data) {

  // Set Margins
  node = document.querySelector('#visualize').offsetWidth
  width = 600;
  height = 300;

  var x = d3.scaleLinear()
	    .range([0, width]);

	var y = d3.scaleLinear()
	    .range([height, 0]);

	var color = d3.scaleOrdinal(d3.schemeCategory10);
	var xAxis = d3.axisBottom(x);
	var yAxis = d3.axisLeft(y);

  var svg = d3.select("#visualize").append("svg")
	    .attr("width", width + 100)
	    .attr("height", height + 90)
	  .append("g")
	    .attr("transform", "translate(60, 30)");

  x.domain(d3.extent(data, function(d) { return d.x; })).nice();
  y.domain(d3.extent(data, function(d) { return d.y; })).nice();

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

      svg.append("text")
           .attr("y", 330)
           .attr("x", 280)
           .attr("dy", ".71em")
          .style("text-anchor", "middle")
          .text("Component 1");

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);

      svg.append("text")
           .attr("transform", "rotate(-90)")
           .attr("y", -50)
           .attr("x", -(height)/2)
           .attr("dy", ".71em")
           .style("text-anchor", "middle")
           .text("Component 2");

  svg.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 3)
      .attr("cx", function(d) { return x(d.x); })
      .attr("cy", function(d) { return y(d.y); })
			.attr("class", "dot_scatter");

  var legend = svg.selectAll(".legend")
      .data(color.domain())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

  legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d; });
}







// PCA 2D - Scatter Plot
function PCA_Top2(radioValue) {

  $.ajax({
  	url: "http://127.0.0.1:5000/PCA_Top2",
  	type: 'POST',
    data: JSON.stringify({radioValue}),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    crossDomain: true,
  	success: function(dt) {

      // Data Received
      data = dt.pca_scatter_data;

      // Draw 2D Scatter Plot
      drawScatterPlot(data);
    }
  });

}


// MDS - Scatter Plot
function MDS(radioValue, currentTabName) {

  // Display Spinner
  document.getElementById("spinner").style.display = "block";

  $.ajax({
  	url: "http://127.0.0.1:5000/MDS_Distance",
  	type: 'POST',
    data: JSON.stringify({radioValue, currentTabName}),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    crossDomain: true,
  	success: function(dt) {

      // Close Spinner
      document.getElementById("spinner").style.display = "none";

      // Data Received
      data = dt.data;

      // Draw 2D Scatter Plot
      drawScatterPlot(data);
    }
  });

}
