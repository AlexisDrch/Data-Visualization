
movies = {};

d3.csv("movies.csv", d => {
	// parse string
	return {
		Id : +d.Id,
		Title : d.Title,
		Year : +d.Year,
		Runtime : +d.Runtime,
		Country: d.Country,
		Rating: +d.Rating,
		Votes: +d.votes,
		Budget: +d.Budget,
		Gross: +d.Gross,
		WinsNoms: +d.WinsNoms,
		IsGoodRating: +d.IsGoodRating
	};

}).then(dataset => {
	var w = 1000;
	var h = 300;
	var padding = 50;

	// a.1
	//Define linear scalers
	var xScale_a_1 = d3.scaleLinear()
		.domain([0, d3.max(dataset, d=> d.Rating)])
		.range([padding, w - padding * 2]);

	var yScale_a_1 = d3.scaleLinear()
		.domain([0, d3.max(dataset, d=> d.WinsNoms)])
		.range([h - padding, padding]);

	//Create SVG element
	var svg = d3.select("body")
				.append("svg")
				.attr("width", w)
				.attr("height", h);

	var r = 5;
	var cross = r*2
	
	//Define X axis
	var xAxis = d3.axisBottom()
		.scale(xScale_a_1);

	//Define Y axis
	var yAxis = d3.axisLeft()
		.scale(yScale_a_1);

	//Create circles
	svg.selectAll("circle.data")
	   .data(dataset.filter(d=>!(d.IsGoodRating)))
	   .enter()
	   .append("circle")
	   .attr("class", "data bad_rating")
	   .attr("cx", d => xScale_a_1(d.Rating))
	   .attr("cy", d => yScale_a_1(d.WinsNoms))
	   .attr("r",  d => r)

	//Create h line for cross
	svg.selectAll("rect.hline")
	   .data(dataset.filter(d=>(d.IsGoodRating)))
	   .enter()
	   .append("rect")
	   .attr("class", "hline good_rating")
	   .attr("x", d => xScale_a_1(d.Rating) - cross/2)
	   .attr("y", d => yScale_a_1(d.WinsNoms) - cross/4)
	   .attr("width", cross)
	   .attr("height", cross/2);
	
	//Create v line for cross
	svg.selectAll("rect.vline")
	   .data(dataset.filter(d=>(d.IsGoodRating)))
	   .enter()
	   .append("rect")
	   .attr("class", "vline good_rating")
	   .attr("x", d => xScale_a_1(d.Rating) - cross/4)
	   .attr("y", d => yScale_a_1(d.WinsNoms) - cross/2)
	   .attr("width", cross/2)
	   .attr("height", cross);

	//Create X axis
	svg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(0," + (h - padding) + ")")
		.call(xAxis);
	
	//Create Y axis
	svg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(" + padding + ",0)")
		.call(yAxis);

	//Create legend
	svg.append("text")
		.text("Wins+Nominations vs. Rating")
		.attr("x", w/2 - padding/2)
	    .attr("y", padding/2)
		.attr("font-family", "sans-serif")
		.attr("font-size", "15px")
	
	svg.append("circle")// add circle legend
		.attr("r",  d => r)
		.attr("cx", w - padding - r*2)
		.attr("cy", padding/2 -r)
		.attr("class", "bad_rating")
	
	svg.append("text") // add text legend
		.text("bad rating")
		.attr("x", w - padding)
		.attr("y", padding/2)
		.attr("class", "legend")

	svg.append("rect")// add cross h legend
		.attr("x", w - padding - r*2 - cross/2)
		.attr("y", padding/2 + 10 -r/2 - cross/4)
	   	.attr("width", cross)
	   	.attr("height", cross/2)
		.attr("class", "good_rating")

	svg.append("rect")// add cross v legend
		.attr("x", w - padding - r*2 - cross/4)
		.attr("y", padding/2 + 10 -r/2 - cross/2)
	   	.attr("width", cross/2)
	   	.attr("height", cross)
		.attr("class", "good_rating")
	
	svg.append("text") // add text legend
		.text("good rating")
		.attr("x", w - padding)
		.attr("y", padding/2 + 10)
		.attr("class", "legend")

	svg.append("text")
		.text("Wins+Noms")
		.attr("x", w/2 - padding/2)
	    .attr("y", h - padding/2)
	    .attr("class", "legend")

	svg.append("text")
		.text("Rating")
		.attr("transform", "rotate(-90)")
		.attr("x", -h/2)
	    .attr("y", padding/4)
	    .attr("class", "legend")

	/*[6 points] Create two scatter plots, one for each feature combination specified below. 
		In the scatter plots, visualize “good rating” class instances as blue crosses, 
		and “bad rating” instances as red circles. Add a legend to the top right corner 
		showing the symbols’ mapping to the classes.
		
		Feature 10 (Wins and nominations) vs. Feature 6 ( Rating)
		Figure title: Wins+Nominations vs. Rating
		X axis (horizontal) label: Rating
		Y axis (vertical) label: Wins+Noms*/
	
	console.log(dataset[0]);


})
