const polygon = (x,y,r) => `${x-r/2},${y+r} ${x-r/2},${y+r/2} ${x-r},${y+r/2}
		 ${x-r},${y-r/2} ${x-r/2},${y-r/2} ${x-r/2},${y-r}
		 ${x+r/2},${y-r} ${x+r/2},${y-r/2} ${x+r},${y-r/2}
		 ${x+r},${y+r/2} ${x+r/2},${y+r/2} ${x+r/2},${y+r}`;


function scatterPlot(dataset, featureX, featureY, svg, xScale, yScale, title = 'Your scatterplot',
	xlabel= 'X axis', ylabel= 'Y axis', w=1000, h=500, padding=100, featureSized = false) {
	var r = 6;
	//Define X axis
	var xAxis = d3.axisBottom()
		.scale(xScale);
	//Define Y axis
	var yAxis = d3.axisLeft()
		.scale(yScale);

	var rScale= d3.scaleLinear()
		.domain([d3.min(dataset, d => d[featureSized]),
			d3.mean(dataset, d => d[featureSized]),
			d3.max(dataset, d => d[featureSized])])
		.range([1, 5, 15]);

	svg.selectAll("circle.circle")
	   .data(dataset.filter(d=>!(d.IsGoodRating)))
	   .enter()
	   .append("circle")
	   .attr("class", "circle bad_rating")
	   .attr("cx", d => xScale(d[featureX]))
	   .attr("cy", d => yScale(d[featureY]))
	   .attr("r",  d => {
	   	if (featureSized) {
	   		return rScale(d[featureSized]); 
	   } return r;})

	
	//Create polygon for cross
	svg.selectAll("polygon")
		.data(dataset.filter(d=>(d.IsGoodRating)))
		.enter()
		.append("polygon")
		.attr("class", "good_rating")
		.attr("points", d => {
			r_ = (featureSized) ? rScale(d[featureSized]): r;
			return polygon(xScale(d[featureX]),yScale(d[featureY]),r_)}) 

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
	svg.append("text")// add title 
		.text(title)
		.attr("x", w/2 - padding/2)
	    .attr("y", padding/2)
		.attr("font-family", "sans-serif")
		.attr("font-size", "15px")
	
	svg.append("circle")// add circle legend
		.attr("r",  r)
		.attr("cx", w - padding - r*2)
		.attr("cy", padding/2 -r)
		.attr("class", "bad_rating")
	
	svg.append("text") // add text legend
		.text("bad rating")
		.attr("x", w - padding)
		.attr("y", padding/2)
		.attr("class", "legend")

	svg.append("polygon")// add cross legend
		.attr("class", "good_rating")
		.attr("id", "zigoto")
		.attr("points", polygon(w-padding-r*2,15+padding/2-r, r))
	
	svg.append("text") // add text legend
		.text("good rating")
		.attr("x", w - padding)
		.attr("y", padding/2 + 12)
		.attr("class", "legend")

	svg.append("text") // add axis label
		.text(xlabel)
		.attr("x", w/2 - padding/2)
	    .attr("y", h - padding/2)
	    .attr("class", "legend")

	svg.append("text")// add axis label
		.text(ylabel)
		.attr("transform", "rotate(-90)")
		.attr("x", -h/2)
	    .attr("y", padding/4)
	    .attr("class", "legend")
}





