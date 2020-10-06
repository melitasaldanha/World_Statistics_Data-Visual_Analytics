// Scree Plot
function drawScreePlot(radioValue) {

  $.ajax({
  	url: "http://127.0.0.1:5000/getScreeData",
  	type: 'POST',
    data: JSON.stringify({radioValue}),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    crossDomain: true,
  	success: function(dt) {

      // Data Received
      cumulative_data = dt.cumulative
	    var_rat_data = dt.var_rat
      intr_dim_idx = parseInt(dt.intr_dim_idx);
      top_3_pca_loadings = dt.top3pca;

      // Process Data
	    cumulative_data.forEach(function(d){
	      d.p = d.p + 1;
	    });

	    n1 = cumulative_data.length;
	    n2 = var_rat_data.length;

      // Set Text Info
      node = document.querySelector("#text_info")
      node.style.display = "block";
      node.innerHTML = "Attributes with top 3 PCA Loadings: " +
                        top_3_pca_loadings[0] + ", " +
                        top_3_pca_loadings[1] + ", " +
                        top_3_pca_loadings[2];

      // Set Margins
      node = document.querySelector('#visualize').offsetWidth
      width = 600;
      height = 300;


      // Draw Scree Plot
      var xScale = d3.scaleLinear()
        .domain([0, n1+1]) // input
        .range([0, width]); // output

      var yScale = d3.scaleLinear()
        .domain([0, 1]) // input
        .range([height, 0]); // output

      yScale.domain([0, d3.max(cumulative_data, function(d) { return d.cum; })]);

      var div = d3.select("#visualize").append("div")
      		.attr("class", "tooltip")
      		.style("opacity", 0);

      var line = d3.line()
          .x(function(d) { return xScale(d.p); })
          .y(function(d) { return yScale(d.cum); })
          .curve(d3.curveMonotoneX)

      var line2 = d3.line()
          .x(function(d) { return xScale(d.p); })
          .y(function(d) { return yScale(d.rat); })
          .curve(d3.curveMonotoneX)

      var svg = d3.select("#visualize").append("svg")
          .attr("width", width + 60)
          .attr("height", height + 60)
        .append("g")
          .attr("transform", "translate(50, 20)");

      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(xScale));

          svg.append("text")
               .attr("y", 320)
               .attr("x", 280)
               .attr("dy", ".71em")
              .style("text-anchor", "middle")
              .text("Component Number");

      svg.append("g")
          .attr("class", "y axis")
          .call(d3.axisLeft(yScale));

          svg.append("text")
               .attr("transform", "rotate(-90)")
               .attr("y", -50)
               .attr("x", -(height)/2)
               .attr("dy", ".71em")
               .style("text-anchor", "middle")
               .text("Percentage of Explained Variance");

      svg.append("path")
          .datum(cumulative_data)
          .attr("class", "line1")
          .attr("d", line);

      svg.append("path")
          .datum(var_rat_data)
          .attr("class", "line2")
          .attr("d", line2);


      svg.selectAll(".dot")
          .data(cumulative_data)
        .enter().append("circle")
          .attr("class", "dot1")
          .attr("cx", function(d) { return xScale(d.p) })
          .attr("cy", function(d) { return yScale(d.cum) })
          .attr("r", 5)
    			.on("mouseover", function(d) {
                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                div	.html("X: "+d.p + "<br/>"  + "Y: "+d.cum)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
                })
            .on("mouseout", function(d) {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

      svg.selectAll(".dot")
          .data(var_rat_data)
        .enter().append("circle")
          .attr("class", function(d, i) {return intr_dim_idx==i?"dot_highlight":"dot2";})
          .attr("cx", function(d) { return xScale(d.p) })
          .attr("cy", function(d) { return yScale(d.rat) })
          .attr("r", 5)
    			.on("mouseover", function(d, i) {
              div.transition()
                  .duration(200)
                  .style("opacity", .9);

              div	.html("X: "+d.p + "<br/>"  + "Y: "+d.rat)
                  .style("left", (d3.event.pageX) + "px")
                  .style("top", (d3.event.pageY - 28) + "px");

              if(i == intr_dim_idx) {
                div	.html("Intrinsic Dimensionality <br/> X: " + d.p + ", Y: "+d.rat)
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
