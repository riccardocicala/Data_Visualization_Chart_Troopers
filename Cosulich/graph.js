const margin_11 = { top: 30, right: 30, bottom: 100, left: 100 },
	width_11 = 770 - margin_11.left - margin_11.right,
	height_11 = 650 - margin_11.top - margin_11.bottom;

const margin_11_15 = { top: 30, right: 30, bottom: 100, left: 100 },
	width_11_15 = 550 - margin_11_15.left - margin_11_15.right,
	height_11_15 = 550 - margin_11_15.top - margin_11_15.bottom;

const margin_14 = { top: 30, right: 30, bottom: 100, left: 100 },
	width_14 = 550 - margin_14.left - margin_14.right,
	height_14 = 650 - margin_14.top - margin_14.bottom;

const bubble_margin = { top: 30, right: 30, bottom: 100, left: 100 },
	bubble_width = 1250 - bubble_margin.left - bubble_margin.right,
	bubble_height = 750 - bubble_margin.top - bubble_margin.bottom;
	
const BLUE = "#0066ff";
const GREEN = "#2bcf5f";

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
	.attr("width", width_11 + margin_11.left + margin_11.right + 130)
	.attr("height", height_11 + margin_11.top + margin_11.bottom)
	.append("g")
	.attr("transform", `translate(${margin_11.left},${margin_11.top})`);

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
		.attr("width", width_14 + margin_14.left + margin_14.right)
		.attr("height", height_14 + margin_14.top + margin_14.bottom + 60)
		.append("g")
		.attr("transform", `translate(${margin_14.left},${margin_14.top})`);

const svg_plot15 = d3
	.select("#plot15")
	.append("svg")
	.attr("width", bubble_width + bubble_margin.left + bubble_margin.right)
	.attr("height", bubble_height + bubble_margin.top + bubble_margin.bottom + 100)
	.append("g")
	.attr("transform", `translate(${bubble_margin.left},${bubble_margin.top})`);

function add_axis_label(svg_plot, x, y, transform, text_anchor, label) {
	svg_plot
		.append("text")
		.attr("text-anchor", text_anchor)
		.attr("x", x)
		.attr("y", y)
		.attr("transform", transform)
		.text(label);
}

