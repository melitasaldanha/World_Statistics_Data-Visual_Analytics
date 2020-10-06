// Elbow Plot
function drawElbowPlot() {

  // Display Spinner
  document.getElementById("spinner").style.display = "block";

  $.ajax({
  	url: "http://127.0.0.1:5000/getElbowData",
  	type: 'GET',
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    crossDomain: true,
  	success: function(dt) {

      // CLose spinner
      document.getElementById("spinner").style.display="none";

      // Data Received
      data = dt.elbow_data;
      knee = dt.knee;
      n = data.length;

      // Set Margins
      node = document.querySelector('#elbow_plot').offsetWidth
      width = 600;
      height = 350;

      // Draw Elbow Plot
      var xScale = d3.scaleLinear()
          .domain([0, n+1]) // input
          .range([0, width-100]); // output

      var yScale = d3.scaleLinear()
          .domain([0, 1]) // input
          .range([height, 0]); // output

      yScale.domain([0, d3.max(data, function(d) { return d.sum_of_sqr_dist; })]);

      var line = d3.line()
          .x(function(d) { return xScale(d.k); }) // set the x values for the line generator
          .y(function(d) { return yScale(d.sum_of_sqr_dist); }) // set the y values for the line generator
          .curve(d3.curveMonotoneX) // apply smoothing to the line

  		var div = d3.select("#Clustering_Content").append("div")
  		    .attr("class", "tooltip")
  		    .style("opacity", 0);

      var dataset = data

      var svg = d3.select("#elbow_plot").append("svg")
          .attr("width", width + 380)
          .attr("height", height + 100)
        .append("g")
          .attr("transform", "translate(380, 20)");

      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(xScale));

      svg.append("text")
           .attr("y", 380)
           .attr("x", 250)
           .attr("dy", ".71em")
          .style("text-anchor", "middle")
          .text("Number of Clusters (k)");

      svg.append("g")
          .attr("class", "y axis")
          .call(d3.axisLeft(yScale));

      svg.append("text")
           .attr("transform", "rotate(-90)")
           .attr("y", -60)
           .attr("x", -(height)/2)
           .attr("dy", ".71em")
           .style("text-anchor", "middle")
           .text("Sum of square of distances");

      svg.append("path")
          .datum(dataset)
          .attr("class", "line_elbow")
          .attr("d", line);

      svg.selectAll(".dot")
          .data(dataset)
        .enter().append("circle")
          .attr("class", function(d, i) { return i==knee?"dot_highlight":"dot_elbow"; })
          .attr("cx", function(d) { return xScale(d.k) })
          .attr("cy", function(d) { return yScale(d.sum_of_sqr_dist) })
          .attr("r", 5)
    			.on("mouseover", function(d, i) {
              div.transition()
                  .duration(200)
                  .style("opacity", .9);
              div	.html("X: "+d.k + "<br/>"  + "Y: "+d.sum_of_sqr_dist)
                  .style("left", (d3.event.pageX) + "px")
                  .style("top", (d3.event.pageY - 28) + "px");

              if(i==knee) {
                div	.html("Optimal k = " + d.k + "<br/> X: " + d.k + ", Y: "+d.sum_of_sqr_dist)
              }
            })
          .on("mouseout", function(d) {
              div.transition()
                  .duration(500)
                  .style("opacity", 0);
            });
    }
  });

}
