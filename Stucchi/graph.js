const driver_margin = { top: 30, right: 30, bottom: 200, left: 150 },
driver_width = 600 - driver_margin.left - driver_margin.right,
driver_height = 600 - driver_margin.top - driver_margin.bottom;

const driver_margin_multiline_plot = { top: 30, right: 30, bottom: 100, left: 100 },
	driver_width_multiline_plot = 770 - driver_margin_multiline_plot.left - driver_margin_multiline_plot.right,
	driver_height_multiline_plot = 650 - driver_margin_multiline_plot.top - driver_margin_multiline_plot.bottom;

const units = "million tonnes of oil equivalent";
const formatNumber = d3.format(",.0f");
const format = d => `${formatNumber(d)} ${units}`;

// Set up the dimensions and margins
const driver_margin_sankey = { top: 10, right: 100, bottom: 10, left: 100 };
let driver_width_sankey = document.getElementById('plot6').clientWidth - driver_margin_sankey.left - driver_margin_sankey.right;
let driver_height_sankey = document.getElementById('plot6').clientHeight - driver_margin_sankey.top - driver_margin_sankey.bottom;

// Create the SVG container
const svg_plot6 = d3.select("#plot6")
  .append("svg")
  .attr("width", driver_width_sankey + driver_margin_sankey.left + driver_margin_sankey.right)
  .attr("height", driver_height_sankey + driver_margin_sankey.top + driver_margin_sankey.bottom)
  .append("g")
  .attr("transform", `translate(${driver_margin_sankey.left},${driver_margin_sankey.top})`);

// Create gradient definitions
const defs = svg_plot6.append("defs");

const svg_plot7 = d3
	.select("#plot7")
	.append("svg")
	.attr("width", driver_width + driver_margin.left + driver_margin.right)
	.attr("height", driver_height + driver_margin.top + driver_margin.bottom)
	.append("g")
	.attr("transform", `translate(${driver_margin.left},${driver_margin.top})`);

const svg_plot8 = d3
	.select("#plot8")
	.append("svg")
	.attr("width", driver_width + driver_margin.left + driver_margin.right)
	.attr("height", driver_height + driver_margin.top + driver_margin.bottom)
	.append("g")
	.attr("transform", `translate(${driver_margin.left},${driver_margin.top})`);

const svg_plot9 = d3
	.select("#plot9")
	.append("svg")
	.attr("width", driver_width_multiline_plot + driver_margin_multiline_plot.left + driver_margin_multiline_plot.right + 140)
	.attr("height", driver_height_multiline_plot + driver_margin_multiline_plot.top + driver_margin_multiline_plot.bottom)
	.append("g")
	.attr("transform", `translate(${driver_margin_multiline_plot.left},${driver_margin_multiline_plot.top})`);

const svg_plot10 = d3
	.select("#plot10")
	.append("svg")
	.attr("width", driver_width_multiline_plot + driver_margin_multiline_plot.left + driver_margin_multiline_plot.right + 130)
	.attr("height", driver_height_multiline_plot + driver_margin_multiline_plot.top + driver_margin_multiline_plot.bottom)
	.append("g")
	.attr("transform", `translate(${driver_margin_multiline_plot.left},${driver_margin_multiline_plot.top})`)
	.attr("id", "svg10");

let driver_tooltip = d3
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

// Set up the sankey generator
const sankey = d3.sankey()
  .nodeWidth(36)
  .nodePadding(20)
  .extent([[0, 0], [driver_width_sankey, driver_height_sankey]]);

