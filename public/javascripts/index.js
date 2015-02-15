var socket = io();

socket.on('confusion', function(json){
  json.col -= 1;
  json.row -= 1;
  json.time = (new Date() - t) / 1000;
  data.push(json);
  updateSeat(json);
});

var data = [];
var graphData = [{time: 0, avg: 0}];
var classWidth = 600;
var classHeight = 300;
var margin = {top: 30, right: 20, bottom: 30, left: 50};
var graphWidth = 600 - margin.left - margin.right;
var graphHeight = 300 - margin.top - margin.bottom;
var padding = 5;
var rose = [10, 14, 15, 16, 17, 18, 18, 5, 17, 16, 13, 13, 13, 14];
var color = d3.scale.linear().domain([0,3.3,6.6,10]).range(['green','yellow', 'orange', 'red']);
var t = new Date();

var x = d3.scale.linear().range([0, graphWidth]);
var y = d3.scale.linear().range([graphHeight, 0]).domain([0,10]);
  
// Define the axes
var xAxis = d3.svg.axis().scale(x)
    .orient("bottom").ticks(5);

var yAxis = d3.svg.axis().scale(y)
    .orient("left").ticks(5);

// Define the line
var line = d3.svg.line()
    .x(function(d) { return x(d.time); })
    .y(function (d) {return y(d.avg); });

var Grid = function (rows, cols) {
  this.rectWidth = (classWidth - cols*2*padding)/cols;
  this.rectHeight = (classHeight - rows*2*padding)/rows;
  this.padRow = function (n) {
    return ( classWidth - n*(this.rectWidth+padding*2) )/2;
  }
}

window.onload = function () {
  var classroom = initClass(rose);
  var graph = d3.select("#graph")
    .append("svg")
        .attr("width", graphWidth + margin.left + margin.right)
        .attr("height", graphHeight + margin.top + margin.bottom)
    .append("g").attr('class','graph')
        .attr("transform", 
              "translate(" + margin.left + "," + margin.top + ")");
    // Add the valueline path.
    graph.append("path")
      .attr("class", "line")
      .attr("d", line(graphData));

    // Add the X Axis
    graph.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + graphHeight + ")")
      .call(xAxis);

    // Add the Y Axis
    graph.append("g")
      .attr("class", "y axis")
      .call(yAxis);
}

window.setInterval(function(){
  updateGraphData();
}, 2000);

// Init Classroom Grid
function initClass(shape) {
  // Create classroom svg container  
  var classroom = d3.select('#classroom')
    .append('svg')
    .attr('height', classHeight)
    .attr('width', classWidth);
  // Get the maximum number of seats the rows
  var maxCols = d3.max(shape);
  // Create grid object
  var grid = new Grid(shape.length, maxCols);
  // Loop through rows
  for (var i = 0; i < shape.length; i++) {
    // Get left padding for row with n columns   
    var xpad = grid.padRow(shape[i]);
    var xcur = xpad + padding;
    var yrow = i*(grid.rectHeight+padding*2)+padding;
    for (var j = 0; j < shape[i]; j++) {
      classroom.append('rect')
        .attr('data-row', i).attr('data-col', j)
        .attr('height', grid.rectHeight).attr('width', grid.rectWidth)
        .attr('x', xcur).attr('y', yrow)
        .attr('stroke', 'black').attr('stroke-width', 2).attr('fill', 'none');
      xcur += grid.rectWidth + 2*padding;
    }
  }
}

function updateSeat(json) {
  var row = json.row;
  var col = json.col;
  var rect = d3.select('[data-row="' + row + '"][data-col="' + col + '"]');
  // Fill rect with confusion color
  rect.attr('fill-opacity', 1).attr('fill', color(json.confusion));
  // Fade out to 0.3 opacity over 5 seconds
  rect.transition().duration(5000).ease('cubic').attr('fill-opacity', 0.3);
}

function updateGraphData() {
  var time = (new Date() - t) / 1000;
  var filt = data.filter(function (d) { return d.time >= time - 2});
  var q = [];
  for (var key in filt) {
    q.push(filt[key].confusion);
  }
  if (q.length == 0) {
    q = [0];
  }
  var avg = d3.mean(q);
  graphData.push({time: time, avg: avg});
  console.log(graphData);
  x.domain(d3.extent(graphData, function(d) { return d.time; }));
  var line = d3.svg.line()
    .x(function(d) { return x(d.time); })
    .y(function (d) {return y(d.avg); });
  
  var xAxis = d3.svg.axis().scale(x)
    .orient("bottom").ticks(5);

  var yAxis = d3.svg.axis().scale(y)
    .orient("left").ticks(5);
      // Select the section we want to apply our changes to
  var graphChange = d3.select('.graph').transition();
    
    
    // Make the changes
    graphChange.select(".line")   // change the line
      .duration(250)
      .attr("d", line(graphData));
    graphChange.select(".x.axis") // change the x axis
      .duration(250)
      .call(xAxis);
    graphChange.select(".y.axis") // change the y axis
      .duration(250)
      .call(yAxis);
}