
/*
 * CorrelationVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data
 * @param _handler				-- the handler for node clicks
 */

CorrelationVis = function(_parentElement, _data, _handler){
	this.parentElement = _parentElement;
	this.data = _data;
	this.nodeSelected = _handler;

	this.initVis();
}


/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

CorrelationVis.prototype.initVis = function(){
	var vis = this;

	vis.margin = { top: 100, right: 50, bottom: 0, left: 110 };

	vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right,
	vis.height = vis.width

	// SVG drawing area
	vis.svg = d3.select("#" + vis.parentElement).append("svg")
			.attr("width", vis.width + vis.margin.left + vis.margin.right)
			.attr("height", vis.height + vis.margin.top + vis.margin.bottom)
		.append("g")
			.attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

	vis.legend = d3.select("#legend").append("svg")
			.attr("width", vis.width)
			.attr("height", 40)
			.attr("transform", "translate(" + vis.margin.left + ",0)");

  // Scales and axes
  vis.x = d3.scaleBand()
						.rangeRound([0, vis.width])
						.domain(vis.data.titles.map(function(d) { return d; }));

	vis.y = d3.scaleBand()
						.rangeRound([0, vis.height])
						.domain(vis.data.titles.map(function(d) { return d; }));

  vis.xAxis = d3.axisTop()
      					.scale(vis.x);

  vis.yAxis = d3.axisLeft()
				        .scale(vis.y);

	vis.color = d3.scaleLinear()
								.domain([0, 1])
								.range([d3.rgb("#e6fff8"), d3.rgb('#006E51')]);

	vis.tip = d3.tip().attr('class', 'd3-tip')
			.direction('se')
			.offset(function() {
					return [0,0];
			})
			.html(function(d) {
				let rowTitle = d.title;
				let colTitle = vis.data.titles[d.col];
				let cos_sim = Math.round(d.cos_sim * 10000) / 10000;
				let words_shared = d.words_shared;

				let header1 = "<h2 class='tooltip-title'>Row: " + rowTitle + "</h2>"
				let header2 = "<h2 class='tooltip-title'>Column: " + colTitle + "</h2>"
				let simNote = "<li class='tooltip-text'> Similarity: " + cos_sim + "</li>";
				let sharedNote = "<li class='tooltip-text'> Shared words: " + words_shared + "</li>";
				return header1 + header2 + "<ul>" + simNote + "</ul>";
			});

	// color scale legend
	let cells = 5;
	let legendColorWidth = vis.width/cells;
	vis.legendColor = d3.legendColor()
			.shapeWidth(legendColorWidth)
			.cells(cells)
			.orient('horizontal')
			.scale(vis.color)

	vis.legend.append("g")
			.attr("class", "legendColor")
			.attr("transform", "translate(" + vis.width/legendColorWidth + "," + 0 + ")")
			.call(vis.legendColor);

	vis.svg.append("g")
			.attr("class", "x-axis axis");

	vis.svg.append("g")
			.attr("class", "y-axis axis");

	// (Filter, aggregate, modify data)
	vis.wrangleData();

}



/*
 * Data wrangling
 */

CorrelationVis.prototype.wrangleData = function(){
	var vis = this;

	let correlations = vis.data.correlations;
	let titles = vis.data.titles;
	let displayData = []
	titles.forEach(function(title, r) {
		let story = correlations[title];
		titles.forEach(function(t, c) {
			let node = {
				"title": title,
				"row": r,
				"col": c,
				"cos_sim": story[0][t].cos_sim,
				"words_shared": story[0][t].words_shared
			}
			displayData.push(node)
		})
	})
	console.log(displayData);
	this.displayData = displayData;

	// Update the visualization
	vis.updateVis();
}



/*
 * The drawing function - should use the D3 update sequence (enter, update, exit)
 * Function parameters only needed if different kinds of updates are needed
 */

CorrelationVis.prototype.updateVis = function(){
	var vis = this;

	var nodes = vis.svg.selectAll(".node").data(vis.displayData)
	nodes.enter()
			.append("circle")
			.merge(nodes)
			.attr("class", "node")
			.attr("cx", function(d, i) {
				return vis.x(vis.data.titles[d.col]) + (vis.x.bandwidth()/2)
			})
			.attr("cy", function(d, i) {
				return vis.y(d.title) + (vis.y.bandwidth()/2)
			})
			.attr("r", vis.y.bandwidth()/3)
			.attr("fill", function(d, i) {
				return vis.color(d.cos_sim)
			})
			.on("mouseover", vis.tip.show)
			.on("mouseout", vis.tip.hide)
			.on("click", function(d) {
				$(vis.nodeSelected).trigger("nodeSelected", d);
			})
	nodes.exit().remove()

	// https://bl.ocks.org/d3noob/c506ac45617cf9ed39337f99f8511218
	function make_x_gridlines() {
		return d3.axisTop()
				.scale(vis.x)
				.ticks(vis.data.titles.length)
	}

	function make_y_gridlines() {
		return d3.axisLeft()
				.scale(vis.y)
				.ticks(vis.data.titles.length)
	}

	vis.svg.select(".x-axis").call(vis.xAxis)
			.selectAll("text")
			.style("text-anchor", "start")
			.attr("transform", function(d) {
					return "rotate(-45)"
			})
			.attr("dy", ".5em")
			.attr("dx", ".3em")

	vis.svg.select(".y-axis")
				.call(make_y_gridlines()
				.tickSize(-vis.width)
				.tickFormat(function(d) {
					return d.length > 13 ? d.substring(0, 10)+"..." : d;
				}))
	vis.svg.select(".x-axis")
				.call(make_x_gridlines()
				.tickSize(-vis.height)
				.tickFormat(function(d) {
					return d.length > 14 ? d.substring(0, 11)+"..." : d;
				}))
	vis.svg.call(vis.tip);
}
