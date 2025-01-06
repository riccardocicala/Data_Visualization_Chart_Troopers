const margin_11_15 = { top: 30, right: 30, bottom: 100, left: 100 },
	width_11_15 = 550 - margin_11_15.left - margin_11_15.right,
	height_11_15 = 550 - margin_11_15.top - margin_11_15.bottom;
	
const colours_11_15 = [
	"#4C6A92",
	"#F28C3B",
	"#D35C63",
	"#67A9A5",
	"#7C9F5D",
	"#F1C04A",
];

const svg_plot11 = d3
	.select("#plot11")
	.append("svg")
	.attr("width", width_11_15 + margin_11_15.left + margin_11_15.right)
	.attr("height", height_11_15 + margin_11_15.top + margin_11_15.bottom)
	.append("g")
	.attr("transform", `translate(${margin_11_15.left},${margin_11_15.top})`);

const svg_plot12 = d3
	.select("#plot12")
	.append("svg")
	.attr("width", width_11_15 + margin_11_15.left + margin_11_15.right)
	.attr("height", height_11_15 + margin_11_15.top + margin_11_15.bottom)
	.append("g")
	.attr("transform", `translate(${margin_11_15.left},${margin_11_15.top})`);

const svg_plot13 = d3
	.select("#plot13")
	.append("svg")
	.attr("width", width_11_15 + margin_11_15.left + margin_11_15.right)
	.attr("height", height_11_15 + margin_11_15.top + margin_11_15.bottom)
	.append("g")
	.attr("transform", `translate(${margin_11_15.left},${margin_11_15.top})`);

const svg_plot14 = d3
		.select("#plot14")
		.append("svg")
		.attr("width", width_11_15 + margin_11_15.left + margin_11_15.right)
		.attr("height", height_11_15 + margin_11_15.top + margin_11_15.bottom)
		.append("g")
		.attr("transform", `translate(${margin_11_15.left},${margin_11_15.top})`);

const svg_plot15 = d3
	.select("#plot15")
	.append("svg")
	.attr("width", width_11_15 + margin_11_15.left + margin_11_15.right)
	.attr("height", height_11_15 + margin_11_15.top + margin_11_15.bottom)
	.append("g")
	.attr("transform", `translate(${margin_11_15.left},${margin_11_15.top})`);

function add_axis_label(svg_plot, x, y, transform, text_anchor, label) {
	svg_plot
		.append("text")
		.attr("text-anchor", text_anchor)
		.attr("x", x)
		.attr("y", y)
		.attr("transform", transform)
		.text(label);
}

function bar_plot(data, svg_plot, id_div) {
	var max_value = 0;
	data.forEach((d) => {
		if (d.production > max_value) {
			max_value = d.production;
		}
	});

	const x = d3
		.scaleBand()
		.range([0, width_11_15])
		.domain(data.map((d) => d.country))
		.padding(0.2);

	svg_plot
		.append("g")
		.attr("transform", `translate(0, ${height_11_15})`)
		.call(d3.axisBottom(x).tickSizeOuter([0]))
		.selectAll("text")
		.attr("transform", "translate(-10,0)rotate(-45)")
		.style("text-anchor", "end");

	add_axis_label(
		svg_plot,
		width_11_15 / 2,
		height_11_15 + margin_11_15.bottom - 5,
		"",
		"middle",
		"Country"
	);

	const y = d3
		.scaleLinear()
		.domain([0, max_value + 0.1 * max_value])
		.range([height_11_15, 0]);

	svg_plot.append("g").call(d3.axisLeft(y).tickSizeOuter([0]));

	add_axis_label(
		svg_plot,
		-height_11_15 / 2,
		-margin_11_15.left + 15,
		"rotate(-90)",
		"middle",
		"Production of fresh fuel elements (tHM)"
	);

	var tooltip = d3
		.select("#content-wrap")
		.append("div")
		.style("opacity", 0)
		.attr("class", "tooltip")
		.style("background-color", "white")
		.style("border", "solid")
		.style("border-width_11_15", "1px")
		.style("border-radius", "5px")
		.style("padding", "10px")
		.style("position", "absolute")
		.style("left", "0px")
		.style("top", "0px");

	var mouseover = function (event, d) {
		d3.selectAll(id_div + "  rect").style("opacity", 0.2);
		d3.select(this).style("opacity", 1);
		info = d3.select(this).datum();
		tooltip
			.html(info.production + " Tonnes of heavy metal (tHM)")
			.style("opacity", 1);
	};

	var mousemove = function (event, d) {
		tooltip
			.style("left", event.pageX + 20 + "px")
			.style("top", event.pageY - 100 + "px");
	};

	var mouseleave = function (event, d) {
		d3.selectAll(id_div + " rect").style("opacity", 1);
		tooltip.style("opacity", 0);
	};

	svg_plot
		.selectAll()
		.data(data)
		.join("rect")
		.attr("x", (d) => x(d.country))
		.attr("y", (d) => y(d.production))
		.attr("width", x.bandwidth())
		.attr("height", (d) => height_11_15 - y(d.production))
		.attr("fill", "#69b3a2")
		.on("mouseover", mouseover)
		.on("mousemove", mousemove)
		.on("mouseleave", mouseleave);
}