function line_plot_energy_share(data, svg_plot, id_div) {
    const x = d3.scaleLinear()
        .domain([2004, 2023])
        .range([0, width_11]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d3.max(d.production, p => p.value))])
        .range([height_11, 0]);

    svg_plot.append("g")
        .attr("transform", `translate(0,${height_11})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));

	add_axis_label(
		svg_plot,
		width_11 / 2,
		height_11 + 70,
		"",
		"middle",
		"Year"
	);

    svg_plot.append("g")
        .call(d3.axisLeft(y));

	add_axis_label(
		svg_plot,
		-height_11 / 2,
		-margin_11.left + 40,
		"rotate(-90)",
		"middle",
		"Share of Energy (%)"
	);

	const tooltip = d3
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
			.style("top", "0px")
			.style("line-height", "1.4");
			
	data.forEach(country => {
		const isEuropeanUnion = country.country === "European Union Average";
	
		const line = svg_plot.append("path")
			.datum(country.production)
			.attr("fill", "none")
			.attr("stroke", isEuropeanUnion ? "#F28C3B" : "#d3d3d3")
			.attr("stroke-width", isEuropeanUnion ? 2.5 : 2)
			.style("opacity", isEuropeanUnion ? 1 : 0.3)
			.attr("class", isEuropeanUnion ? "is-eu" : "country-line")
			.attr("d", d3.line()
				.x(d => x(d.year))
				.y(d => y(d.value))
			);
	
		if (!isEuropeanUnion) {
			line.on("mouseover", function (event, d) {
				svg_plot.selectAll(".country-line")
					.style("opacity", 0.2);
	
				d3.select(this)
					.style("stroke", "blue")
					.style("opacity", 1);
	
				tooltip
					.style("opacity", 1)
					.html("Country: <b>" + country.country + "</b>")
					.style("left", (event.pageX + 30) + "px")
					.style("top", (event.pageY - 130) + "px");
			})
			.on("mouseleave", function () {
				svg_plot.selectAll(".country-line")
					.style("opacity", 0.2)
					.style("stroke", "#d3d3d3");
				tooltip.style("opacity", 0);
			});
		}
		else {
            svg_plot.append("text")
                .attr("x", x(d3.max(country.production, p => p.year)) + 5)
                .attr("y", y(country.production[country.production.length - 1].value))
                .attr("fill", "#F28C3B")
                .attr("font-size", "12px")
                .attr("alignment-baseline", "middle")
                .text("European Union Average");
        }
	});
	svg_plot.select(".is-eu").raise();		
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
		.style("border-width", "1px")
		.style("border-radius", "5px")
		.style("padding", "10px")
		.style("position", "absolute")
		.style("left", "0px")
		.style("top", "0px")
		.style("line-height", "1.4");

	var mouseover = function (event, d) {
		d3.selectAll(id_div + "  rect").style("opacity", 0.2);
		d3.select(this).style("opacity", 1);
		info = d3.select(this).datum();
		tooltip
			.html("Country: <b>" + info.country + "</b><br>Production: <b>" + info.production + "</b> Tonnes of heavy metal (tHM)")
			.style("opacity", 1);
	};

	var mousemove = function (event, d) {
		tooltip
			.style("left", event.pageX + 20 + "px")
			.style("top", event.pageY - 140 + "px");
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
	const categories = ['hydro', 'geothermal', 'wind', 'solar', 'biofuels'];

	const color = d3.scaleOrdinal()
		.domain(categories)
		.range(["lightblue", "red", "lightgreen", "yellow", "orange"]);
	
	const x = d3.scaleLinear()
		.domain([0, d3.max(data, d => d.hydro + d.geothermal + d.wind + d.solar + d.biofuels)])
		.range([0, width_11_15]);

	svg_plot.append("g")
		.attr("class", "x-axis")
		.attr("transform", `translate(0,${height_11_15})`)
		.call(d3.axisBottom(x));

	add_axis_label(
		svg_plot,
		width_11_15 / 2,
		height_11_15 + margin_11_15.bottom - 25,
		"",
		"middle",
		"Electricity Production Capacity (%)"
	);

	const y = d3.scaleBand()
		.domain(data.map(d => d.country))
		.range([0, height_11_15])
		.padding(0.1);

	svg_plot.append("g")
		.attr("class", "y-axis")
		.call(d3.axisLeft(y));

	add_axis_label(
		svg_plot,
		-height_11 / 2,
		-margin_11.left + 20,
		"rotate(-90)",
		"middle",
		"Country"
	);
	
	const stack = d3.stack()
		.keys(categories)
		.offset(d3.stackOffsetNone);

	const series = stack(data);
	
	const tooltip = d3.select(id_div)
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
				.style("top", "0px")
				.style("line-height", "1.4");
	
	var mouseover = function(event, d) {
		d3.selectAll(id_div + "  rect").style("opacity", 0.2);
		d3.select(this).style("opacity", 1);

		energy_type = d3.select(this.parentNode).datum().key;
		energy_type = energy_type.charAt(0).toUpperCase() + energy_type.slice(1);

		const value = d[1] - d[0];

		tooltip.style("opacity", 0.9);
		tooltip.html(`${energy_type}: <b>${value.toFixed(1)}</b> %`);
	};

	var mousemove = function (event, d) {
        tooltip
            .style("left", event.pageX + 20 + "px")
            .style("top", event.pageY - 140 + "px");
    };

	var mouseleave = function() {
		d3.selectAll(id_div + "  rect").style("opacity", 1);
		tooltip.style("opacity", 0);
	};

	svg_plot.selectAll(".layer")
			.data(series)
			.enter().append("g")
			.attr("class", "layer")
			.attr("fill", (d, i) => color(categories[i]))
			.selectAll("rect")
			.data(d => d)
			.enter().append("rect")
			.attr("x", d => x(d[0]))
			.attr("y", d => y(d.data.country))
			.attr("width", d => x(d[1]) - x(d[0]))
			.attr("height", y.bandwidth())
			.on("mouseover", mouseover)
			.on("mousemove", mousemove)
			.on("mouseout", mouseleave);
}

function map_plot_taxes(data, topo, svg_plot, colorScheme, id_div, min_value, max_value, column) {
	projection = d3.geoMercator().scale(430);
	projection = projection.center([30, 55]).translate([width / 2, height / 2]);

	minVal = min_value;
	maxVal = max_value;

	const numThresholds = 5;
	const thresholds = Array.from(
		{ length: numThresholds },
		(_, i) => minVal + ((i + 1) * (maxVal - minVal)) / (numThresholds + 1)
	);

	thresholds.unshift(minVal);
	thresholds.push(maxVal);

	let colorScale = d3.scaleThreshold().domain(thresholds).range(colorScheme);
	const formatta = d3.format(".3~s");

	let mouseOver = function (d) {
		if (d.currentTarget.__data__.total!=-1) {
			d3.selectAll(".Country " + id_div)
				.transition()
				.duration(200)
				.style("opacity", 0.5)
				.style("stroke", "transparent");
			d3.select(this)
				.transition()
				.duration(200)
				.style("opacity", 1)
				.style("stroke", "black");
			tooltip
				.html("Country: <b>" + d.currentTarget.__data__.properties.NAME + "</b><br>Taxes (millions EUR): <b>" + formatta(d.currentTarget.__data__.total))
				.style("opacity", 1);
		}
	};

	let mouseMove = function tooltipMousemove(event, d) {
		tooltip
			.style("left", event.pageX + 20 + "px")
			.style("top", event.pageY - 140 + "px");
	};

	let mouseLeave = function (d) {
		if (d.currentTarget.__data__.total != -1) {
			d3.selectAll(".Country " + id_div)
				.transition()
				.duration(200)
				.style("opacity", 1)
				.style("stroke", "transparent");
			d3.select(this)
				.transition()
				.duration(200)
				.style("stroke", "transparent");
			tooltip.style("opacity", 0);
		}
	};

	svg_plot
		.append("g")
		.attr("transform", `translate(${margin_14.left},${margin_14.top})`)
		.append("g")
		.selectAll("path")
		.data(topo.features)
		.enter()
		.append("path")
		.attr("d", d3.geoPath().projection(projection))
		.attr("fill", function (d) {
			d.total = data.get(d.properties.ISO3) ;
			if (d.total == undefined) {
				d.total = -1
				return 'lightgray';
			}
			return colorScale(d.total);
		})
		.style("stroke", "transparent")
		.attr("class", function (d) {
			return "Country " + id_div;
		})
		.style("opacity", 1)
		.on("mouseover", mouseOver)
		.on("mouseleave", mouseLeave)
		.on("mousemove", mouseMove);

	const defs = svg_plot.append("defs");
	const linearGradient = defs
		.append("linearGradient")
		.attr("id", `gradient-${id_div}`);

	linearGradient
		.selectAll("stop")
		.data(
			colorScale.range().map((color, i) => ({
				offset: `${(i / (colorScale.range().length - 1)) * 100}%`,
				color: color,
			}))
		)
		.enter()
		.append("stop")
		.attr("offset", (d) => d.offset)
		.attr("stop-color", (d) => d.color);

	// Legend
	const legendHeight = 20;
	const legendWidth = width_14 * 0.8;
	const legendX = ((width_14) /4) - 80;
	const legendY = height_14 + 40;

	svg_plot
		.append("g")
		.attr("class", "legend")
		.attr("transform", `translate(${legendX}, ${legendY})`)
		.append("rect")
		.attr("width", legendWidth)
		.attr("height", legendHeight)
		.style("fill", `url(#gradient-${id_div})`);

	const legendScale = d3
		.scaleLinear()
		.domain([minVal, maxVal])
		.range([0, legendWidth]);
		Math.round(max_value / 2000) * 1000
	const legendAxis = d3
		.axisBottom(legendScale)
		.tickValues([
			minVal,
			Math.round((minVal + (maxVal - minVal) / 4) / 1000) * 1000,
			Math.round(((minVal + maxVal) / 2) / 1000) * 1000,
			Math.round((minVal + (3 * (maxVal - minVal)) / 4) / 1000) * 1000,
			Math.round(maxVal / 1000) * 1000,
		])

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
		.text("Environmental Taxes (millions EUR)");
}

function bubbe_plot(data, svg_plot, id_div) {
    const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.GDP)])
        .range([0, bubble_width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.taxes) * 1.1])
        .range([bubble_height, 0]);

    const radius = d3.scaleSqrt()
        .domain([0, d3.max(data, d => d.investments)])
        .range([1, 70]);

    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y);

    svg_plot.append("g")
        .attr("transform", "translate(0," + bubble_height + ")")
        .call(xAxis);
  
    svg_plot.append("g")
        .call(yAxis);

    svg_plot.append("text")
        .attr("class", "axis-label")
        .attr("x", bubble_width / 2)
        .attr("y", bubble_height + 60)
        .style("text-anchor", "middle")
        .text("GDP");

    svg_plot.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -bubble_height / 2)
        .attr("y", -70)
        .style("text-anchor", "middle")
        .text("Environmental Tax (millions EUR)");

    const tooltip = d3.select(id_div)
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
				.style("top", "0px")
				.style("line-height", "1.4");

	const formatta = d3.format(".3~s");

	var min_value = d3.min(data, d => d.investments);
	var max_value = d3.max(data, d => d.investments);

	const colours_27 = d3
		.scaleLinear()
		.range(["red", BLUE, GREEN])
		.domain([min_value, max_value / 2, max_value]);

	svg_plot.append("line")
    .attr("x1", x(100))
    .attr("x2", x(100))
    .attr("y1", 0)
    .attr("y2", bubble_height)
    .attr("stroke", "red")
    .attr("stroke-dasharray", "5,5")
    .attr("stroke-width", 2);

	var mousemove = function (event, d) {
        tooltip
            .style("left", event.pageX + 20 + "px")
            .style("top", event.pageY - 140 + "px");
    };

    const bubbles = svg_plot.selectAll(".bubble")
        .data(data)
        .enter().append("circle")
        .attr("class", "bubble")
        .attr("cx", d => x(d.GDP))
        .attr("cy", d => y(d.taxes))
        .attr("r", d => radius(d.investments))
        .style("fill",  function (d) {
			return colours_27(d.investments);
		}) // (d, i) => colours_27[i % colours_27.length])
        .style("opacity", 0.7)
        .style("stroke", "black")
        .style("stroke-width", 1)
        .on("mouseover", function(event, d) {
			bubbles.style("opacity", 0.3);
			d3.select(this)
				.style("opacity", 1)
			tooltip.transition()
				.duration(200)
				.style("opacity", 0.9);
			tooltip.html("Country: <b>" + d.country + "</b><br>Investments: <b>" + formatta(d.investments) + "</b> millions EUR<br>GDP: <b>" + d.GDP + "</b><br>Tax: <b>" + formatta(d.taxes) + "</b> millions EUR");
		})
		.on("mousemove", mousemove)
		.on("mouseout", function(event, d) {
			bubbles.style("opacity", 0.7);
			d3.select(this)
				.style("stroke-width", 1);
			tooltip.transition()
				.duration(500)
				.style("opacity", 0);
		});

		// Legend
		const legendHeight = 20;
		const legendWidth = bubble_width * 0.5;
		const legendX = (bubble_width) / 4;
		const legendY = bubble_height + 120;
	
		var min_value = d3.min(data, d => d.investments);
		var max_value = d3.max(data, d => d.investments);
	
		svg_plot
			.append("g")
			.attr("class", "legend")
			.attr("transform", `translate(${legendX}, ${legendY})`)
			.append("rect")
			.attr("width", legendWidth)
			.attr("height", legendHeight)
			.style("fill", `url(#linear-gradient-investments)`)
			.style("stroke-width", 2);
	
		const defs = svg_plot.append("defs");
		
		const linearGradient = defs
				.append("linearGradient")
				.attr("id", "linear-gradient-investments");
		
		linearGradient
				.selectAll("stop")
				.data([
				{ offset: "0%", color: "red" },
				{ offset: "50%", color: "#0066ff" },
				{ offset: "100%", color: "#2bcf5f" }
				])
				.enter()
				.append("stop")
				.attr("offset", (d) => d.offset)
				.attr("stop-color", (d) => d.color);
		
		const legendScale = d3
			.scaleLinear()
			.domain([min_value, max_value])
			.range([0, legendWidth]);
	
		const legendAxis = d3
			.axisBottom(legendScale)
			.tickValues([min_value, Math.round(max_value / 2000) * 1000, Math.round(max_value/ 1000) * 1000]);
	
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
			.text("Investments (millions EUR)");

	// Simulazione
	let useForceLayout = false;

	const buttonX = legendX - 280;
	const buttonY = legendY;

	const buttonGroup = svg_plot.append("g")
		.attr("class", "button")
		.attr("transform", `translate(${buttonX}, ${buttonY})`)
		.style("cursor", "pointer");

	const buttonRect = buttonGroup.append("rect")
		.attr("width", 150)
		.attr("height", 30)
		.attr("rx", 5)
		.attr("ry", 5)
		.style("fill", "#007acc")

	buttonGroup.append("text")
		.attr("x", 75)
		.attr("y", 20)
		.attr("text-anchor", "middle")
		.style("fill", "white")
		.style("font-size", "14px")
		.text("Expand the bubbles");

	buttonGroup.on("mouseover", function () {
		d3.select(this).select("rect").style("fill", "#005f99");
	}).on("mouseout", function () {
		d3.select(this).select("rect").style("fill", "#007acc");
	});
	
	buttonGroup.on("click", function () {
		useForceLayout = !useForceLayout;

		if (useForceLayout) {
			buttonGroup.select("text").text("Show real data");
			const simulation = d3.forceSimulation(data)
				.force("x", d3.forceX(d => x(d.GDP)).strength(0.7))
				.force("y", d3.forceY(d => y(d.taxes)).strength(0.7))
				.force("collide", d3.forceCollide(d => radius(d.investments) + 2))
				.alpha(0.7)
				.alphaDecay(0.02)
				.on("tick", () => {
					bubbles
						.attr("cx", d => d.x)
						.attr("cy", d => d.y);
				});
		} else {
			buttonGroup.select("text").text("Expand the bubbles");
			bubbles.transition()
				.duration(2500)
				.attr("cx", d => x(d.GDP))
				.attr("cy", d => y(d.taxes));
		}
	});
}