function sankey_plot(nodes_data, links_data, svg_plot, defs) {
	let nodes = nodes_data.map((d, i) => ({
		name: d.node,
		real_value: +d.value, 
		indirect_links: new Set(JSON.parse(d.indirect_links)),
		color: d.color
	}));
	
	let links = links_data.map(d => ({
		source: +d.source,
		target: +d.target,
		value: +d.value
	}));

	let n_sectors = 4;
	let n_countries = 15;

	let countries = nodes_data
		.slice(n_sectors, n_sectors + n_countries)
		.map(d => d.node);

  // Generate the sankey diagram
  const { nodes: sankeyNodes, links: sankeyLinks } = sankey({
    nodes: nodes,
    links: links
  });

  // Create gradients for each link
  sankeyLinks.forEach((link, i) => {
    const gradientId = `gradient-${i}`;
    const gradient = defs.append("linearGradient")
      .attr("id", gradientId)
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", link.source.x1)
      .attr("x2", link.target.x0);

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", link.source.color);

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", link.target.color);
  });

  // Add the links
  const link = svg_plot.append("g")
    .selectAll(".link")
    .data(sankeyLinks)
    .join("path")
    .attr("class", "link")
    .attr("d", d3.sankeyLinkHorizontal())
    .attr("stroke", (d, i) => `url(#gradient-${i})`)
    .attr("stroke-width", d => Math.max(1, d.width))
    .on("mouseover", highlightFlowLink)
    .on("mouseout", unhighlightFlow)
    .on("mousemove", tooltipMousemove);

  // Add the nodes
  const node = svg_plot.append("g")
    .selectAll(".node")
    .data(sankeyNodes)
    .join("g")
    .attr("class", "node")
    .attr("transform", d => `translate(${d.x0},${d.y0})`);

  // Add rectangles for the nodes
  node.append("rect")
    .attr("height", d => d.y1 - d.y0)
    .attr("width", d => d.x1 - d.x0)
    .attr("fill", d => d.color)
    .attr("stroke", "#000")
    .on("mouseover", highlightFlowNode)
    .on("mouseout", unhighlightFlow)
    .on("mousemove", tooltipMousemove);

  // Add titles for the nodes
  node.append("text")
    .attr("x", d => (d.x0 < width / 2) ? 6 + (d.x1 - d.x0) : -6)
    .attr("y", d => (d.y1 - d.y0) / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", d => (d.x0 < width / 2) ? "start" : "end")
    .text(d => d.name);

	function highlightFlowNode(event, d) {
		// Reduce opacity of all links and nodes
		link.style("stroke-opacity", 0.1);
		node.style("opacity", 0.1);
		
		// Get all connected links
		const linkedNodes = new Set();
		linkedNodes.add(d);
		
		// Highlight connected links and their nodes
		link.filter(l => l.source === d || l.target === d || d.indirect_links.has(l.source.index) || d.indirect_links.has(l.target.index))
		.style("stroke-opacity", 0.7)
		.each(l => {
			linkedNodes.add(l.source);
			linkedNodes.add(l.target);
		});
		
		// Highlight connected nodes
		node.filter(n => linkedNodes.has(n))
		.style("opacity", 1); 

		driver_tooltip.html("Total Energy Use: " + d.real_value + " " + units).style("opacity", 1);
	}

	// Function to remove highlighting
	function unhighlightFlow() {
		link.style("stroke-opacity", 0.2);
		node.style("opacity", 1);
		driver_tooltip.style("opacity", 0);
	}

	function tooltipMousemove(event, d) {
		driver_tooltip.style('left', (event.pageX+20) + 'px').style('top', (event.pageY-100) + 'px');
		}

	// Function to highlight the flow
	function highlightFlowLink(event, d) {
	// Reduce opacity of all links and nodes
	link.style("stroke-opacity", 0.1);
	node.style("opacity", 0.1);

	// Get all connected links
	const linkedNodes = new Set();

	// Highlight connected links and their nodes
	link.filter(l => (l.source === d.source && l.target === d.target) || (l.source === d.target && nodes[d.source.index].indirect_links.has(l.target.index)) || (l.target === d.source && nodes[d.target.index].indirect_links.has(l.source.index)))
		.style("stroke-opacity", 0.7)
		.each(l => {
		linkedNodes.add(l.source);
		linkedNodes.add(l.target);
		});

	// Highlight connected nodes
	node.filter(n => linkedNodes.has(n))
		.style("opacity", 1);

	if (countries.includes(d.target.name)) 
		driver_tooltip.html(`${d.target.name}'s ${d.target.name.toLowerCase().split(" - ")[1]} energy consumption: ${d.value} ${units}.`).style("opacity", 1);
	
	if (countries.includes(d.source.name)) 
		driver_tooltip.html(`${d.source.name} ${d.target.name} used: ${d.value} ${units}`).style("opacity", 1);
	}
}

// Make it responsive
function resize() {
  width = document.getElementById('plot1').clientWidth - margin.left - margin.right;
  height = document.getElementById('plot1').clientHeight - margin.top - margin.bottom;
  
  d3.select("#plot6 svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);
    
  sankey.extent([[0, 0], [width, height]]);
}

window.addEventListener("resize", resize);

let clicked_vehicle = NaN;

function radio(data, radio_list_id, svg_id, svg_plot) {
	const radio_list = document.getElementById(radio_list_id);

	// Iterate through the data array to create and append checkbox elements
	// Use a Set to track unique years
	let uniqueVehicles = new Set();
	const default_clicked_vehicle = "Passenger cars"

	data.forEach(item => {
		const vehicle = item.vehicle;
	
		if (!uniqueVehicles.has(vehicle)) {
			uniqueVehicles.add(vehicle);

			// Create a new list item (li)
			const li = document.createElement("li");

			// Create a new radio input
			const radio = document.createElement("input");
			radio.type = "radio";
			radio.value = vehicle;
			radio.setAttribute("id", "radio-" + vehicle);

			// Optionally set the checkbox as checked
			if (radio.value === default_clicked_vehicle) {
				radio.checked = true;
			}

			// Create a text node for the label
			const label = document.createTextNode(vehicle);
			/* let baseColor = colorScale(vehicle)
			const box_color = document.createElement("div");
			box_color.setAttribute("class", "color-box");
			box_color.style.backgroundColor = baseColor; */
			// Append the checkbox and label to the list item
			li.appendChild(radio);
			li.appendChild(label);
			/* li.appendChild(box_color) */

			// Append the list item to the checkbox list
			radio_list.appendChild(li);
		}
	});

	const radio = document.querySelectorAll("#"+radio_list_id+" input[type='radio']");

	for (radio_button of radio) {
		radio_button.addEventListener('change', (event) => {
			if (event.currentTarget.checked) {
					
				for (radio_button of radio)
					radio_button.checked = false;

				event.currentTarget.checked = true;

				clicked_vehicle = event.currentTarget.value
				let plot = document.getElementById(svg_id);
				while (plot.firstChild) {
					plot.removeChild(plot.lastChild);
				}
				let filtered_data = data.filter(d => d.vehicle === clicked_vehicle);

				const groupedData = d3.group(filtered_data, d => d.country);

				// Transform the grouped data into the desired format
				const formattedData = Array.from(groupedData, ([country, entries]) => ({
					country: country,
					zero_emission_vehicles_percentage: entries.map(entry => ({
						year: +entry.year, 
						value: +entry.zero_emission_vehicles_percentage 
					}))
				}));

				driver_multiline_plot2(formattedData, svg_plot, svg_id);
			}
		})
	}
	
	clicked_vehicle = default_clicked_vehicle;
}

function add_axis_label(svg_plot, x, y, transform, text_anchor, label) {
    svg_plot
        .append("text")
        .attr("text-anchor", text_anchor)
        .attr("x", x)
        .attr("y", y)
        .attr("transform", transform)
        .text(label);
}

function driver_bar_plot(data, svg_plot, id_div, color_function) {
    /* data = data.filter(d => d.year === "2020");
 */
    var max_value = 0;
    data.forEach((d) => {
        if (d.total_type_of_fuel_consumption_value > max_value) {
            max_value = d.total_type_of_fuel_consumption_value;
        }
    });

    const x = d3
        .scaleBand()
        .range([0, driver_width])
        .domain(data.map((d) => d.fuel_type))
        .padding(0.2);

    svg_plot
        .append("g")
        .attr("transform", `translate(0, ${driver_height})`)
        .call(d3.axisBottom(x).tickSizeOuter([0]))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    add_axis_label(
        svg_plot,
        driver_width / 2,
        driver_height + driver_margin.bottom - 5,
        "",
        "middle",
        "Fuel type"
    );

    const y = d3
        .scaleLinear()
        .domain([0, max_value + 0.1 * max_value])
        .range([driver_height, 0]);

    svg_plot.append("g").call(d3.axisLeft(y).tickSizeOuter([0]));

    add_axis_label(
        svg_plot,
        -driver_height / 2,
        -driver_margin.left + 50,
        "rotate(-90)",
        "middle",
        "Fuel consumption (Million tonnes of oil equivalent)"
    );

    var mouseover = function (event, d) {
        d3.selectAll(id_div + "  rect").style("opacity", 0.2);
        d3.select(this).style("opacity", 1);
        info = d3.select(this).datum();
        driver_tooltip
            .html("Fuel consumption: " + info.total_type_of_fuel_consumption_value + " million tonnes of oil equivalent")
            .style("opacity", 1);
    };

    var mousemove = function (event, d) {
        driver_tooltip
            .style("left", event.pageX + 20 + "px")
            .style("top", event.pageY - 100 + "px");
    };

    var mouseleave = function (event, d) {
        d3.selectAll(id_div + " rect").style("opacity", 1);
        driver_tooltip.style("opacity", 0);
    };

    svg_plot
        .selectAll()
        .data(data)
        .join("rect")
        .attr("x", (d) => x(d.fuel_type))
        .attr("y", (d) => y(d.total_type_of_fuel_consumption_value))
        .attr("width", x.bandwidth())
        .attr("height", (d) => driver_height - y(d.total_type_of_fuel_consumption_value))
        .attr("fill", (d) => color_function(d.fuel_type))
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);
}

function driver_stacked_bar_plot(data, svg_plot, id_div, color_function) {
	const nestedData = Array.from(
		d3.group(data, (d) => d.country),
		([country, values]) => {
			const countryData = { country: country };
			values.forEach((v) => (countryData[v.rank] = v.consumption_value));
			return countryData;
		}
	);

	var mapping_entity = {};
	data.forEach((d) => (mapping_entity[d.country + d.rank] = [d.fuel_type, d.consumption_value]));

	const subgroups = Array.from(new Set(data.map((d) => d.rank)));
	const groups = Array.from(new Set(data.map((d) => d.country)));

	// Get the max value for the Y axis
	var max_value = 0;
	for (let i = 0; i < 5; i++) {
		let value_country = 0;
		subgroups.forEach((j) => (value_country += nestedData[i][j]));
		if (value_country > max_value) {
			max_value = value_country;
		}
	}

	// Add X axis
	var x = d3
		.scaleLinear()
		.domain([0, max_value + 0.1 * max_value])
		.range([0, driver_width]);

	svg_plot
		.append("g")
		.attr("transform", `translate(0, ${driver_height})`)
		.call(d3.axisBottom(x).tickSizeOuter([0]))
		.selectAll("text")
		.attr("transform", "translate(-10,0)rotate(-45)")
		.style("text-anchor", "end");

	add_axis_label(
		svg_plot,
		driver_width / 2,
		driver_height + 70,
		"",
		"middle",
		"Fuel consumption (Million tonnes of oil equivalent)"
	);

	// Add Y axis
	const y = d3.scaleBand().range([0, driver_height]).domain(groups).padding(0.2);

	svg_plot.append("g").call(d3.axisLeft(y).tickSizeOuter([0]));

	add_axis_label(
		svg_plot,
		-driver_height / 2,
		-driver_margin.left + 50,
		"rotate(-90)",
		"middle",
		"Country"
	);

	var mouseover = function (event, d) {
		d3.selectAll(id_div + " rect").style("opacity", 0.2);
		d3.select(this).style("opacity", 1);
		info = d3.select(this).datum();
		info_parent = d3.select(this.parentNode).datum();
		driver_tooltip
			.html(
				"Type of fuel: " +
					mapping_entity[info.data.country + info_parent.key][0] +
					"<br>" +
					"Value: " +
					mapping_entity[info.data.country + info_parent.key][1] +
					" million tonnes of oil equivalent"
			)
			.style("opacity", 1);
	};

	var mousemove = function (event, d) {
		driver_tooltip
			.style("left", event.pageX + 20 + "px")
			.style("top", event.pageY - 100 + "px");
	};

	var mouseleave = function (event, d) {
		d3.selectAll(id_div + " rect").style("opacity", 1);
		driver_tooltip.style("opacity", 0);
	};

	const stackedData = d3.stack().keys(subgroups)(nestedData);
    let rank = -1;
    first_country = groups[0]
	svg_plot
		.append("g")
		.selectAll("g")
		.data(stackedData)
		.join("g")
		// Assign colors based on fuel type
		.attr("fill", (d) => {
			return null;
		})
		.selectAll("rect")
		.data((d) => d)
		.join("rect")
		.attr("y", (d) => y(d.data.country))
		.attr("x", (d) => x(d[0]))
		.attr("width", (d) => x(d[1]) - x(d[0]))
		.attr("height", y.bandwidth())
        .attr("fill", (d) => {
            if(d.data.country == first_country)
                rank += 1;
			const fuelType = mapping_entity[d.data.country + subgroups[rank]][0]; // Access fuel type
			return color_function(fuelType); // Use fuelType for coloring  
		})
		.attr("stroke", "grey")
		.on("mouseover", mouseover)
		.on("mousemove", mousemove)
		.on("mouseleave", mouseleave);
}

function driver_multiline_plot1(data, svg_plot, id_div) {
    // Define the scales
    const x = d3.scaleLinear()
        .domain(d3.extent(data[0].waste_disposed, d => d.year)) // Assumes years are consistent across groups
        .range([0, driver_width_multiline_plot]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d3.max(d.waste_disposed, v => v.value))])
        .range([driver_height_multiline_plot, 0]);

    // Add the X axis
    svg_plot.append("g")
        .attr("transform", `translate(0,${driver_height_multiline_plot})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    add_axis_label(
        svg_plot,
        driver_width_multiline_plot / 2,
        driver_height_multiline_plot + 70,
        "",
        "middle",
        "Year"
    );

    // Add the Y axis
    svg_plot.append("g")
        .call(d3.axisLeft(y));

    add_axis_label(
        svg_plot,
        -driver_height_multiline_plot / 2,
		-driver_margin_multiline_plot.left + 50,
        "rotate(-90)",
        "middle",
        "Waste Disposed (Million Tonnes)"
    );


	const waste_operation_types = Array.from(new Set(data.map((d) => d.waste_operation)));

	// Create a color scale that generates a unique color for each fuel type
	const color_function = d3.scaleOrdinal()
		.domain(waste_operation_types)
		.range(waste_operation_types.map((_, i) => d3.interpolateCividis(i / waste_operation_types.length)));

    // Draw the lines
    data.forEach(waste_operation => {
		const isDisposalAvg = waste_operation.waste_operation === "Disposal - average";
		const isReciclyingAvg = waste_operation.waste_operation === "Recovery - average";

        const line = svg_plot.append("path")
            .datum(waste_operation.waste_disposed) // Bind data
            .attr("fill", "none")
            .attr("stroke", isDisposalAvg ? "#4CAF50" : isReciclyingAvg ? "#4CAF50" : "#d4d4d4")
            .attr("stroke-width", isDisposalAvg ? 3.5 : isReciclyingAvg ? 3.5 : 3)
            .attr("class", isDisposalAvg ? "is-avg" : isReciclyingAvg ? "is-avg" : "country-line")
            .attr("d", d3.line()
                .x(d => x(d.year))
                .y(d => y(d.value))
            )

		if (!isDisposalAvg || !isReciclyingAvg) {
            line.on("mouseover", function (event) {
				svg_plot.selectAll(".country-line")
					.style("opacity", 0.2);
                d3.select(this)
                    .style("stroke", color_function(waste_operation.waste_operation))
                    .style("opacity", 1);

                driver_tooltip
                    .html(`<b>${waste_operation.waste_operation}</b>`)
                    .style("opacity", 1)
                    .style("left", (event.pageX + 30) + "px")
                    .style("top", (event.pageY - 130) + "px");
            })
            .on("mouseleave", function () {
				svg_plot.selectAll(".country-line")
					.style("opacity", 1);
                d3.select(this)
                    .style("stroke", "#d4d4d4")
				driver_tooltip.style("opacity", 0);
            });
		}
		/* else {
			svg_plot.append("text")
					.attr("x", x(d3.max(waste_operation.waste_disposed, p => p.year)) + 5)
					.attr("y", y(waste_operation.waste_disposed[waste_operation.waste_disposed.length - 1].value))
					.attr("fill", "#4CAF50")
					.attr("font-size", "12px")
					.attr("alignment-baseline", "middle")
					.text(isDisposalAvg ? "Disposal Operations Average" : "Reciclying Operations Average");
		} */

		if(isDisposalAvg) {
			svg_plot.append("text")
					.attr("x", x(d3.max(waste_operation.waste_disposed, p => p.year)) + 5)
					.attr("y", y(waste_operation.waste_disposed[waste_operation.waste_disposed.length - 1].value))
					.attr("fill", "#4CAF50")
					.attr("font-size", "12px")
					.attr("alignment-baseline", "middle")
					.text("Disposal Operations Average");
		}
		if(isReciclyingAvg) {
			svg_plot.append("text")
					.attr("x", x(d3.max(waste_operation.waste_disposed, p => p.year)) + 5)
					.attr("y", y(waste_operation.waste_disposed[waste_operation.waste_disposed.length - 1].value))
					.attr("fill", "#4CAF50")
					.attr("font-size", "12px")
					.attr("alignment-baseline", "middle")
					.text("Reciclying Operations Average");
		}
    });
	svg_plot.select(".is-avg").raise();
}

function driver_multiline_plot2(data, svg_plot, id_div) {
    // Define the scales
    const x = d3.scaleLinear()
        .domain(d3.extent(data[0].zero_emission_vehicles_percentage, d => d.year)) // Assumes years are consistent across groups
        .range([0, driver_width_multiline_plot]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d3.max(d.zero_emission_vehicles_percentage, v => v.value))])
        .range([driver_height_multiline_plot, 0]);

    // Add the X axis
    svg_plot.append("g")
        .attr("transform", `translate(0,${driver_height_multiline_plot})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    add_axis_label(
        svg_plot,
        driver_width_multiline_plot / 2,
        driver_height_multiline_plot + 70,
        "",
        "middle",
        "Year"
    );

    // Add the Y axis
    svg_plot.append("g")
        .call(d3.axisLeft(y));

    add_axis_label(
        svg_plot,
        -driver_height_multiline_plot / 2,
		-driver_margin_multiline_plot.left + 50,
        "rotate(-90)",
        "middle",
        "Zero Emission Vehicles (%)"
    );


	const countries = Array.from(new Set(data.map((d) => d.country)));

    // Draw the lines
    data.forEach(country => {
		const isEuropeanUnion = country.country === "European Union (Avg)";
		
        const line = svg_plot.append("path")
            .datum(country.zero_emission_vehicles_percentage) // Bind data
            .attr("fill", "none")
			.attr("stroke", isEuropeanUnion ? "#4CAF50" : "#d4d4d4")
			.attr("stroke-width", isEuropeanUnion ? 3.5 : 3)
			/* .style("opacity", isEuropeanUnion ? 1 : 0.3) */
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
		
					driver_tooltip
						.style("opacity", 1)
						.html("Country: <b>" + country.country + "</b>")
						.style("left", (event.pageX + 30) + "px")
						.style("top", (event.pageY - 130) + "px");
				})
				.on("mouseleave", function () {
					svg_plot.selectAll(".country-line")
						.style("stroke", "#d4d4d4")
						.style("opacity", 1);

					driver_tooltip.style("opacity", 0);
				});
			}
			else {
				svg_plot.append("text")
					.attr("x", x(d3.max(country.zero_emission_vehicles_percentage, p => p.year)) + 5)
					.attr("y", y(country.zero_emission_vehicles_percentage[country.zero_emission_vehicles_percentage.length - 1].value))
					.attr("fill", "#4CAF50")
					.attr("font-size", "12px")
					.attr("alignment-baseline", "middle")
					.text("European Union Average");
			}
		});
		svg_plot.select(".is-eu").raise();
}

