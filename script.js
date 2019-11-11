const update = () => {
  d3.csv(
    "https://cdn.glitch.com/f8765653-1d6c-4bc6-be0e-646c5a8fad65%2FAB_NYC_2019.csv?v=1570812688466"
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
    "https://cdn.glitch.com/f8765653-1d6c-4bc6-be0e-646c5a8fad65%2FWebp.net-resizeimage.jpg?v=1571367858704"
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
  console.log(roomtypes);
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

// try to progressively render the data
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


//violin plot

var sideplotWidth = 500;
var sideplotHeight = height / 2;
var sideplotMargin = 50;

d3.select('#container')
  .append('div')
  .attr("id", "sideplot")
  .attr("width", 500)
  .attr("height", height);

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
  .attr("y", sideplotMargin)
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

d3.csv(
  "https://cdn.glitch.com/f8765653-1d6c-4bc6-be0e-646c5a8fad65%2FAB_NYC_2019.csv?v=1570812688466"
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

d3.csv(
  "https://cdn.glitch.com/f8765653-1d6c-4bc6-be0e-646c5a8fad65%2FAB_NYC_2019.csv?v=1570812688466"
).then(function (data) {
  //restructure the data
  var newdata = groups.map(ng => {
    var shortTermNum = data.filter(e => e.neighbourhood_group === ng && e.minimum_nights <= 7).length;
    var longTermNum = data.filter(e => e.neighbourhood_group === ng && e.minimum_nights > 7).length;
    return { neighbourhood_group: ng, short_term: shortTermNum, long_term: longTermNum };
  })
  console.log(newdata);
  var maxheight = d3.max(newdata, function (d) { return Math.max(d.short_term, d.long_term) })
  console.log(maxheight);

  var yb = d3.scaleLinear()
    .domain([0, maxheight+1000])
    .range([sideplotHeight - sideplotMargin, sideplotMargin]);

  termbar.append('g')
    .attr("class", "axis")
    .attr("transform", "translate(" + sideplotMargin + ",0)")
    .call(d3.axisLeft(yb));

  // subgroup position
  var xSubgroup = d3.scaleBand()
                    .domain(subgroups)
                    .range([0, xb.bandwidth()])
                    .padding([0.05])
  
  var subcolor = d3.scaleOrdinal()
                    .domain(subgroups)
                    .range(['green', '#69badb'])
  
  termbar.append('g')
          .selectAll('g')
          .data(newdata)
          .enter()
          .append('g')
          .attr('transform', function(d) {return "translate(" + xb(d.neighbourhood_group) + ",0)";})
          .selectAll('rect')
          .data(function(d) {return subgroups.map(function(key){return {key:key, value:d[key]};});})
          .enter().append('rect')
                  .attr('x', d => xSubgroup(d.key))
                  .attr('y', d => yb(d.value))
                  .attr('width', xSubgroup.bandwidth())
                  .attr('height', d => sideplotHeight-sideplotMargin- yb(d.value))
                  .attr('fill', d => subcolor(d.key));                    
})
