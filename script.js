const update = () => {
  d3.csv(
    "https://raw.githubusercontent.com/imyuanwen/nyc-airbnb/master/assets/AB_NYC_2019.csv"
  ).then(function (data) {
    var selecteddata = updateData(data);
    renderVis(selecteddata);
  });
}
update();

var height = 830;
var width = 1030;
var margin = 50;

var svg = d3
  .select("#container")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

svg
  .append("svg:image")
  .attr(
    "xlink:href",
    "https://github.com/imyuanwen/nyc-airbnb/blob/master/assets/nyc-resizeimage.jpg?raw=true"
  )
  .attr("width", width - 2 * margin)
  .attr("height", height - 2 * margin)
  .attr("x", margin)
  .attr("y", margin)
  .style("opacity", 0.4);

var minx = -74.245;
var maxx = -73.71;

var miny = 40.495;
var maxy = 40.915;

var x = d3
  .scaleLinear()
  .domain([minx, maxx])
  .range([margin, width - margin]);

var y = d3
  .scaleLinear()
  .domain([maxy, miny])
  .range([margin, height - margin]);


svg
  .append("g")
  .attr("class", "axis")
  .attr("transform", "translate(0," + (height - margin) + ")")
  .call(d3.axisBottom(x));

svg
  .append("text")
  .attr("class", "axis-label")
  .attr("y", height - 15)
  .attr("x", 0 + width / 2)
  .style("text-anchor", "middle")
  .text("Longitude");

svg
  .append("g")
  .attr("class", "axis")
  .attr("transform", "translate(" + margin + ",0)")
  .call(d3.axisLeft(y));

svg
  .append("text")
  .attr("transform", "rotate(90)")
  .attr("class", "axis-label")
  .attr("y", 0)
  .attr("x", 0 + height / 2)
  .style("text-anchor", "middle")
  .text("Latitude");

var ng_color = d3.scaleOrdinal(d3.schemeCategory10);

var colorScale = d3.scaleSequential(d3.interpolateTurbo).domain([0, 400]);
// gradient color legend
d3.select("#container")
  .append("svg")
  .attr("id", "legend-svg")
  .style("margin-left", -40);

var legend = d3
  .select("#legend-svg")
  .attr("width", 75)
  .attr("height", height)
  .append("g")
  .attr("transform", "translate(" + 0 + "," + margin + ")");

var linearGradient = legend.append("defs")
  .append("linearGradient")
  .attr("id", "gradient")
  .attr('x1', '0%') // bottom
  .attr('y1', '100%')
  .attr('x2', '0%') // to top
  .attr('y2', '0%')
  .attr('spreadMethod', 'pad');

linearGradient
  .selectAll("stop")
  .data(
    colorScale
      .ticks()
      .map((el, i, arr) => ({
        offset: `${(100 * i) / (arr.length - 1)}%`,
        color: colorScale(el)
      }))
  )
  .enter()
  .append("stop")
  .attr("offset", d => d.offset)
  .attr("stop-color", d => d.color);

legend
  .append("rect")
  .attr("x1", 0)
  .attr("y1", 0)
  .attr("width", 25)
  .attr("height", height - 2 * margin)
  .style("fill", "url(#gradient)");

// add the legend axis
var legendscale = d3.scaleLinear()
  .domain([0, 400])
  .range([height - margin, margin])

d3.select("#legend-svg").append("g")
  .attr("class", "axis")
  .attr("transform", "translate(" + 25 + ", 0)")
  .call(d3.axisRight(legendscale));

d3.select("#legend-svg")
  .append("text")
  .attr("transform", "rotate(90)")
  .attr("class", "axis-label")
  .attr("y", 0)
  .attr("x", 0 + height / 2)
  .style("text-anchor", "middle")
  .text("Price($)");

// add the silder to choose the price range the user want
// using https://refreshless.com/nouislider/
var slider = document.getElementById('slider');