// Load and process the data
/* Promise.all([
	d3.csv('Stucchi/prepared_datasets/nodes.csv'),
	d3.csv('Stucchi/prepared_datasets/links.csv')
  ]).then(([nodes_data, links_data]) => { */
/* 	let filtered_nodes_data = nodes_data.filter(d => d.year === "2022");
	let filtered_links_data = links_data.filter(d => d.year === "2022");
 */
	/* let filtered_nodes_data = nodes_data.filter(d => d.year === "2022").map((d, i) => ({
		name: d.node,
		value: +d.value, // Convert value to a number
	}));
	
	let filtered_links_data = links_data.filter(d => d.year === "2022").map(d => ({
		source: +d.source,
		target: +d.target,
		value: +d.value, // Convert value to a number
	})); */
	
/* 	sankey_plot(nodes_data, links_data, svg_plot6, "#plot6");
  }); */

let driver_plot1_loadData1_slider = NaN;
let driver_plot1_loadData2_slider = NaN;

var driver_plot1_loadData_slider_onchange = function (event, d) {
	d3.select("#text_sliders6").text(`Year: ${event.target.value}`)
	let plot6 = document.getElementById('plot6');
	while (plot6.firstChild) {
		plot6.removeChild(plot6.lastChild);
	}

	const svg_plot6 = d3.select("#plot6")
	.append("svg")
	.attr("width", driver_width_sankey + driver_margin_sankey.left + driver_margin_sankey.right)
	.attr("height", driver_height_sankey + driver_margin_sankey.top + driver_margin_sankey.bottom)
	.append("g")
	.attr("transform", `translate(${driver_margin_sankey.left},${driver_margin_sankey.top})`);

	// Create gradient definitions
	const defs = svg_plot6.append("defs");

	let filtered_nodes_data = driver_plot1_loadData1_slider.filter(d => d.year===`${event.target.value}`);
	let filtered_link_data = driver_plot1_loadData2_slider.filter(d => d.year===`${event.target.value}`);
	sankey_plot(filtered_nodes_data, filtered_link_data, svg_plot6, defs);
};

