data = [{country: 'Bangladesh', population_2012: 105905297, growth: {year_2013:42488 , year_2014:934 , year_2015:52633 , year_2016:112822 , year_2017:160792}},
        {country: 'Ethopia', population_2012: 75656319, growth: {year_2013:1606010 , year_2014:1606705 , year_2015:1600666 , year_2016:1590077 , year_2017:1580805}},
        {country: 'Kenya', population_2012: 33007327, growth: {year_2013:705153 , year_2014:703994 , year_2015:699906 , year_2016:694295 , year_2017:687910}},
        {country: 'Afghanistan', population_2012: 23280573, growth: {year_2013:717151 , year_2014:706082 , year_2015:665025 , year_2016:616262 , year_2017:573643}},
        {country: 'Morocco', population_2012: 13619520, growth: {year_2013:11862 , year_2014:7997 , year_2015:391 , year_2016:-8820 , year_2017:-17029}}]

const numberWithCommas = x => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

 //sort bars based on value
data = data.sort(function (a, b) {
    return d3.ascending(a.population_2012, b.population_2012);
})

//set up svg using margin conventions - we'll need plenty of room on the left for labels
var margin = {
    top: 15,
    right: 25,
    bottom: 50,
    left: 100
};
var width = 960 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

var width_plot = width/3 ,
	height_plot = height;

var space = 0//height/10;

var svg = d3.select("#graphic").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)

var svg2 = d3.select("#graphic").append("svg")
    .attr("width", width_plot + margin.right)
    .attr("height", height_plot + margin.top + margin.bottom)//height/2 + margin.top + margin.bottom)

 
var canvas = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var plot = svg2.append("g")
	.attr("id", "plot")
    .attr("transform", "translate(" + margin.bottom + "," + margin.top + ")")

var x = d3.scaleLinear()
    .range([0, width])
    .domain([0, d3.max(data, function (d) {
        return d.population_2012;
    })]);

var y = d3.scaleBand()
    .rangeRound([height, 0], .1)
    .domain(data.map(function (d) {
        return d.country;
    }));

//make y axis to show bar names
var yAxis = d3.axisLeft()
    .scale(y)
    //no tick marks
    .tickSize(0);


var gy = canvas.append("g")
    .attr("class", "y axis")
    .call(yAxis)

var bars = canvas.selectAll(".unselectedBar")
    .data(data)
    .enter()
    .append("g")

//append rects
bars.append("rect")
    .attr("class", "unselectedBar")
    .attr("y", d => y(d.country) + y.step()/4 - 5)
    .attr("height", y.step() - y.step()/4)
    .attr("x", 0)
    .attr("width", d => x(d.population_2012))
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut);

//add a value label to the right of each bar
bars.append("text")
    .attr("class", "label")
    //y position of the label is halfway down the bar
    .attr("y", function (d) {
        return y(d.country) + y.step() / 2 + 5 ;
    })
    //x position is 3 pixels to the right of the bar
    .attr("x", function (d) {
        return 15;
    })
    .text(d =>numberWithCommas(d.population_2012));

var title = svg.append("text")
	.attr("transform", "translate(" + width/2 + "," + (height + margin.bottom/2)  + ")")
	.text("Bars representing total rural population of each country");


function handleMouseOver(d, i) {  // Add interactivity
	createPlot(d);
	// Use D3 to select element, change color and size
	d3.select(this).attr("class", "selectedBar");
}

function handleMouseOut(d, i) {
	d3.select("#plot").html("");
	d3.select(this).attr("class", "unselectedBar");
	return;

}



function createPlot(d) {
	d3.select("#plot").html("");

	pop_year = Object.values(d.growth);
	pop_year.unshift(d.population_2012);
	pop_cum =[];
	pop_year.reduce(function(a,b,i) { return pop_cum[i] = (a+b);}, 0);
	pop_cum.shift()
	pop_growth_perc = pop_cum.map((d,i) => ((pop_year[i+1]/d) *100));

	dataset = [];
	Object.keys(d.growth).reduce((a,d,i) => {
		dataset.push({'date': d.replace('year_',''), 'value': pop_growth_perc[i]});
	}, 0)

	var y = d3.scaleLinear()
		.domain(d3.extent(pop_growth_perc))
		.range([height_plot/2, 0]);
	var x = d3.scaleLinear()
		.domain(d3.extent(Object.keys(d.growth).map(d=> +d.replace('year_', ''))))
		.range([0, width_plot - margin.bottom]);

	var line = d3.line()
	   .x(function(d) { return x(d.date)})
	   .y(function(d) { return y(d.value)});


	plot.append("g")
	   .attr("transform", "translate(0," + height/2 + ")")
	   .call(d3.axisBottom(x).ticks(5).tickFormat(d=>""+d));
	
	plot.append("text")
		.attr("class", "graphLabel")
		.attr("transform", "translate(" + 0 + "," + height_plot/2  + ")")
		.attr("dx",width_plot - margin.bottom - 10)
		.attr("dy", 29)
		.text("Year");
	   //.select(".domain")
	   //.remove();

	plot.append("g")
		.call(d3.axisLeft(y))
		.append("text")
		.attr("fill", "#000")
		.attr("class", "graphLabel")

		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", "0.71em")
		.attr("text-anchor", "end")
		.text("Pct (%)");

	plot.append("path")
		.datum(dataset)
		.attr("fill", "none")
		.attr("stroke", "steelblue")
		.attr("stroke-linejoin", "round")
		.attr("stroke-linecap", "round")
		.attr("stroke-width", 1.5)
		.attr("d", line);
	
	//plot.

}


