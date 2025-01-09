const margin = { top: 30, right: 30, bottom: 100, left: 100 },
	width = 550 - margin.left - margin.right,
	height = 550 - margin.top - margin.bottom;

const margin1 = { top: 30, right: 100, bottom: 50, left: 100 };
let width1 = document.getElementById('plot1').clientWidth - margin1.left - margin1.right;
let height1 = document.getElementById('plot1').clientHeight - margin1.top - margin1.bottom;

const margin2 = { top: 30, right: 100, bottom: 130, left: 100 };
let width2 = 550 - margin.left - margin.right;
let height2 = 640 - margin.top - margin.bottom;

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
	.attr("width", width1 + margin1.left + margin1.right)
	.attr("height", height1 + margin1.top + margin1.bottom + 20)
	.append("g")
	.attr("transform", `translate(${margin1.left},${margin1.top})`);

const svg_plot2 = d3
	.select("#plot2")
	.append("svg")
	.attr("width", width2 + margin2.left + margin2.right)
	.attr("height", height2 + margin2.top + margin2.bottom)
	.append("g")
	.attr("transform", `translate(${margin2.left},${margin2.top})`);

const svg_plot3 = d3
	.select("#plot3")
	.append("svg")
	.attr("width", width2 + margin2.left + margin2.right)
	.attr("height", height2 + margin2.top + margin2.bottom)
	.append("g")
	.attr("transform", `translate(${margin2.left},${margin2.top})`);

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