d3.csv("movies.csv", d => {
	// parse string
	return {
		Id : +d.Id,
		Title : d.Title,
		Year : +d.Year,
		Runtime : +d.Runtime,
		Country: d.Country,
		Rating: +d.Rating,
		Votes: +d.Votes,
		Budget: +d.Budget,
		Gross: +d.Gross,
		WinsNoms: +d.WinsNoms,
		IsGoodRating: +d.IsGoodRating
	};

}).then(dataset => {
	var w = 1000;
	var h = 700;
	var padding = 100;

	var r = 5;
	var cross = r*2
	x = 100;
	y= 80;

	// a.1
	/*Feature 10 (Wins and nominations) vs. Feature 6 ( Rating)
		Figure title: Wins+Nominations vs. Rating
		X axis (horizontal) label: Rating
		Y axis (vertical) label: Wins+Noms*/
	var svg = d3.select("body")
				.append("svg")
				.attr("width", w)
				.attr("height", h);

	var xScale_a_1 = d3.scaleLinear()
		.domain([0, d3.max(dataset, d=> d.Rating)])
		.range([padding, w - padding * 2]);

	var yScale_a_1 = d3.scaleLinear()
		.domain([0, d3.max(dataset, d=> d.WinsNoms)])
		.range([h - padding, padding]);

	scatterPlot(dataset, "Rating", "WinsNoms", svg, xScale_a_1, yScale_a_1,
		"Wins+Nominations vs. Rating", "Rating", "Wins+Noms", w, h, padding);
	
	//a.1 bis
	/*Feature 8 (Budget) vs. Features 6 ( Rating)
		Figure title: Budget vs. Rating
		X axis (horizontal) label: Rating
		Y axis (vertical) label: Budget
	*/	
	var svg2 = d3.select("body")
				.append("svg")
				.attr("width", w)
				.attr("height", h)
				.attr("y", h);

	var yScale_a_2 = d3.scaleLinear()
		.domain([0, d3.max(dataset, d=> d.Budget)])
		.range([h - padding, padding]);

	scatterPlot(dataset, "Rating", "Budget", svg2, xScale_a_1, yScale_a_2,
		"Budget vs. Rating", "Rating", "Budget", w, h, padding);


	//b.1
	/*Feature 7 (Votes) vs. Feature 6 (Rating) sized by Feature 10 (Wins+Nominations)
		Figure title: Votes vs. Rating sized by Wins+Nominations
		X axis (horizontal) label: Rating
		Y axis (vertical) label: Votes
	*/	
	var svg3 = d3.select("body")
				.append("svg")
				.attr("width", w)
				.attr("height", h)
				.attr("y", 2*h);

	var yScale_b_1 = d3.scaleLinear()
		.domain([0, d3.max(dataset, d=> d.Votes)])
		.range([h - padding, padding]);

	scatterPlot(dataset, "Rating", "Votes", svg3, xScale_a_1, yScale_b_1,
		"Votes vs. Rating sized by Wins+Nominations", "Rating", "Votes", w, h, padding, "WinsNoms");

	//c.1
	/*First Figure: uses the square root scale for its y-axis (only)
	Figure title: Wins+Nominations (square-root-scaled) vs. Rating
	X axis (horizontal) label: Rating
	Y axis (vertical)  label: Wins+Noms*/

	var svg4 = d3.select("body")
				.append("svg")
				.attr("width", w)
				.attr("height", h)
				.attr("y", 3*h);

	var yScale_c_1 = d3.scalePow().exponent(0.5)
		.domain([0, d3.max(dataset, d=> d.WinsNoms)])
		.range([h - padding, padding]);

	scatterPlot(dataset, "Rating", "WinsNoms", svg4, xScale_a_1, yScale_c_1,
		"Wins+Nominations (square-root-scaled) vs. Rating", "Rating", "Wins+Noms", w, h, padding);
	

	//c.2
	/*Second Figure: uses the log scale for its y-axis (only)
	Figure title: Wins+Nominations (log-scaled) vs. Rating
	X axis (horizontal) label: Rating
	Y axis (vertical)  label: Wins+Noms*/

	var svg5 = d3.select("body")
				.append("svg")
				.attr("width", w)
				.attr("height", h)
				.attr("y", 4*h);

	var yScale_c_2 = d3.scaleLog()
		.domain([5e-1, d3.max(dataset, d=> d.WinsNoms)])
		.range([h - padding, padding]);

	// remove 0 from dataset
	dataset_ = dataset.map(d => {d.WinsNoms = (d.WinsNoms == 0)? 5e-1: d.WinsNoms; return d;})


	scatterPlot(dataset_, "Rating", "WinsNoms", svg5, xScale_a_1, yScale_c_2,
		"Wins+Nominations (log-scaled) vs. Rating", "Rating", "Wins+Noms", w, h, padding);
	

})