d3.csv("Cosulich/plot1.csv").then(function(data) {
    const years = Object.keys(data[0]).filter(key => key !== 'country' && key !== '');
    const dati = data.map(function(d) {
        return {
            country: d.country,
            production: years.map(year => ({ year: +year, value: +d[year] }))
        };
    });
    line_plot_energy_share(dati, svg_plot11, "#plot11");
});

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

Promise.all([
	d3.json("Cosulich/europe.geojson"),
	d3.csv("Cosulich/plot4.csv", function (d) {
		return {
			ISO: d.ISO,
			taxes: +d.taxes
		};
	}),
]).then(function (data) {
	let min_value = d3.min([...data[1]], function(d) { return +d.taxes; })
	let max_value = d3.max([...data[1]], function(d) { return +d.taxes; })
	let topo = data[0];
	let dataTotalTaxes = new Map(
		data[1].map((d) => [d.ISO, +d.taxes])
	);
	let colorScheme = d3.schemeBlues[7];
	map_plot_taxes(
		dataTotalTaxes,
		topo,
		svg_plot14,
		colorScheme,
		"#plot14",
		min_value,
		max_value
	);
});

d3.csv("Cosulich/plot5.csv", function (d) {
	return {
		country: d.country,
		investments: +d.investments,
		taxes: +d.taxes,
		GDP: +d.GDP
	};
}).then(function (data) {
	bubbe_plot(data, svg_plot15, "#plot15");
});