noUiSlider.create(slider, {
  start: [0, 10000],
  tooltips: [true, true],
  connect: true,
  // it's a lonlinear distribution
  range: {
    'min': [0, 1],
    '25%': [70, 1],
    '50%': [100, 1],
    '75%:': [200, 100],
    'max': 10000
  },
  pips: {
    mode: 'range',
    density: 3
  },
});

// get the value of checked checkboxes
const getCheckedBoxes = (name) => {
  var checkboxes = document.getElementsByName(name);
  var boxesChecked = [];
  for (var i = 0; i < checkboxes.length; i++) {
    if (checkboxes[i].checked) {
      boxesChecked.push(checkboxes[i].value);
      //console.log(checkboxes[i].value);
    }
  }
  return boxesChecked;
}

function updateData(data) {
  // get the price range from slider
  var priceRange = slider.noUiSlider.get();
  var minPrice = Number(priceRange[0]);
  var maxPrice = Number(priceRange[1]);

  // get the room types checked
  var roomtypes = getCheckedBoxes("roomtypechoice");
  //console.log(roomtypes);
  if (roomtypes.length === 0) {
    alert("Please choose at least one room type.");
  };

  // get the neighbourhood group checked
  var nbhGroups = getCheckedBoxes("nbhchoice")
  if (nbhGroups.length === 0) {
    alert("Please choose at least one neighbourhood group.")
  };

  // filter the data according to user's choice
  var filterdata = data.filter(d => {
    return d.price >= minPrice && d.price <= maxPrice && roomtypes.includes(d.room_type) && nbhGroups.includes(d.neighbourhood_group);
  })
  //console.log(filterdata);
  d3.select('#roomnumber').text(filterdata.length);
  return filterdata;
}

function renderVis(data) {
  svg
    .selectAll("circle")
    .data(data, d => d["id"])
    .exit()
    .attr("r", 0)
    .remove();

  svg
    .selectAll("circle")
    .data(data, d => d["id"])
    .enter()
    .append("circle")
    .attr("cx", d => x(d["longitude"]))
    .attr("cy", d => y(d["latitude"]))
    .attr("r", 3)
    .attr("fill", d => colorScale(d["price"]))
    .style("opacity", 0.9);
}

// =================================================================================
//violin plot

var sideplotWidth = 500;
var sideplotHeight = height / 2;
var sideplotMargin = 50;

d3.select('#container')
  .append('div')
  .attr("id", "sideplot")

d3.select('#sideplot')
  .append('svg')
  .attr('id', 'violinPlot')
  .attr('width', sideplotWidth)
  .attr('height', sideplotHeight);

var violin = d3.select('#violinPlot');

var xv = d3.scaleBand()
  .range([sideplotMargin, sideplotWidth - sideplotMargin])
  .domain(["Brooklyn", "Manhattan", "Queens", "Staten Island", "Bronx"])
  .padding(0.05)

violin.append("g")
  .attr("class", "axis")
  .attr("transform", "translate(0," + (sideplotHeight - sideplotMargin) + ")")
  .call(d3.axisBottom(xv))

violin
  .append("text")
  .attr("class", "axis-label")
  .attr("y", 20)
  .attr("x", 0 + sideplotWidth / 2)
  .style("text-anchor", "middle")
  .text("Price distrubution");

var yv = d3.scaleLinear()
  .domain([0, 530])
  .range([sideplotHeight - sideplotMargin, sideplotMargin])

violin.append("g")
  .attr("class", "axis")
  .attr("transform", "translate(" + sideplotMargin + ",0)")
  .call(d3.axisLeft(yv))

violin.append("text")
  .attr("transform", "rotate(90)")
  .attr("class", "axis-label")
  .attr("y", 0)
  .attr("x", 0 + sideplotHeight / 2)
  .style("text-anchor", "middle")
  .style('font-size', '0.8em')
  .text("Price($)");