// Load and process the data
Promise.all([
	d3.csv('Stucchi/prepared_datasets/plot1_nodes.csv'),
	d3.csv('Stucchi/prepared_datasets/plot1_links.csv')
]).then(([nodes_data, links_data]) => {
	let min_year = d3.min(nodes_data, function(d) { return +d.year; });
	let max_year = d3.max(nodes_data, function(d) { return +d.year; });

	let text = d3
		.select("#slidecontainer6")
		.append("text")
		.style("font-size", "18px")
		.attr("id", "text_sliders6")
		.text(`Year: ${max_year}`);
	let slider = d3
		.select("#slidecontainer6")
		.append("input")
		.attr("type", "range")
		.attr("id", "range_plot6")
		.attr("min", `${min_year}`)
		.attr("max", `${max_year}`)
		.attr("value", `${max_year}`)
		.on("input", driver_plot1_loadData_slider_onchange)

	driver_plot1_loadData1_slider = nodes_data;
	driver_plot1_loadData2_slider = links_data;
	let filtered_nodes_data = driver_plot1_loadData1_slider.filter(d => d.year===`${max_year}`);
	let filtered_link_data = driver_plot1_loadData2_slider.filter(d => d.year===`${max_year}`);
	sankey_plot(filtered_nodes_data, filtered_link_data, svg_plot6, defs);
});

