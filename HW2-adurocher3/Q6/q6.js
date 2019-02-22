var width = 1100,
    height = 600;

var margin = {
    top: 85,
    right: 100,
    bottom: 50,
    left: 100
};

var svg = d3.select("#graphic")
    .append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top);


var map = svg.append("g")
    .attr("class", "counties")
    .attr("transform", "translate(" + margin.left  + "," + margin.top + ")");

var title = svg.append("text")
    .attr("class", "title")
    .attr("y", 2*margin.top/3 )
    .attr("x", width/3)
    .text("Choropleth Map of County Data");

var countyPoverty = d3.map();
var countyDetail = d3.map();

var path = d3.geoPath();


var promises = [
  d3.json("us.json"),
  d3.csv("county_poverty.csv", d => countyPoverty.set(d.CensusId, 
    {poverty: +d.Poverty, state:d.State, county:d.County})),
  d3.csv("county_detail.csv", d =>  countyDetail.set(d.CensusId,
    {"incomePerCap": +d.IncomePerCap, "totalPop": +d.TotalPop}))
]

Promise.all(promises).then(ready);


function ready([us]) {

  var x = d3.scaleLinear()
      .domain(d3.extent(Object.values(countyPoverty), d=> d.poverty))
      .rangeRound([0, height/3]);

  var color = d3.scaleQuantize()
      .domain([0, 18])
      .range(["#f7fcf5", "#e5f5e0", "#c7e9c0", "#a1d99b", "#74c476",
        "#41ab5d", "#238b45", "#006d2c", "#00441b"]);

  var canvas = svg.append("g")
      .attr("class", "key")
      .attr("transform", "translate(" +  width + "," + margin.top + ")");

  var tip = d3.tip()
      .attr('class', 'd3-tip')
      .attr("width", 100)
      .attr("height", 50)
      .offset([-15, 0])
      .html(function(d) {
        var dataPoverty = countyPoverty.get(d.id);
        var dataDetail = countyDetail.get(d.id);
        html = `<span> State: ${dataPoverty.state} </span></br>` + 
        `<span> County: ${dataPoverty.county} </span></br>` + 
        `<span> Poverty Rate: ${dataPoverty.poverty} </span></br>`+
        `<span> Total Population: ${dataDetail.totalPop} </span></br>` +
        `<span> Income per capita: ${dataDetail.incomePerCap} </span></br>`;
        
        return html;
      })

  canvas.call(tip);

  canvas.selectAll("rect")
      .data(color.range().map(function(d) {
        d = color.invertExtent(d);
        if (d[0] == null) d[0] = x.domain()[0];
        if (d[1] == null) d[1] = x.domain()[1];
        return d;
      }))
      .enter().append("rect")
      .attr("x", -20)
      .attr("height", 12)
      .attr("y", function(d) { return x(d[0]) - 5; })
      .attr("width", 20)
      .attr("fill", function(d) { return color(d[0]); });

  canvas.append("text")
      .attr("class", "caption")
      .attr("y", x.range()[0] - 15)
      .attr('x', -35)
      .attr("fill", "#000")
      .attr("text-anchor", "start")
      .attr("font-weight", "bold")
      .text("poverty rate");

  canvas.call(d3.axisRight(x)
      .tickSize(0)
      .tickFormat(function(x, i) { 
         var string = i? ( x + "%") : ("< " + (x+2) + "%");
         string = (i == 8)? ("> " + x) : string;
         console.log(string);
         return string;
      })
      .tickValues(d3.range(0,18,2)))
      .select(".domain")
      .remove();
  
  
  map.selectAll("path")
      .data(topojson.feature(us, us.objects.counties).features)
      .enter().append("path")
      .attr("fill", function(d) { return color(countyPoverty.get(d.id).poverty);})
      .attr("d", path)
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);



  map.append("path")
    .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
    .attr("class", "states")
    .attr("d", path);
}



