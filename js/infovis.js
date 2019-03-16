
/*
 * InfoVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data
 */

InfoVis = function(_parentElement, _data){
	this.parentElement = _parentElement;
	this.data = _data;
	this.initVis();
}


/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

InfoVis.prototype.initVis = function(){
	var vis = this;

	vis.margin = { top: 20, right: 50, bottom: 0, left: 15 };

	vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right,
	vis.height = 170 - vis.margin.top - vis.margin.bottom;

	// SVG drawing area
	vis.svg = d3.select("#" + vis.parentElement).append("svg")
			.attr("width", vis.width + vis.margin.left + vis.margin.right)
			.attr("height", vis.height + vis.margin.top + vis.margin.bottom)
		.append("g")
			.attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

	// choose 2 random numbers between 0-42 (the number of fairy tales)
	let num1 = Math.floor(Math.random() * Math.floor(vis.data.titles.length));
	let num2 = Math.floor(Math.random() * Math.floor(vis.data.titles.length));

	// get the titles associated with the numbers
	let title1 = vis.data.titles[num1];
	let title2 = vis.data.titles[num2];

	// display titles
	vis.col1 = vis.svg.append("text")
										.attr("class", "title")
										.attr("x", 0)
										.attr("y", 0)
										.text(title1)
	vis.col2 = vis.svg.append("text")
										.attr("class", "title")
										.attr("x", vis.width/2)
										.attr("y", 0)
										.text(title2)
	// get data
	let words_shared = vis.data.correlations[title1][0][title2].words_shared
	let correlation = Math.round(vis.data.correlations[title1][0][title2].cos_sim * 10000) / 10000;
	// initialize empty <h3></h3>
	$("#shared-words").html("These fairy tales share " + words_shared + " words." +
			" A correlation of: " + correlation + ".");

	// create list of top 5 words
	vis.list1 = vis.svg.selectAll(".col1").data(vis.data.correlations[title1][0].top_5)
	vis.list1.enter()
					.append("text")
					.attr("class", "col1")
					.attr("x", 5)
					.attr("y", function(d, i) {
						return (i * 25) + 25
					})
					.text(function(d, i) {
						return (i+1) + ") " + d.word.toUpperCase() + ": " + (Math.round(d.tfidf * 10000) / 10000)
					})
	// create list of top 5 words
	vis.list2 = vis.svg.selectAll(".col2").data(vis.data.correlations[title2][0].top_5)
	vis.list2.enter()
					.append("text")
					.attr("class", "col2")
					.attr("x", 5 + (vis.width / 2))
					.attr("y", function(d, i) {
						return (i * 25) + 25
					})
					.text(function(d, i) {
						return (i+1) + ") " + d.word.toUpperCase() + ": " + (Math.round(d.tfidf * 10000) / 10000)
					})
}

/*
 * The drawing function - should use the D3 update sequence (enter, update, exit)
 * Function parameters only needed if different kinds of updates are needed
 */

InfoVis.prototype.updateVis = function(){
	var vis = this;

	let node = vis.selectedData;
	let title2 = vis.data.titles[node.col];

	$("#shared-words").html("These fairy tales share " + node.words_shared + " words." +
			" A correlation of: " + (Math.round(node.cos_sim * 10000) / 10000) + ".");

	vis.col1.text(node.title);
	vis.col2.text(title2);

	let col1 = vis.svg.selectAll(".col1").data(vis.data.correlations[node.title][0].top_5)
	col1.attr("x", 5)
			.attr("y", function(d, i) {
				return (i * 25) + 25
			})
			.text(function(d, i) {
				return (i+1) + ") " + d.word.toUpperCase() + ": " + (Math.round(d.tfidf * 10000) / 10000)
			})
	col1.exit().remove()

	let col2 = vis.svg.selectAll(".col2").data(vis.data.correlations[title2][0].top_5)
	col2.attr("x", 5 + (vis.width / 2))
			.attr("y", function(d, i) {
				return (i * 25) + 25
			})
			.text(function(d, i) {
				return (i+1) + ") " + d.word.toUpperCase() + ": " + (Math.round(d.tfidf * 10000) / 10000)
			})
	col2.exit().remove()
}
/*
 * Event handler function, updates itself when the user selects a node
 * @param node 	-- the node selected
 */
InfoVis.prototype.onNodeSelected = function(node){
	var vis = this;
	vis.selectedData = node;

	vis.updateVis()
}