/* let color_function = NaN; */
let fuel_types = NaN;
let driver_plot2_loadData_slider = NaN;
let driver_plot3_loadData_slider = NaN;

var driver_plot2_3_loadData_slider_onchange = function (event, d) {
	d3.select("#text_sliders7_8").text(`Year: ${event.target.value}`)
	let plot7 = document.getElementById('plot7');
	let plot8 = document.getElementById('plot8');
	while (plot7.firstChild) {
		plot7.removeChild(plot7.lastChild);
	}
	while (plot8.firstChild) {
		plot8.removeChild(plot8.lastChild);
	}
	const svg_plot7 = d3
	.select("#plot7")
	.append("svg")
	.attr("width", driver_width + driver_margin.left + driver_margin.right)
	.attr("height", driver_height + driver_margin.top + driver_margin.bottom)
	.append("g")
	.attr("transform", `translate(${driver_margin.left},${driver_margin.top})`);
	const svg_plot8 = d3
	.select("#plot8")
	.append("svg")
	.attr("width", driver_width + driver_margin.left + driver_margin.right)
	.attr("height", driver_height + driver_margin.top + driver_margin.bottom)
	.append("g")
	.attr("transform", `translate(${driver_margin.left},${driver_margin.top})`);

	const fuel_types = Array.from(new Set(driver_plot2_loadData_slider.map((d) => d.fuel_type))); 

	// Create a color scale that generates a unique color for each fuel type
	const color_function = d3.scaleOrdinal()
		.domain(fuel_types)
		.range(fuel_types.map((_, i) => d3.interpolateCividis(i / fuel_types.length)));

	let filtered_data1 = driver_plot2_loadData_slider.filter(d => d.year===`${event.target.value}`);
	let filtered_data2 = driver_plot3_loadData_slider.filter(d => d.year===`${event.target.value}`);

	driver_bar_plot(
		filtered_data1,
		svg_plot7,
		"#plot7",
		color_function
	);

	driver_stacked_bar_plot(
		filtered_data2,
		svg_plot8,
		"#plot8",
		color_function
	);
};