function double_line_plot(data, svg_plot, id_div) {
	let years = data.map((d) => d.year);
	let years_map = {};
	for(let i=1; i<=years.length; i++){
		years_map[years[i-1]] = i;
	}
    const x = d3
		.scaleLinear()
		.domain([1, years.length])
		.range([0, width1]);

	svg_plot
		.append("g")
		.attr("transform", `translate(0, ${height1})`)
		.call(d3.axisBottom(x).tickFormat((d, i) => years[d - 1]).ticks(years.length))
		.selectAll("text")
		.attr("transform", "translate(-10,0)rotate(-45)")
		.style("text-anchor", "end");
	
	add_axis_label(
		svg_plot,
		(width1 / 2)-(margin1.right-margin1.left),
		height1 + margin1.top + 40,
		"",
		"middle",
		"Year"
	);

    var y_heating = d3.scaleLinear()
        .domain([0, d3.max([...data], function(d) { return +d.heating; })])
        .range([height1, 0]);

	add_axis_label(
		svg_plot,
		-height1 / 2,
		-margin1.left + 35,
		"rotate(-90)",
		"middle",
		"Heating Degree Days (HDD) index"
	);

    svg_plot.append("g")
    .call(d3.axisLeft(y_heating).tickSizeOuter([0]));
	
	var y_cooling = d3.scaleLinear()
        .domain([0, d3.max([...data], function(d) { return +d.cooling; })])
        .range([height1, 0]);
	
	svg_plot
		.append("text")
		.attr('class', 'right_label')
		.attr("text-anchor", "middle")
		.attr("x", -height1 / 2)
		.attr("y", margin1.left - 35)
		.text("Cooling degree days (CDD) index");

    svg_plot.append("g")
	.attr('class', 'right_axis')
    .call(d3.axisRight(y_cooling).tickSizeOuter([0]));

	svg_plot.selectAll(".right_axis")
	.style("transform", `translate(${width1}px, 0px)`);

	svg_plot.selectAll(".right_label")
	.style("transform", `rotate(-90deg) translate(0px, ${width1}px)`);

    var mouseover = function (event, d) {
        d3.selectAll(id_div + "  path").style("opacity", 0.2);
        d3.selectAll(id_div + "  circle").style("opacity", 0.2);
        d3.select(this).style("opacity", 1);
        d3.selectAll(id_div + " .domain").style("opacity", 1);
        info = d3.select(this).datum();
		if(this.className['animVal']=='heating_circle'){
			tooltip
            .html("Year: " + info.year + "<br>HDD: " + info.heating)
            .style("opacity", 1);
		}
		else{
			tooltip
            .html("Year: " + info.year + "<br>CDD: " + info.cooling)
            .style("opacity", 1);
		}
    };

    var mousemove = function (event, d) {
        tooltip
            .style("left", event.pageX + 20 + "px")
            .style("top", event.pageY - 100 + "px");
    };

    var mouseleave = function (event, d) {
        d3.selectAll(id_div + "  path").style("opacity", 1);
        d3.selectAll(id_div + "  circle").style("opacity", 1);
        tooltip.style("opacity", 0);
    };
    
    svg_plot.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "blue")
    .attr("stroke-width", 1.5)
	.on("mouseover", function (event, d) {
		// Rendi opachi tutti gli altri elementi (linee e pallini)
		d3.selectAll(id_div + " path").style("opacity", 0.2);
		d3.selectAll(id_div + " circle").style("opacity", 0.2);

		// Metti in evidenza solo questa linea
		d3.select(this).style("opacity", 1);

		// Metti in evidenza i pallini di questa linea
		d3.selectAll(".heating_circle").style("opacity", 1);
		d3.selectAll(id_div + " .domain").style("opacity", 1);

		tooltip
			.html("HDD")
			.style("opacity", 1);
	})
	.on("mousemove", function (event) {
		tooltip.style("left", (event.pageX + 20) + "px")
			.style("top", (event.pageY - 150) + "px");
	})
	.on("mouseleave", function () {
		d3.selectAll(id_div + " path").style("opacity", 1);
		d3.selectAll(id_div + " circle").style("opacity", 1);

		tooltip.style("opacity", 0);
	})
	.attr("d", d3.line()
		.x(d => x(years_map[d.year]))
		.y(d => y_heating(d.heating))
	)
            
	//add invisible circle for mouseover
	svg_plot.selectAll()
	.data(data)
	.enter()
	.append("circle")
	.attr("cx", d => x(years_map[d.year]))
	.attr("cy", d => y_heating(d.heating))
	.attr("r", 3)
	.attr("fill", "blue")
	.attr("class", "heating_circle")
	.on("mouseover", mouseover)
	.on("mousemove", mousemove)
	.on("mouseleave", mouseleave)

	svg_plot.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "red")
    .attr("stroke-width", 1.5)
	.on("mouseover", function (event, d) {
		// Rendi opachi tutti gli altri elementi (linee e pallini)
		d3.selectAll(id_div + " path").style("opacity", 0.2);
		d3.selectAll(id_div + " circle").style("opacity", 0.2);

		// Metti in evidenza solo questa linea
		d3.select(this).style("opacity", 1);

		// Metti in evidenza i pallini di questa linea
		d3.selectAll(".cooling_circle").style("opacity", 1);
		d3.selectAll(id_div + " .domain").style("opacity", 1);

		tooltip
			.html("CDD")
			.style("opacity", 1);
	})
	.on("mousemove", function (event) {
		tooltip.style("left", (event.pageX + 20) + "px")
			.style("top", (event.pageY - 150) + "px");
	})
	.on("mouseleave", function () {
		d3.selectAll(id_div + " path").style("opacity", 1);
		d3.selectAll(id_div + " circle").style("opacity", 1);

		tooltip.style("opacity", 0);
	})
	.attr("d", d3.line()
		.x(d => x(years_map[d.year]))
		.y(d => y_cooling(d.cooling))
	)

	//add invisible circle for mouseover
	svg_plot.selectAll()
	.data(data)
	.enter()
	.append("circle")
	.attr("cx", d => x(years_map[d.year]))
	.attr("cy", d => y_cooling(d.cooling))
	.attr("r", 3)
	.attr("fill", "red")
	.attr("class", "cooling_circle")
	.on("mouseover", mouseover)
	.on("mousemove", mousemove)
	.on("mouseleave", mouseleave)
}

