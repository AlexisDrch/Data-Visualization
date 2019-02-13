var width = 1100,
    height = 600;

var margin = {
    top: 50,
    right: 100,
    bottom: 50,
    left: 25
};

var svg = d3.select("#graphic")
    .append("svg")
    .attr("width", width )
    .attr("height", height + margin.top);

var title = svg.append("text")
    .attr("class", "title")
    .attr("y", margin.top/2)
    .attr("x", width/3)
    .text("Choropleth Map of County Data");

var povertyRate = d3.map();

var path = d3.geoPath();

var x = d3.scaleLinear()
    .domain([1, 10])
    .rangeRound([0, height/3]);

var color = d3.scaleThreshold()
    .domain(d3.range(2, 10))
    .range(d3.schemeGreens[9]);

var g = svg.append("g")
    .attr("class", "key")
    .attr("transform", "translate(" + (width - margin.right) + ",40)");

g.selectAll("rect")
    .data(color.range().map(function(d) {
      d = color.invertExtent(d);
      if (d[0] == null) d[0] = x.domain()[0];
      if (d[1] == null) d[1] = x.domain()[1];
      return d;
    }))
    .enter().append("rect")
    .attr("x", -20)
    .attr("height", function(d) { return x(d[1]) - x(d[0]); })
    .attr("y", function(d) { return x(d[0]); })
    .attr("width", 20)
    .attr("fill", function(d) { return color(d[0]); });

g.append("text")
    .attr("class", "caption")
    .attr("y", x.range()[0] - 10)
    .attr('x', -35)
    .attr("fill", "#000")
    .attr("text-anchor", "start")
    .attr("font-weight", "bold")
    .text("poverty rate");

g.call(d3.axisRight(x)
    .tickSize(0)
    .tickFormat(function(x, i) { return i ? x : x + "%"; })
    .tickValues(color.domain()))
    .select(".domain")
    .remove();

var promises = [
  d3.json("us.json"),
  d3.csv("county_poverty.csv", d => povertyRate.set(d.CensusId, +d.Poverty))
]

Promise.all(promises).then(ready);

function ready([us]) {
  
  svg.append("g")
    .attr("class", "counties")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.counties).features)
    .enter().append("path")
    .attr("fill", function(d) { return color(d.poverty = povertyRate.get(d.id)); })
    .attr("d", path)
    .append("title")
    .text(d=>  d.poverty + "%");

  /*svg.append("path")
    .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
    .attr("class", "states")
    .attr("d", path);*/
}