d3.csv("Stucchi/prepared_datasets/plot2.csv", function (d) {
	return {
		fuel_type: d.fuel_type,
		year: d.year,
		total_type_of_fuel_consumption_value: +d.total_type_of_fuel_consumption_value,
	};
}).then(function (driver_plot2_data) {
    let min_year = d3.min(driver_plot2_data, function(d) { return +d.year; })
	let max_year = d3.max(driver_plot2_data, function(d) { return +d.year; })
    let text = d3
		.select("#slidecontainer7_8")
		.append("text")
		.style("font-size", "18px")
		.attr("id", "text_sliders7_8")
		.text(`Year: ${max_year}`);
	let slider = d3
		.select("#slidecontainer7_8")
		.append("input")
		.attr("type", "range")
		.attr("id", "range_plot7_8")
		.attr("min", `${min_year}`)
		.attr("max", `${max_year}`)
		.attr("value", `${max_year}`)
		.on("input", driver_plot2_3_loadData_slider_onchange)

	driver_plot2_loadData_slider = driver_plot2_data;
	 
	fuel_types = Array.from(new Set(driver_plot2_loadData_slider.map((d) => d.fuel_type))); 

	// Create a color scale that generates a unique color for each fuel type
	let color_function = d3.scaleOrdinal()
		.domain(fuel_types)
		.range(fuel_types.map((_, i) => d3.interpolateCividis(i / fuel_types.length)));

	let filtered_data = driver_plot2_loadData_slider.filter(d => d.year === `${max_year}`);
	driver_bar_plot(filtered_data, svg_plot7, "#plot7", color_function);
});



