const update = () => {
  d3.csv(
    "https://cdn.glitch.com/f8765653-1d6c-4bc6-be0e-646c5a8fad65%2FAB_NYC_2019.csv?v=1570812688466"
  ).then(function(data) {
    console.log(updateData(data));
    renderVis(updateData(data));
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
  .attr("y", height)
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
  .attr("id", "legend-svg");

var legend = d3
  .select("#legend-svg")
  .attr("width", 50)
  .attr("height", height)
  .append("g")
  .attr("transform", "translate(" +0 + "," + margin + ")");

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
                    .domain([0,400])
                    .range([height-margin,margin])

d3.select("#legend-svg").append("g")
      .attr("class", "axis")
      .attr("transform", "translate(" + 25 + ", 0)")
      .call(d3.axisRight(legendscale));

// add the silder to choose the price range the user want
// using https://refreshless.com/nouislider/
var slider = document.getElementById('slider');

noUiSlider.create(slider, {
    start: [0, 10000],
    tooltips: [true, true],
    connect:true,
    step: 100,
    range: {
        'min': 0,
        'max': 10000
    },
});

// get the value of checked checkboxes
const getCheckedBoxes = (name) => {
  var checkboxes = document.getElementsByName(name);
  var boxesChecked = [];
  for (var i=0; i<checkboxes.length; i++) {
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
  
  if (!roomtypes) { alert("Please choose at least one room type.")};

  // get the neighbourhood group checked
  var nbhGroups = getCheckedBoxes("nbhchoice")
  if (!nbhGroups) { alert("Please choose at least one neighbourhood group.")}
 
  // filter the data according to user's choice
  var filterdata = data.filter(d => {
    return d.price>= minPrice && d.price <= maxPrice && roomtypes.includes(d.room_type) && nbhGroups.includes(d.neighbourhood_group);
  })
  //console.log(filterdata);
  return filterdata;
}

function renderVis(data) {
  

  svg
    .selectAll("circle")
    .data(data, d => d["id"])
    .exit()
    .transition()
    .attr("r", 0)
    .remove();

  svg
    .selectAll("circle")
    .data(data, d => d["id"])
    .enter()
    .append("circle")
    .attr("cx", d => x(d["longitude"]))
    .attr("cy", d => y(d["latitude"]))
    .transition()
    .attr("r", 3)
    .attr("fill", d => colorScale(d["price"]))
    .style("opacity", 0.9);
}