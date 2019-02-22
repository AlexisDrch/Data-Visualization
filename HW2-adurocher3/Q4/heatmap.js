yMap = {
	Bronx : 4,
	Brooklyn : 3,
	Manhattan : 2,
	Queens : 1,
	'Staten Island': 0
};
xMap = {
	Assault: 0,
	Burglary:1,
	Housing:2,
	Murder:3,
	Robbery:4,
	Shooting:5
}

d3.csv("heatmap.csv", d => {
	// parse string
	return {
		Bronx : +d.Bronx,
		Brooklyn : +d.Brooklyn,
		Manhattan : +d.Manhattan,
		Queens : +d.Queens,
		StatenIsland: +d['Staten Island'],
		CrimeType: d['Crime Type'],
		Year: +d.Year
	};
})
.then(csv => { 
	dataset = []
	csv.forEach(row => {
		// initialize array
		dataset.push({'year': row.Year, 'type': row.CrimeType, 'borough': 'Bronx', 'count': row.Bronx});
		dataset.push({'year': row.Year, 'type': row.CrimeType, 'borough': 'Brooklyn', 'count': row.Brooklyn});
		dataset.push({'year': row.Year, 'type': row.CrimeType, 'borough': 'Manhattan', 'count': row.Manhattan});
		dataset.push({'year': row.Year, 'type': row.CrimeType, 'borough': 'Queens', 'count': row.Queens});
		dataset.push({'year': row.Year, 'type': row.CrimeType, 'borough': 'Staten Island', 'count': row.StatenIsland});
	});

	var w = 1000;
	var h = 700;
	var padding = 100;
	var defaultDate = 2011;

	var svg = d3.select(".d3")
		.append("svg")
		.attr("width", w)
		.attr("height", h)
		.append("g");

	var canvas = svg
		.append("g")
		.attr("id", "canvas");
	var legendCanvas = svg
		.append("g")
		.attr("id", "legendCanvas");

	function renderTiles(newDataset) {
		//Clean old
		d3.select("#canvas").html("");
		d3.select("#legendCanvas").html("");

		var zScale = d3.scaleQuantile()
			.domain([d3.min(newDataset, d=>d.count), d3.max(newDataset, d=>d.count)])
		    .range([ "#ffffcc","#ffeda0", "#fed976","#feb24c", "#fd8d3c", "#fc4e2a",
		    	"#e31a1c", "#bd0026", "#800026"]);
		  
		//// Add a legend for the color values.
		legend = zScale.quantiles().reverse()
		legend.push(d3.min(newDataset, d=>d.count))
		
		var legend = legendCanvas.selectAll(".legend")
			.data(legend)
			.enter().append("g")
			.attr("class", "legend")
			.attr("transform", function(d, i) { return "translate(" + (w - padding+ 20) + "," + (20 + (i+1) * 20) + ")"; });


		legend.append("rect")
			.attr("width", 20)
			.attr("height", 20)
			.style("fill", d=> {return zScale(d)});

		legend.append("text")
			.attr("x", 26)
			.attr("y", 10)
			.attr("dy", ".35em")
			.text(d=> `> ${Math.round(d)}`);

		//legend.exit().remove();

		// create range for heatmap z axis (crime count)
		var tiles = canvas.selectAll("rect")
			.data(newDataset)
		
		tiles.enter()
			.append("rect")
			.transition()
			.duration(0)
			.attr("rx", 7)
			.attr("ry",7) 
			.attr("x", d => xScale(xMap[d.type]))
			.attr("y", d => yScale(yMap[d.borough] + yStep))
			.attr("width", xScale(xStep) - xScale(0))
			.attr("height",  yScale(0) - yScale(yStep))
			.style("fill", d => {/*console.log(d); */return zScale(d.count);});
		
		tiles.exit().remove();
	}

	uniqueDates = dataset.map(d => d.year).filter((d,i,arr) => arr.indexOf(d) === i);
	
	var dropDown = d3.select("#selectYear")
    	.attr("name", "date-list")
    	.attr("class", "select")
    	.on('change', onchange);
    	

    var options = dropDown.selectAll("option")
		.data(uniqueDates)
		.enter()
		.append("option")
		.text(d => d)
		.attr("value", d=>d);

	function onchange() {
		selectedYear = d3.select('select').property('value')
		renderTiles(dataset.filter(d=> d.year == selectedYear));
	};

	

	var xScale = d3.scaleLinear()
		.domain(d3.extent(dataset, d=> xMap[d.type]))
		.range([padding, w - padding * 2]);
	var yScale = d3.scaleLinear()
		.domain(d3.extent(dataset, d=> yMap[d.borough]))
		.range([h - padding, padding]);

	// extend bucket
	var xStep = 1,
    	yStep = 1;
	xScale.domain([xScale.domain()[0], xScale.domain()[1] + xStep]);
  	yScale.domain([yScale.domain()[0], yScale.domain()[1] + yStep]);

	// render Tiles for default date	
	renderTiles(dataset.filter(d=> d.year == defaultDate));

	
	const formatX = val => {var key;
		if (val == Math.floor(val)) return;
		Object.keys(xMap).forEach(d=> {if (xMap[d] == Math.floor(val)) { key = d}}); return key;}
	const formatY = val => {var key;
		if (val == Math.floor(val)) return;
		Object.keys(yMap).forEach(d=> {if (yMap[d] == Math.floor(val)) { key = d}}); return key;}
	

	// Define X axis
	var xAxis = d3.axisBottom()
		.scale(xScale)
		.ticks(12)
		.tickFormat(formatX);
	//Define Y axis
	var yAxis = d3.axisLeft()
		.scale(yScale)
		.ticks(10)
		.tickFormat(formatY);

	// Create X Axis
	svg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(0," + (h - padding) + ")")
		.call(xAxis);
	
	//Create Y axis
	svg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(" + padding + ",0)")
		.call(yAxis);

	//Create title
	svg.append("text")// add title 
		.text("Visualizing Crimes in New York city")
		.attr("x", w/2 - padding/2)
	    .attr("y", padding/2)
		.attr("font-family", "sans-serif")
		.attr("font-size", "15px")

	// Legend title
	svg.append("text")
		.attr("class", "label")
		.attr("x", w - padding + 20)
		.attr("y", 10)
		.attr("dy", ".35em")
		.text("Count");

});