function single_line_plot(data, svg_plot, id_div) {
	let years = data.map((d) => d.year);
	let years_map = {};
	for(let i=1; i<=years.length; i++){
		years_map[years[i-1]] = i;
	}
    const x = d3
		.scaleLinear()
		.domain([1, years.length])
		.range([0, height]);

	svg_plot
		.append("g")
		.attr("transform", `translate(0, ${height})`)
		.call(d3.axisBottom(x).tickFormat((d, i) => years[d - 1]).ticks(years.length))
		.selectAll("text")
		.attr("transform", "translate(-10,0)rotate(-45)")
		.style("text-anchor", "end");
	
	add_axis_label(
		svg_plot,
		width / 2,
		height + margin.bottom - 20,
		"",
		"middle",
		"Year"
	);
	
    var y = d3.scaleLinear()
        .domain([0, d3.max([...data], function(d) { return +d.losses; })])
        .range([height, 0]);

	add_axis_label(
		svg_plot,
		-height / 2,
		-margin.left + 30,
		"rotate(-90)",
		"middle",
		"losses (billion EUR)"
	);

    svg_plot.append("g")
        .call(d3.axisLeft(y).tickSizeOuter([0]));

    var mouseover = function (event, d) {
        d3.selectAll(id_div + "  path").style("opacity", 0.2);
        d3.selectAll(id_div + "  circle").style("opacity", 0.2);
        d3.select(this).style("opacity", 1);
        d3.selectAll(id_div + " .domain").style("opacity", 1);
        info = d3.select(this).datum();
        tooltip
            .html("Year: <b>" + info.year + "</b><br>Losses: <b>" + info.losses + "</b> billion EUR")
            .style("opacity", 1);
    };

    var mousemove = function (event, d) {
        tooltip
            .style("left", event.pageX + 20 + "px")
            .style("top", event.pageY - 100 + "px");
    };

    var mouseleave = function (event, d) {
        d3.selectAll(id_div + "  path").style("opacity", 1);
        d3.selectAll(id_div + "  circle").style("opacity", 1);
        tooltip.style("opacity", 0);
    };
    
    svg_plot.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "black") // Use shade based on label
    .attr("stroke-width", 1.5)
	.attr("d", d3.line()
		.x(d => x(years_map[d.year]))
		.y(d => y(d.losses))
	)
            
	// Add invisible circle for mouseover
	svg_plot.selectAll()
	.data(data)
	.enter()
	.append("circle")
	.attr("cx", d => x(years_map[d.year]))
	.attr("cy", d => y(d.losses))
	.attr("r", 3)
	.attr("fill", "black")
	.on("mouseover", mouseover)
	.on("mousemove", mousemove)
	.on("mouseleave", mouseleave);
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
		.style("text-anchor", "end")
		.attr("class", "tick_axis_heatmap");

	let ticks_axis = document.querySelectorAll('.tick_axis_heatmap');
	for(let i=0; i<ticks_axis.length; i = i + 1){
		if(i % 3 != 0){
			ticks_axis[i].parentNode.style.opacity = 0;
		}
	}

	add_axis_label(
		svg_plot,
		width / 2,
		height + margin.bottom - 25,
		"",
		"middle",
		"Year"
	);

	svg_plot.append("g").call(d3.axisLeft(y).tickSizeOuter([0]));

	add_axis_label(
		svg_plot,
		-height / 2,
		-margin.left + 25,
		"rotate(-90)",
		"middle",
		"pH"
	);

	const legendHeight = 20;
	const legendWidth = width * 0.8;
	const legendX = (width - legendWidth) / 2;
	const legendY = height + 140;

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
			{ offset: "0%", color: "#5F021F" },
            { offset: "50%", color: "red" },
			{ offset: "100%", color: "white" }
		])
		.enter()
		.append("stop")
		.attr("offset", (d) => d.offset)
		.attr("stop-color", (d) => d.color);

	const myColor = d3
		.scaleLinear()
		.range(["#5F021F", "red", "white"])
		.domain([min_value_pH, min_value_pH+((8.2-min_value_pH)/2), 8.2]);
	
	const legendScale = d3
		.scaleLinear()
		.domain([min_value_pH, min_value_pH+((8.2-min_value_pH)/2), 8.2])
		.range([0, legendWidth/2, legendWidth]);

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
                "Year: <b>" + info.year
                + "</b><br>"
				+ "pH: <b>" + info.pH
				+ "</b>" 
			)
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

function customTickFormat(d) {
	if (Number.isInteger(maxVal)) {
		return d3.format(".0f")(d);
	} else {
		return d3.format(".1f")(d);
	}
}