var driver_plot3_loadData_slider_onchange = function (event, d) {
	d3.select("#text_sliders8").text(`Year: ${event.target.value}`)
	let plot8 = document.getElementById('plot8');
	while (plot8.firstChild) {
		plot8.removeChild(plot8.lastChild);
	}
	const svg_plot8 = d3
	.select("#plot8")
	.append("svg")
	.attr("width", driver_width + driver_margin.left + driver_margin.right)
	.attr("height", driver_height + driver_margin.top + driver_margin.bottom)
	.append("g")
	.attr("transform", `translate(${driver_margin.left},${driver_margin.top})`);

	/* const fuel_types = Array.from(new Set(driver_plot3_loadData_slider.map((d) => d.fuel_type))); */

	// Create a color scale that generates a unique color for each fuel type
	let color_function = d3.scaleOrdinal()
		.domain(fuel_types)
		.range(fuel_types.map((_, i) => d3.interpolateCividis(i / fuel_types.length)));

	let filtered_data = driver_plot3_loadData_slider.filter(d => d.year===`${event.target.value}`);

	driver_stacked_bar_plot(filtered_data, svg_plot8, "#plot8", color_function);
};

d3.csv("Stucchi/prepared_datasets/plot3.csv", function (d) {
	return {
		country: d.country,
		year: d.year,
        fuel_type: d.fuel_type,
		consumption_value: +d.consumption_value,
        rank: d.Rank
	};
}).then(function (driver_plot3_data) {
    let min_year = d3.min(driver_plot3_data, function(d) { return +d.year; })
	let max_year = d3.max(driver_plot3_data, function(d) { return +d.year; })
    let text = d3
		.select("#slidecontainer8")
		.append("text")
		.style("font-size", "18px")
		.attr("id", "text_sliders8")
		.text(`Year: ${max_year}`);
	let slider = d3
		.select("#slidecontainer8")
		.append("input")
		.attr("type", "range")
		.attr("id", "range_plot8")
		.attr("min", `${min_year}`)
		.attr("max", `${max_year}`)
		.attr("value", `${max_year}`)
		.on("input", driver_plot3_loadData_slider_onchange)

	driver_plot3_loadData_slider = driver_plot3_data;

	/* const fuel_types = Array.from(new Set(driver_plot3_data.map((d) => d.fuel_type))); */

	// Create a color scale that generates a unique color for each fuel type
	const color_function = d3.scaleOrdinal()
		.domain(fuel_types)
		.range(fuel_types.map((_, i) => d3.interpolateCividis(i / fuel_types.length)));

	let filtered_data = driver_plot3_loadData_slider.filter(d => d.year === `${max_year}`);

	driver_stacked_bar_plot(filtered_data, svg_plot8, "#plot8", color_function);
});

