const margin = { top: 30, right: 30, bottom: 100, left: 100 },
	width = 550 - margin.left - margin.right,
	height = 550 - margin.top - margin.bottom;

let tooltip = d3
		.select("#content-wrap")
		.append("div")
		.style("opacity", 0)
		.attr("class", "tooltip")
		.style("background-color", "white")
		.style("border", "solid")
		.style("border-width", "1px")
		.style("border-radius", "5px")
		.style("padding", "10px")
		.style("position", "absolute")
		.style("left", "0px")
		.style("top", "0px");

const svg_plot1 = d3
	.select("#plot1")
	.append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", `translate(${margin.left},${margin.top})`);

const svg_plot2 = d3
	.select("#plot2")
	.append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", `translate(${margin.left},${margin.top})`);

const svg_plot3 = d3
	.select("#plot3")
	.append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", `translate(${margin.left},${margin.top})`);

const svg_plot4 = d3
	.select("#plot4")
	.append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom + 170)
	.append("g")
	.attr("transform", `translate(${margin.left},${margin.top})`);

const svg_plot5 = d3
	.select("#plot5")
	.append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", `translate(${margin.left},${margin.top})`);


function add_axis_label(svg_plot, x, y, transform, text_anchor, label) {
	svg_plot
		.append("text")
		.attr("text-anchor", text_anchor)
		.attr("x", x)
		.attr("y", y)
		.attr("transform", transform)
		.text(label);
}

function heatmap_plot(data, svg_plot, id_div) {
	var max_value_pH = -Infinity;
	var min_value_pH = Infinity;

	data.forEach((d) => {
        if (d.pH > max_value_pH) {
            max_value_pH = d.pH;
        }
        if (d.pH < min_value_pH) {
            min_value_pH = d.pH;
        }
	});


	const y = d3
		.scaleBand()
		.range([0, width])
		.domain(["pH"]);

	const x = d3
		.scaleBand()
		.domain(data.map((d) => d.year))
		.range([0, height]);

	svg_plot
		.append("g")
		.attr("transform", `translate(0, ${height})`)
		.call(d3.axisBottom(x).tickSizeOuter([0]))
		.selectAll("text")
		.attr("transform", "translate(-10,0)rotate(-45)")
		.style("text-anchor", "end");

	add_axis_label(
		svg_plot,
		width / 2,
		height + margin.bottom - 5,
		"",
		"middle",
		"Years"
	);

	svg_plot.append("g").call(d3.axisLeft(y).tickSizeOuter([0]));

	add_axis_label(
		svg_plot,
		-height / 2,
		-margin.left + 15,
		"rotate(-90)",
		"middle",
		"pH"
	);

	const legendHeight = 20;
	const legendWidth = width * 0.8;
	const legendX = (width - legendWidth) / 2;
	const legendY = height + 150;

	svg_plot
		.append("g")
		.attr("class", "legend")
		.attr("transform", `translate(${legendX}, ${legendY})`)
		.append("rect")
		.attr("width", legendWidth)
		.attr("height", legendHeight)
		.style("fill", "url(#linear-gradient-ph)");

	const defs = svg_plot.append("defs");
	const linearGradientpH = defs
		.append("linearGradient")
		.attr("id", "linear-gradient-ph");

        linearGradientpH
		.selectAll("stop")
		.data([
			{ offset: "0%", color: "red" },
            { offset: "100%", color: "white" },
		])
		.enter()
		.append("stop")
		.attr("offset", (d) => d.offset)
		.attr("stop-color", (d) => d.color);

	const myColor = d3
		.scaleLinear()
		.range(["red", "white"])
		.domain([min_value_pH, 8.2]);
	
	const legendScale = d3
		.scaleLinear()
		.domain([min_value_pH, 8.2])
		.range([0, legendWidth]);

	const legendAxis = d3
		.axisBottom(legendScale)
		.tickValues([
			min_value_pH,
			min_value_pH+((8.2-min_value_pH)/2),
            8.2,
		]);

	svg_plot
		.append("g")
		.attr("class", "legend-axis")
		.attr("transform", `translate(${legendX}, ${legendY + legendHeight})`)
		.call(legendAxis);

	svg_plot
		.append("text")
		.attr("x", legendX + legendWidth / 2)
		.attr("y", legendY - 10)
		.attr("text-anchor", "middle")
		.style("font-size", "12px")
		.text("pH");

	// Tooltip and interaction functions
	var mouseover = function (event, d) {
		d3.selectAll(id_div + "  rect").style("opacity", 0.2);
		d3.selectAll(".legend  rect").style("opacity", 1);
		d3.select(this).style("opacity", 1);
		info = d3.select(this).datum();
		tooltip
			.html(
                "year: " + info.year
                + "<br>"
				+ "pH: " + info.pH 
			)
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
		.data(data, function (d) {
			return "pH" + ":" + d.year;
		})
		.enter()
		.append("rect")
		.attr("y", function (d) {
			return y("pH");
		})
		.attr("x", function (d) {
			return x(d.year);
		})
		.attr("width", x.bandwidth())
		.attr("height", y.bandwidth())
		.style("stroke", "black")
		.style("fill", function (d) {
			return myColor(d.pH);
		})
		.on("mouseover", mouseover)
		.on("mousemove", mousemove)
		.on("mouseleave", mouseleave);
}

d3.csv("Cicala/plot4.csv", function (d) {
	return {
		year: d.year,
		pH: +d["pH"],
	};
}).then(function (data) {
	heatmap_plot(data, svg_plot4, "#plot4");
});
