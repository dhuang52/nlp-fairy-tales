d3.json("data/data.json", function(error,data) {
	if(error) console.log(error);
	console.log(data);
	let titles = data.titles;
	let correlations = data.correlations;
	let nodeSelected = {};

	let correlationVis = new CorrelationVis("correlationvis", data, nodeSelected);
	let infoVis = new InfoVis("infovis", data);

	$(nodeSelected).bind("nodeSelected", function(event, node){
		infoVis.onNodeSelected(node)
		
	});


})