d3.csv("Stucchi/prepared_datasets/plot4.csv").then(function(data) {
    // Group data by waste_operation
    const groupedData = d3.group(data, d => d.waste_operation);

    // Transform the grouped data into the desired format
    const formattedData = Array.from(groupedData, ([waste_operation, entries]) => ({
        waste_operation: waste_operation,
        waste_disposed: entries.map(entry => ({
            year: +entry.year, 
            value: +entry.waste_disposed_in_million_tonnes
        }))
    }));

    // Pass the formatted data to your plot function
    driver_multiline_plot1(formattedData, svg_plot9, "#plot9");
});

d3.csv("Stucchi/prepared_datasets/plot5.csv").then(function(data) { 
	radio(data, "radio10_list", "svg10", svg_plot10);

	let filtered_data = data.filter(d => d.vehicle === clicked_vehicle);
    const groupedData = d3.group(filtered_data, d => d.country);

    // Transform the grouped data into the desired format
    const formattedData = Array.from(groupedData, ([country, entries]) => ({
        country: country,
        zero_emission_vehicles_percentage: entries.map(entry => ({
            year: +entry.year, 
            value: +entry.zero_emission_vehicles_percentage 
        }))
    }));
    driver_multiline_plot2(formattedData, svg_plot10, "#plot10");
});