d3.csv(
  "https://raw.githubusercontent.com/imyuanwen/nyc-airbnb/master/assets/AB_NYC_2019.csv"
).then(function (data) {
  var histogram = d3.histogram()
    .domain(yv.domain())
    .thresholds(yv.ticks(20))
    .value(d => d)

  // filter the data according to user's choice
  var filterdata = data.filter(d => {
    return d.price > 0 && d.price < 500;
  })

  // Compute the binning for each group of the dataset
  var sumstat = d3.nest()
    .key(function (d) {
      return d.neighbourhood_group;
    })
    .rollup(function (d) {
      input = d.map(function (g) {
        return g.price;
      })
      bins = histogram(input)
      return (bins)
    })
    .entries(filterdata)

  // What is the biggest number of value in a bin? We need it cause this value will have a width of 100% of the bandwidth.
  var maxNum = 0
  for (i in sumstat) {
    allBins = sumstat[i].value
    lengths = allBins.map(function (a) {
      return a.length;
    })
    longuest = d3.max(lengths)
    if (longuest > maxNum) {
      maxNum = longuest
    }
  }

  // The maximum width of a violin must be x.bandwidth = the width dedicated to a group
  var xNum = d3.scaleLinear()
    .range([0, xv.bandwidth()])
    .domain([-maxNum, maxNum])

  // Add the shape to this svg!
  violin
    .selectAll("myViolin")
    .data(sumstat)
    .enter()
    .append("g")
    .attr("transform", function (d) {
      return ("translate(" + xv(d.key) + " ,0)")
    })
    .append("path")
    .datum(function (d) {
      return (d.value)
    })
    .style("stroke", "none")
    .style("fill", "#69badb")
    .attr("d", d3.area()
      .x0(function (d) {
        return (xNum(-d.length))
      })
      .x1(function (d) {
        return (xNum(d.length))
      })
      .y(function (d) {
        return (yv(d.x0))
      })
      .curve(d3.curveCatmullRom)
    )
});

// =======================================================================================================================================
// the long/short term bar chart
d3.select('#sideplot')
  .append('svg')
  .attr('id', 'termbarchart')
  .attr('width', sideplotWidth)
  .attr('height', sideplotHeight);

var termbar = d3.select('#termbarchart')

var subgroups = ["short_term", "long_term"];
var groups = ["Brooklyn", "Manhattan", "Queens", "Staten Island", "Bronx"];

var xb = d3.scaleBand()
  .domain(groups)
  .range([sideplotMargin, sideplotWidth - sideplotMargin])
  .padding([0.2]);

termbar.append('g')
  .attr("class", "axis")
  .attr("transform", "translate(0," + (sideplotHeight - sideplotMargin) + ")")
  .call(d3.axisBottom(xb));

// add the title and color labels
termbar
  .append("text")
  .attr("class", "axis-label")
  .attr("y", 20)
  .attr("x", 0 + sideplotWidth / 2)
  .style("text-anchor", "middle")
  .text("Number of short/long term rooms");

termbar
  .append('g')
  .attr('id', 'stermlabel')
  .append('circle')
  .attr("cy", 50)
  .attr("cx", 300)
  .attr('r', 8)
  .style('fill', '#81c784')

d3.select('#stermlabel')
  .append('text')
  .attr("y", 54)
  .attr("x", 310)
  .style('font-size', '0.8em')
  .text('Short term(min nights <= 7)');

termbar
  .append('g')
  .attr('id', 'ltermlabel')
  .append('circle')
  .attr("cy", 70)
  .attr("cx", 300)
  .attr('r', 8)
  .style('fill', '#69badb')

d3.select('#ltermlabel')
  .append('text')
  .attr("y", 74)
  .attr("x", 310)
  .style('font-size', '0.8em')
  .text('Long term(min nights > 7)');

var yb = d3.scaleLinear()
  .domain([0, 17630]) // 17630 is the max height caculated from the data below. I want to pre render the axis cause it's more natural.
  .range([sideplotHeight - sideplotMargin, sideplotMargin]);

termbar.append('g')
  .attr("class", "axis")
  .attr("transform", "translate(" + sideplotMargin + ",0)")
  .call(d3.axisLeft(yb));