function stacked_bar_plot(data, svg_plot, id_div) {
	console.log(data);
	const nestedData = Array.from(
		d3.group(data, (d) => d.country),
		([region, values]) => {
			const regionData = { country: region };
			values.forEach((v) => (regionData[v.rank] = v.production));
			return regionData;
		}
	);

	var mapping_entity = {};
	data.forEach((d) => (mapping_entity[d.region + d.rank] = d.entity));

	const subgroups = Array.from(new Set(data.map((d) => d.rank)));
	const groups = Array.from(new Set(data.map((d) => d.region)));

	for (let i = 0; i < 6; i++) {
		let value_region = 0;
		subgroups.forEach((j) => (value_region += nestedData[i][j]));
		subgroups.forEach(
			(j) =>
				(nestedData[i][j] = parseFloat(
					((nestedData[i][j] / value_region) * 100).toFixed(1)
				))
		);
	}

	// Get the max value for the Y axis
	var max_value = 0;
	for (let i = 0; i < 6; i++) {
		let value_region = 0;
		subgroups.forEach((j) => (value_region += nestedData[i][j]));
		if (value_region > max_value) {
			max_value = value_region;
		}
	}

	// Add X axis
	/* legend_width_11_15 = 50; */
	var x;
	x = d3.scaleLinear()
			.domain([0, max_value])
			.range([0, width_11_15]); /* width_11_15 - legend_width_11_15 - 10]); */

	svg_plot
		.append("g")
		.attr("transform", `translate(0, ${height_11_15})`)
		.call(d3.axisBottom(x).tickSizeOuter([0]))
		.selectAll("text")
		.attr("transform", "translate(-10,0)rotate(-45)")
		.style("text-anchor", "end");

	label_x = "CO2 emissions (%)";
	add_axis_label(
		svg_plot,
		width_11_15 / 2,
		height_11_15 + margin_11_15.bottom - 5,
		"",
		"middle",
		label_x
	);

	// Add Y axis
	const y = d3.scaleBand().range([0, height_11_15]).domain(groups).padding(0.2);

	svg_plot.append("g").call(d3.axisLeft(y).tickSizeOuter([0]));

	add_axis_label(
		svg_plot,
		-height_11_15 / 2,
		-margin_11_15.left + 15,
		"rotate(-90)",
		"middle",
		"Region"
	);

	var tooltip = d3
		.select("#content-wrap")
		.append("div")
		.style("opacity", 0)
		.attr("class", "tooltip")
		.style("background-color", "white")
		.style("border", "solid")
		.style("border-width_11_15", "1px")
		.style("border-radius", "5px")
		.style("padding", "10px")
		.style("position", "absolute")
		.style("left", "0px")
		.style("top", "0px");

	var mouseover = function (event, d) {
						d3.selectAll(id_div + "  rect").style("opacity", 0.2);
						d3.select(this).style("opacity", 1);
						info = d3.select(this).datum();
						info_parent = d3.select(this.parentNode).datum();
						tooltip.html(
									"Country: " +
									mapping_entity[info.data.country] +
									"<br>" + "Value: " +
									info.data[info_parent.key] + "%").style("opacity", 1);
					};

	var mousemove = function (event, d) {
		tooltip
			.style("left", event.pageX + 20 + "px")
			.style("top", event.pageY - 100 + "px");
	};

	var mouseleave = function (event, d) {
		d3.selectAll(id_div + " rect").style("opacity", 1);
		tooltip.style("opacity", 0);
	};

	const color = d3.scaleOrdinal().domain(subgroups).range(colours_11_15);

	const stackedData = d3.stack().keys(subgroups)(nestedData);

	svg_plot
		.append("g")
		.selectAll("g")
		// Enter in the stack data = loop key per key = group per group
		.data(stackedData)
		.join("g")
		.attr("fill", (d) => color(d.key))
		.selectAll("rect")
		// enter a second time = loop subgroup per subgroup to add all rectangles
		.data((d) => d)
		.join("rect")
		.attr("y", (d) => y(d.data.region))
		.attr("x", (d) => x(d[0]))
		.attr("width", (d) => x(d[1]) - x(d[0]))
		.attr("height", y.bandwidth())
		.attr("stroke", "grey")
		.on("mouseover", mouseover)
		.on("mousemove", mousemove)
		.on("mouseleave", mouseleave);
}

d3.csv("Cosulich/plot2.csv", function (d) {
	return {
		country: d.country,
		hydro: +d.hydro,
        geothermal: +d.geothermal,
        wind: +d.wind,
        solar: +d.solar,
        biofuels: +d.biofuels
	};
}).then(function (data) {
	stacked_bar_plot(data, svg_plot12, "#plot12");
});

d3.csv("Cosulich/plot3.csv", function (d) {
	return {
		country: d.country,
		production: +d.production
	};
}).then(function (data) {
	bar_plot(data, svg_plot13, "#plot13");
});
