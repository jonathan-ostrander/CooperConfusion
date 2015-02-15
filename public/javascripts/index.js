var socket = io();

socket.on('confusion', function(json){
  json.time = (new Date() - t) / 1000;
  data.push(json);
  updateSeat(json);
});

var data = [];
var classWidth = 1000;
var classHeight = 500;
var padding = 10;
var rose = [10, 14, 15, 16, 17, 18, 18, 5, 17, 16, 13, 13, 13, 14];
var color = d3.scale.linear().domain([0, 2.5, 5]).range(['green', 'yellow', 'red']);
var t = new Date();

var Grid = function (rows, cols) {
  this.rectWidth = (classWidth - cols*2*padding)/cols;
  this.rectHeight = (classHeight - rows*2*padding)/rows;
  this.padRow = function (n) {
    return ( classWidth - n*(this.rectWidth+padding*2) )/2;
  }
}

window.onload = function () {
  var classroom = initClass(rose);
}

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