termbar.append("text")
  .attr("transform", "rotate(90)")
  .attr("class", "axis-label")
  .attr("y", 0)
  .attr("x", 0 + sideplotHeight / 2)
  .style("text-anchor", "middle")
  .style('font-size', '0.8em')
  .text("Number of rooms");

// subgroup position
var xSubgroup = d3.scaleBand()
  .domain(subgroups)
  .range([0, xb.bandwidth()])
  .padding([0.05])

var subcolor = d3.scaleOrdinal()
  .domain(subgroups)
  .range(['#81c784', '#69badb'])


d3.csv(
  "https://raw.githubusercontent.com/imyuanwen/nyc-airbnb/master/assets/AB_NYC_2019.csv"
).then(function (data) {
  //restructure the data
  var newdata = groups.map(ng => {
    var shortTermNum = data.filter(e => e.neighbourhood_group === ng && e.minimum_nights <= 7).length;
    var longTermNum = data.filter(e => e.neighbourhood_group === ng && e.minimum_nights > 7).length;
    return { neighbourhood_group: ng, short_term: shortTermNum, long_term: longTermNum };
  })
  console.log(newdata);
  var maxheight = d3.max(newdata, function (d) { return Math.max(d.short_term, d.long_term) })
  // maxheight = 17630

  termbar.append('g')
    .selectAll('g')
    .data(newdata)
    .enter()
    .append('g')
    .attr('transform', function (d) { return "translate(" + xb(d.neighbourhood_group) + ",0)"; })
    .selectAll('rect')
    .data(function (d) { return subgroups.map(function (key) { return { key: key, value: d[key] }; }); })
    .enter().append('rect')
    .attr('x', d => xSubgroup(d.key))
    .attr('y', d => yb(d.value))
    .attr('width', xSubgroup.bandwidth())
    .attr('height', d => sideplotHeight - sideplotMargin - yb(d.value))
    .style('fill', d => subcolor(d.key))
    .append('text')
    .text(d => d.value)
    .attr('x', d => xSubgroup(d.key))
    .attr('y', d => yb(d.value));

  // add the text label

  termbar.append('g')
    .selectAll('g')
    .data(newdata)
    .enter()
    .append('g')
    .attr('transform', function (d) { return "translate(" + xb(d.neighbourhood_group) + ",0)"; })
    .selectAll("text")
    .data(function (d) { return subgroups.map(function (key) { return { key: key, value: d[key] }; }); })
    .enter().append("text")
    .attr("class", "barstext")
    .attr('x', d => xSubgroup(d.key))
    .attr('y', d => yb(d.value) - 5)
    .style('font-size', '0.8em')
    .text(function (d) { return d.value })

})

// ==================================================================================================
// Availability by neighborhoods.

var availabilityChartWidth = 1000;
var availabilityChartHeight = 5000;
var availabilityChartMargin = 40;

d3.select("#container")
  .append('div')
  .attr('id', 'chartbelow')

var availabilityChart = d3.select("#chartbelow")
  .append("svg")
  .attr('id', 'availabilityChart')
  .attr("width", availabilityChartWidth)
  .attr("height", availabilityChartHeight);

// Define a variety of scales, for color, x axis and y axis.
var xa = d3.scaleBand()
  .rangeRound([availabilityChartMargin, availabilityChartHeight - availabilityChartMargin]);

var ya = d3.scaleLinear()
  .range([availabilityChartMargin, availabilityChartWidth - availabilityChartMargin]);

var za = d3.scaleLinear()
  .range([availabilityChartMargin, availabilityChartWidth - availabilityChartMargin]);

var set = [];

var tooltip = d3.select('#chartbelow').append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);


function groupByNeighbourhood(data_set) {
  var grouped_data = data_set.reduce(function (r, a) {
    r[a.neighbourhood] = r[a.neighbourhood] || [];
    r[a.neighbourhood].push(parseInt(a.availability_365));
    return r;
  }, {});

  return grouped_data;
}

