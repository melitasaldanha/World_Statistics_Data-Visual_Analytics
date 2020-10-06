// Map
function drawMap(radioValue) {

  $.ajax({
  	url: "http://127.0.0.1:5000/getMapData",
  	type: 'POST',
    data: JSON.stringify({radioValue}),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    crossDomain: true,
  	success: function(dt) {

      sampled_countries = dt.sampled_countries;
      countries_no_data = ["Greenland","Sudan","Montenegro","Macedonia","Slovakia","Kyrgyzstan","Laos","Taiwan","Myanmar","Kuwait","Falkland Islands"];

      var format = d3.format(",");

      // Set tooltips
      var tip = d3.tip()
                  .attr('class', 'd3-tip')
                  .offset([-10, 0])
                  .html(function(d) {
                    return "<strong>Country: </strong><span class='details'>" + d.properties.name + "<br></span>" + "<strong>Population: </strong><span class='details'>" + format(d.population) +"</span>";
                  })

      var margin = {top: -550, right: 0, bottom: 0, left: 0},
                  width = 1200 - margin.left - margin.right,
                  height = 10 - margin.top - margin.bottom;

      var color1 = d3.scale.threshold()
          .domain([10000, 100000, 500000, 1000000, 5000000, 10000000, 50000000, 100000000, 500000000, 1500000000, 1700000000])
          .range(["rgb(247,251,255)", "rgb(222,235,247)", "rgb(198,219,239)", "rgb(158,202,225)", "rgb(107,174,214)", "rgb(66,146,198)","rgb(33,113,181)","rgb(8,81,156)","rgb(8,48,107)","rgb(3,19,43)","rgb(255,165,0)"]);

      var color2 = d3.scale.threshold()
          .domain([1700000000])
          .range(["rgb(255,165,0)"]);

      var color3 = d3.scale.threshold()
          .domain([1700000000])
          .range(["rgb(255,255,255)"]);

      var path = d3.geo.path();

      var svg = d3.select("#visualize")
                  .append("svg")
                  .attr("width", width)
                  .attr("height", height)
                  .append('g')
                  .attr('class', 'map');

      var projection = d3.geo.mercator()
                         .scale(130)
                        .translate( [width / 2, height / 1.5]);

      var path = d3.geo.path().projection(projection);

      svg.call(tip);

      queue()
          .defer(d3.json, "../data/world_countries.json")
          .defer(d3.tsv, "../data/world_population.tsv")
          .await(ready);

      function ready(error, data, population) {
        var populationById = {}, populationByName = {};

        population.forEach(function(d) {

          populationById[d.id] = +d.population;
          populationByName[d.id] = d.name;

        });

        data.features.forEach(function(d) {
          d.population = populationById[d.id]
        });

        svg.append("g")
            .attr("class", "countries")
          .selectAll("path")
            .data(data.features)
          .enter().append("path")
            .attr("d", path)
            .style("fill", function(d) {
              if(countries_no_data.includes(populationByName[d.id]))
                return color3(populationById[d.id]);
              else if(sampled_countries.includes(populationByName[d.id]))
                return color1(populationById[d.id]);
              else
                return color2(populationById[d.id]);
            })
            .style('stroke', 'white')
            .style('stroke-width', 1.5)
            .style("opacity",0.8)

            // tooltips
              .style("stroke","white")
              .style('stroke-width', 0.3)
              .on('mouseover',function(d){
                tip.show(d);

                d3.select(this)
                  .style("opacity", 1)
                  .style("stroke","white")
                  .style("stroke-width",3);
              })
              .on('mouseout', function(d){
                tip.hide(d);

                d3.select(this)
                  .style("opacity", 0.8)
                  .style("stroke","white")
                  .style("stroke-width",0.3);
              });

        svg.append("path")
            .datum(topojson.mesh(data.features, function(a, b) { return a.id !== b.id; }))
            .attr("class", "names")
            .attr("d", path);
      }

    }

  });
}