function map_plot(data, topo, svg_plot, colorScheme, id_div, min_value, max_value, column) {
	projection = d3.geoMercator().scale(430);
	projection = projection.center([30, 55]).translate([width / 2, height / 2]);

	minVal = min_value;
	maxVal = max_value;

	const numThresholds = 8;
	const thresholds = Array.from(
		{ length: numThresholds },
		(_, i) => minVal + ((i + 1) * (maxVal - minVal)) / (numThresholds + 1)
	);
	thresholds.unshift(minVal);
	thresholds.push(maxVal);

	let colorScale = d3.scaleThreshold().domain(thresholds).range(colorScheme);

	let mouseOver = function (d) {
		if(d.currentTarget.__data__.total!=-1){
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
				.html(
					"Country: <b>" +
						d.currentTarget.__data__.properties.NAME +
						`</b><br>${column}: ` +
						"<b>" + 
						d.currentTarget.__data__.total +
						"</b>"
				)
				.style("opacity", 1);
		}
	};

	let mouseMove = function tooltipMousemove(event, d) {
		tooltip
			.style("left", event.pageX + 20 + "px")
			.style("top", event.pageY - 150 + "px");
	};

	let mouseLeave = function (d) {
		if(d.currentTarget.__data__.total!=-1){
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

	// Draw the map
	svg_plot
		.append("g")
		.attr("transform", `translate(${margin2.left},${margin2.top})`)
		.append("g")
		.selectAll("path")
		.data(topo.features)
		.enter()
		.append("path")
		// draw each country
		.attr("d", d3.geoPath().projection(projection))
		// set the color of each country
		.attr("fill", function (d) {
			d.total = data.get(d.properties.ISO3) ;
			if(d.total==undefined){
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

	// Create gradient for the legend
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
	const legendWidth = width2 * 0.8;
	const legendX = ((width2) /4)-80;
	const legendY = height2 + 50;

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

	const legendAxis = d3
		.axisBottom(legendScale)
		.tickValues([
			minVal,
			minVal + (maxVal - minVal) / 4,
			(minVal + maxVal) / 2,
			minVal + (3 * (maxVal - minVal)) / 4,
			maxVal,
		])
		.tickFormat(customTickFormat);

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
		.text(`${column}`);
}


d3.csv("Cicala/plot1.csv", function (d) {
	return {
		year: d.year,
		heating: +d["heating"],
		cooling: +d["cooling"],
	};
}).then(function (data) {
	double_line_plot(data, svg_plot1, "#plot1");
});

let loadData0_slider2 = NaN;
let loadData1_slider2 = NaN;

var onchange_slider2 = function (event, d) {
	d3.select("#text_sliders2").text(`Year: ${event.target.value}`)
	let plot = document.getElementById('plot2');
	while (plot.firstChild) {
		plot.removeChild(plot.lastChild);
	}
	let svg_plot2 = d3.select("#plot2")
	.append("svg")
	.attr("width", width2 + margin2.left + margin2.right)
	.attr("height", height2 + margin2.top + margin2.bottom)
	.append("g")
	.attr("transform", `translate(${margin2.left},${margin2.top})`);

	let min_value = d3.min([...loadData1_slider2], function(d) { return +d.heating; })
	let max_value = d3.max([...loadData1_slider2], function(d) { return +d.heating; })
	let dataTotal = new Map(
		loadData1_slider2.filter(d => d.year==event.target.value).map((d) => [d.code, d.heating])
	);
	let colorScheme = d3.schemeBlues[7];
	map_plot(
		dataTotal,
		loadData0_slider2,
		svg_plot2,
		colorScheme,
		"plot_2",
		min_value,
		max_value,
		'HDD'
	);
};

Promise.all([
	d3.json("Cicala/europe.geojson"),
	d3.csv("Cicala/plot2.csv", function (d) {
		return { code: d.Code, year: d.year, heating: +d.heating };
	}),
]).then(function (loadData) {
	let min_year = d3.min([...loadData[1]], function(d) { return +d.year; })
	let max_year = d3.max([...loadData[1]], function(d) { return +d.year; })
	let min_value = d3.min([...loadData[1]], function(d) { return +d.heating; })
	let max_value = d3.max([...loadData[1]], function(d) { return +d.heating; })
	let text = d3
		.select("#slidecontainer2")
		.append("text")
		.style("font-size", "18px")
		.attr("id", "text_sliders2")
		.text(`Year: ${max_year}`);
	let slider = d3
		.select("#slidecontainer2")
		.append("input")
		.attr("type", "range")
		.attr("id", "range_plot2")
		.attr("min", `${min_year}`)
		.attr("max", `${max_year}`)
		.attr("value", `${max_year}`)
		.on("input", onchange_slider2)
	
	loadData0_slider2 = loadData[0];
	loadData1_slider2 = loadData[1];
	let topo = loadData[0];
	let dataTotal = new Map(
		loadData[1].filter(d => d.year==max_year).map((d) => [d.code, d.heating])
	);
	let colorScheme = d3.schemeBlues[7];
	map_plot(
		dataTotal,
		topo,
		svg_plot2,
		colorScheme,
		"plot_2",
		min_value,
		max_value,
		'HDD'
	);
});

let loadData0_slider3 = NaN;
let loadData1_slider3 = NaN;

var onchange_slider3 = function (event, d) {
	d3.select("#text_sliders3").text(`Year: ${event.target.value}`)
	let plot = document.getElementById('plot3');
	while (plot.firstChild) {
		plot.removeChild(plot.lastChild);
	}
	let svg_plot3 = d3.select("#plot3")
	.append("svg")
	.attr("width", width2 + margin2.left + margin2.right)
	.attr("height", height2 + margin2.top + margin2.bottom)
	.append("g")
	.attr("transform", `translate(${margin2.left},${margin2.top})`);

	let min_value = d3.min([...loadData1_slider3], function(d) { return +d.cooling; })
	let max_value = d3.max([...loadData1_slider3], function(d) { return +d.cooling; })
	let dataTotal = new Map(
		loadData1_slider3.filter(d => d.year==event.target.value).map((d) => [d.code, d.cooling])
	);
	let colorScheme = d3.schemeReds[7];
	map_plot(
		dataTotal,
		loadData0_slider3,
		svg_plot3,
		colorScheme,
		"plot_3",
		min_value,
		max_value,
		'CDD'
	);
};

Promise.all([
	d3.json("Cicala/europe.geojson"),
	d3.csv("Cicala/plot2.csv", function (d) {
		return { code: d.Code, year: d.year, cooling: +d.cooling };
	}),
]).then(function (loadData) {
	let min_year = d3.min([...loadData[1]], function(d) { return +d.year; })
	let max_year = d3.max([...loadData[1]], function(d) { return +d.year; })
	let min_value = d3.min([...loadData[1]], function(d) { return +d.cooling; })
	let max_value = d3.max([...loadData[1]], function(d) { return +d.cooling; })
	let text = d3
		.select("#slidecontainer3")
		.append("text")
		.style("font-size", "18px")
		.attr("id", "text_sliders3")
		.text(`Year: ${max_year}`);
	let slider = d3
		.select("#slidecontainer3")
		.append("input")
		.attr("type", "range")
		.attr("id", "range_plot3")
		.attr("min", `${min_year}`)
		.attr("max", `${max_year}`)
		.attr("value", `${max_year}`)
		.on("input", onchange_slider3)
	
	loadData0_slider3 = loadData[0];
	loadData1_slider3 = loadData[1];
	let topo = loadData[0];
	let dataTotal = new Map(
		loadData[1].filter(d => d.year==max_year).map((d) => [d.code, d.cooling])
	);
	let colorScheme = d3.schemeReds[7];
	map_plot(
		dataTotal,
		topo,
		svg_plot3,
		colorScheme,
		"plot_3",
		min_value,
		max_value,
		'CDD'
	);
});

d3.csv("Cicala/plot4.csv", function (d) {
	return {
		year: d.year,
		pH: +d["pH"],
	};
}).then(function (data) {
	heatmap_plot(data, svg_plot4, "#plot4");
});

d3.csv("Cicala/plot5.csv", function (d) {
	return {
		year: d.year,
		losses: +d["losses"],
	};
}).then(function (data) {
	single_line_plot(data, svg_plot5, "#plot5");
});