function count_neighbourhood(grouped_data) {
  var countData = [];
  for (var neighbourhood in grouped_data) {
    countData.push({ 'neighbourhood': neighbourhood, 'count': grouped_data[neighbourhood].length });
  }
  return countData;
}

function avg_neighbourhood(grouped_data) {
  var avgData = [];
  for (var neighbourhood in grouped_data) {
    avgData.push({ 'neighbourhood': neighbourhood, 'avg': avgAvailable(grouped_data, neighbourhood) });
  }
  return avgData;
}

function avgAvailable(grouped_data, neighbourhood) {
  var sum = grouped_data[neighbourhood].reduce(function (s, x) {
    return s + x;
  }, 0);
  return sum / grouped_data[neighbourhood].length;
}

function maxCount(grouped_data) {
  var count = 0;
  for (var neighbourhood in grouped_data) {
    count = Math.max(count, grouped_data[neighbourhood].length);
  }
  return count;
}

d3.csv(
  "https://raw.githubusercontent.com/imyuanwen/nyc-airbnb/master/assets/AB_NYC_2019.csv"
).then(function (data) {
  var grouped_data = groupByNeighbourhood(data);
  var countData = count_neighbourhood(grouped_data);
  var avgData = avg_neighbourhood(grouped_data);
  xa.domain(countData.map(function (d) { return d.neighbourhood; }));
  ya.domain([0, d3.max(countData, function (d) { return d.count; })]);
  za.domain([0, d3.max(avgData, function (d) { return d.avg; })]);
  set = grouped_data;

  // Add axes.  First the X axis and label.
  availabilityChart.append("g")
    .attr("class", "axis")
    .attr('id', 'count-axis')
    .attr("transform", "translate(110," + (availabilityChartHeight - availabilityChartMargin) + ")")
    .call(d3.axisBottom(ya))


  availabilityChart.append("text")
    .attr("class", "axis-label")
    .attr("y", 10)
    .attr("x", 100)
    .style("text-anchor", "middle")
    .text("average available days / year");

  // Now the Y axis and label.
  availabilityChart.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + 150 + ",0)")
    .call(d3.axisLeft(xa))
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", "-.55em");
  // .attr("transform", "rotate(-90)" );;

  availabilityChart.append("text")
    .attr("class", "axis-label")
    .attr("y", 5000)
    .attr("x", 100)
    .style("text-anchor", "middle")
    .text("Number of rooms");

  availabilityChart.append("g")
    .attr("class", "axis")
    .attr('id', 'avai-axis')
    .attr("transform", "translate(110,40)")
    .call(d3.axisTop(za));

  availabilityChart.selectAll("bar")
    .data(countData)
    .enter()
    .append("rect")
    .style("fill", "#69badb")
    .attr("x", function (d) { return ya(470); })
    .attr("height", xa.bandwidth() - 5)
    .attr("y", function (d) { return xa(d.neighbourhood); })
    .attr("width", function (d) { return ya(d.count); })
    .on("mouseover", function (d) {
      tooltip.transition()
        .duration(200)
        .style("opacity", .9);

      tooltip.html("<h2>Neighbourhood:"
        + d.neighbourhood
        + "</h2><h2>Number of rooms:"
        + d.count + "</h2>")
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
    })
    .on("mouseout", function () {
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    });

  availabilityChart.selectAll("bar")
    .data(avgData)
    .enter()
    .append("rect")
    .style("fill", "orange")
    .attr("x", function (d) {
      // console.log(d.neighbourhood + ' avg:' +d.avg);
      return 110 + za(d.avg);
    })
    .attr("height", xa.bandwidth() - 5)
    .attr("y", function (d) { return xa(d.neighbourhood); })
    .attr("width", function (d) { return 5; })
    .on("mouseover", function (d) {
      tooltip.transition()
        .duration(200)
        .style("opacity", .9);

      tooltip.html("<h2>Neighbourhood:"
        + d.neighbourhood
        + "</h2><h2>Average available days / year:"
        + d.avg.toFixed(2) + "</h2>")
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
    })
    .on("mouseout", function () {
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    })
})