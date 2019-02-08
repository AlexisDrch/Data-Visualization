yMap = {
	Bronx : 0,
	Brooklyn : 1,
	Manhattan : 2,
	Queens : 3,
	StatenIsland: 4
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
		dataset.push({'year': row.Year, 'type': row.CrimeType, 'borough': 'StatenIsland', 'count': row.StatenIsland});
	});

	var w = 1000;
	var h = 700;
	var padding = 100;
	var defaultDate = 2011;

	var svg = d3.select("body")
		.append("svg")
		.attr("width", w)
		.attr("height", h)
		.append("g");

	var canvas = svg
		.append("g")
		.attr("id", "canvasA")

	function renderTiles(newDataset) {
		//Clean old
		d3.select("#canvasA").html("");

		// create range for heatmap z axis (crime count)
		console.log(newDataset);
		var tiles = canvas.selectAll("rect")
			.data(newDataset)
		
		console.log(newDataset[0].year, newDataset[0].type, newDataset[0].count, zScale(newDataset[0].count))
		
		tiles.enter()
			.append("rect")
			.transition()
			.duration(0)
			.attr("x", d => {console.log(d.year); return xScale(xMap[d.type])})
			.attr("y", d => yScale(yMap[d.borough] + yStep))
			.attr("width", xScale(xStep) - xScale(0))
			.attr("height",  yScale(0) - yScale(yStep))
			.style("fill", d => zScale(d.count))
		
		tiles.exit().remove();
	}

	uniqueDates = dataset.map(d => d.year).filter((d,i,arr) => arr.indexOf(d) === i);
	
	var dropDown = d3.select("body")
		.append("select")
		.attr("x", w/2)
		.attr("y", padding/2)
    	.attr("name", "date-list")
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

	var zScale = d3.scaleLinear()
			.domain([0, d3.max(dataset, d=>d.count)])
		    .range(["#FFF","#5E4FA2"]);

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

});