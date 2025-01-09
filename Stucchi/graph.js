const driver_margin = { top: 30, right: 30, bottom: 200, left: 150 },
driver_width = 600 - driver_margin.left - driver_margin.right,
driver_height = 600 - driver_margin.top - driver_margin.bottom;

const driver_margin_multiline_plot = { top: 30, right: 30, bottom: 100, left: 100 },
	driver_width_multiline_plot = 770 - driver_margin_multiline_plot.left - driver_margin_multiline_plot.right,
	driver_height_multiline_plot = 650 - driver_margin_multiline_plot.top - driver_margin_multiline_plot.bottom;

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
	.attr("width", driver_width_multiline_plot + driver_margin_multiline_plot.left + driver_margin_multiline_plot.right + 130)
	.attr("height", driver_height_multiline_plot + driver_margin_multiline_plot.top + driver_margin_multiline_plot.bottom)
	.append("g")
	.attr("transform", `translate(${driver_margin_multiline_plot.left},${driver_margin_multiline_plot.top})`);

const svg_plot10 = d3
	.select("#plot10")
	.append("svg")
	.attr("width", driver_width_multiline_plot + driver_margin_multiline_plot.left + driver_margin_multiline_plot.right + 130)
	.attr("height", driver_height_multiline_plot + driver_margin_multiline_plot.top + driver_margin_multiline_plot.bottom)
	.append("g")
	.attr("transform", `translate(${driver_margin_multiline_plot.left},${driver_margin_multiline_plot.top})`);

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

function add_axis_label(svg_plot, x, y, transform, text_anchor, label) {
    svg_plot
        .append("text")
        .attr("text-anchor", text_anchor)
        .attr("x", x)
        .attr("y", y)
        .attr("transform", transform)
        .text(label);
}

function driver_bar_plot(data, svg_plot, id_div) {
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
        -driver_margin.left + 15,
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
        .attr("fill", "#69b3a2")
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
		driver_height + driver_margin.bottom - 5,
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
		-driver_margin.left + 15,
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
        -driver_width_multiline_plot / 2,
		-driver_margin_multiline_plot.left + 15,
        "rotate(-90)",
        "middle",
        "Waste Disposed (Million Tonnes)"
    );


	const waste_operation_types = Array.from(new Set(data.map((d) => d.waste_operation)));

	// Create a color scale that generates a unique color for each fuel type
	const color_function = d3.scaleOrdinal()
		.domain(waste_operation_types)
		.range(waste_operation_types.map((_, i) => d3.interpolateRainbow(i / waste_operation_types.length)));

    // Draw the lines
    data.forEach(waste_operation => {
        svg_plot.append("path")
            .datum(waste_operation.waste_disposed) // Bind data
            .attr("fill", "none")
            .attr("stroke", "#d4d4d4")
            .attr("stroke-width", 3)
            .attr("class", "country-line")
            .attr("d", d3.line()
                .x(d => x(d.year))
                .y(d => y(d.value))
            )
            .on("mouseover", function (event) {
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
    });
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
        -driver_width_multiline_plot / 2,
		-driver_margin_multiline_plot.left + 15,
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
						.style("stroke", "#8BC34A")
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

let driver_plot2_loadData_slider = NaN;

var driver_plot2_loadData_slider_onchange = function (event, d) {
	d3.select("#text_sliders7").text(`Year: ${event.target.value}`)
	let plot7 = document.getElementById('plot7');
	while (plot7.firstChild) {
		plot7.removeChild(plot7.lastChild);
	}
	const svg_plot7 = d3
	.select("#plot7")
	.append("svg")
	.attr("width", driver_width + driver_margin.left + driver_margin.right)
	.attr("height", driver_height + driver_margin.top + driver_margin.bottom)
	.append("g")
	.attr("transform", `translate(${driver_margin.left},${driver_margin.top})`);

	let filtered_data = driver_plot2_loadData_slider.filter(d => d.year===`${event.target.value}`);
	let colorScheme = d3.schemeBlues[7];
	driver_bar_plot(
		filtered_data,
		svg_plot7,
		"#plot7"
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
		.select("#slidecontainer7")
		.append("text")
		.style("font-size", "18px")
		.attr("id", "text_sliders7")
		.text(`Year: ${max_year}`);
	let slider = d3
		.select("#slidecontainer7")
		.append("input")
		.attr("type", "range")
		.attr("id", "range_plot7")
		.attr("min", `${min_year}`)
		.attr("max", `${max_year}`)
		.attr("value", `${max_year}`)
		.on("input", driver_plot2_loadData_slider_onchange)

	driver_plot2_loadData_slider = driver_plot2_data;
	let filtered_data = driver_plot2_loadData_slider.filter(d => d.year === `${max_year}`);
	let colorScheme = d3.schemeBlues[7];
	driver_bar_plot(filtered_data, svg_plot7, "#plot7");
});

let driver_plot3_loadData_slider = NaN;

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

	let filtered_data = driver_plot3_loadData_slider.filter(d => d.year===`${event.target.value}`);

	const fuel_types = Array.from(new Set(driver_plot3_loadData_slider.map((d) => d.fuel_type)));

	// Create a color scale that generates a unique color for each fuel type
	const color_function = d3.scaleOrdinal()
		.domain(fuel_types)
		.range(fuel_types.map((_, i) => d3.interpolateRainbow(i / fuel_types.length)));

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

	const fuel_types = Array.from(new Set(driver_plot3_data.map((d) => d.fuel_type)));

	// Create a color scale that generates a unique color for each fuel type
	const color_function = d3.scaleOrdinal()
		.domain(fuel_types)
		.range(fuel_types.map((_, i) => d3.interpolateRainbow(i / fuel_types.length)));

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
    // Group data by waste_operation
	let filtered_data = data.filter(d => d.vehicle === `Passenger cars`);
    const groupedData = d3.group(filtered_data, d => d.country);

    // Transform the grouped data into the desired format
    const formattedData = Array.from(groupedData, ([country, entries]) => ({
        country: country,
        zero_emission_vehicles_percentage: entries.map(entry => ({
            year: +entry.year, 
            value: +entry.zero_emission_vehicles_percentage 
        }))
    }));
	
    // Pass the formatted data to your plot function
    driver_multiline_plot2(formattedData, svg_plot10, "#plot10");
});