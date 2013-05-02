$(document).ready(function() {
    var w = 500;
    var padding = 20;
    var h = 500;

// Define an SVG with width and height, and place it in the body
var svgContainer = d3.select("svg.energy_sources")

// Defines the the polygon for the graph
// based on the input data
function graphGen (data, scales) {
    var length = data.length;
    // Defines the main polygon
    var polygonLine = d3.svg.line()
    .x(function(d, i) {
        var theta = 2*Math.PI*i/length;
        var scale = scales[i];
        console.log(i);
        console.log(d);
        console.log(w/2+scale(d)*Math.cos(theta));
        return w/2+scale(d)*Math.cos(theta);
    })
    .y(function(d, i) {
        var theta = 2*Math.PI*i/length;
        var scale = scales[i];
        return w/2+scale(d)*Math.sin(theta);
    })
    .interpolate("linear");
    return polygonLine(data);
}

// Returns an array of axes, one for each row
function test (sender) {
    // alert("clicked");

    sender.transition()
    .style("opacity", 0.1);
}

var polygon;

// Data is bound to the line from the CSV, added to the SVG as a path, and styled
// Everything has to happen here because CSV is asynchronous
// Nothing after this call will have access to any variables assigned here
d3.csv("/static/TestData.csv", function(data) {
    var dataArray = [];
    var subArray = [];
    for (var i = 0; i < data.length; i++) {
        var entry = data[i];
        subArray = [];
        var j = 0;
        for (var key in entry) {
            if (j>5) {
                subArray.push(entry[key]);
            }
            j++;
        }
        dataArray.push(subArray);
    }
//FIRST DO SCALES
    // First set up the empty array
    var sortedData = [];
    for (var j = 0; j < subArray.length; j++) {
        sortedData.push([]);
    }

    // Transposing the data
    for (var i = 0; i < dataArray.length; i++) {
        for (var j = 0; j < dataArray[i].length; j++) {
            sortedData[j][i] = parseFloat(dataArray[i][j]);
        }
    }
    console.log(sortedData);

    // Then create the scales and append the axes
    // A scale for each row finding the max in the row
    var scales = [];
    for (var i = 0; i < sortedData.length; i++) {
        // var axisScale = d3.scale.linear()
        // .domain([0, d3.max(sortedData[i])])
        // .range([0, w/2]);
        var axisScale = d3.scale.log()
        .domain([d3.min(sortedData[i]), d3.max(sortedData[i])])
        .range([0, w/2-padding]);
        scales.push(axisScale);
    }
    
//THEN DO POLYGON
    // This array stores all the polygons for later use
    var polygons = [];
    // Make a polygon for each row
    for (var i = 0; i < dataArray.length; i++) {
        polygon = svgContainer.append("path")
        .attr("d", graphGen(dataArray[i], scales) + "Z")
        .classed("polygon", true)
        .attr("fill-opacity", 0.5)
        .attr("index", i);

        polygon.on("click", function() {
            d3.select(this).transition()
            .style("fill", "blue");
        });

        polygons.push(polygon);
    }
// THEN DO AXES
    // generate them
    // append them
    var subArray = dataArray[0];
    var axisLength = w/2+10
    for (var j = 0; j < subArray.length; j++) {
        var theta = 2*Math.PI*j/subArray.length;
        var endPointx = w/2+axisLength*Math.cos(theta);
        var endPointy = w/2+axisLength*Math.sin(theta);

        svgContainer.append("line")
        .attr("x1", w/2)
        .attr("y1", w/2)
        .attr("x2", endPointx)
        .attr("y2", endPointy)
        .style("stroke", "black");
    }

// THEN MAKE BUTTONS
for (var i = 0; i < subArray.length; i++) {
    svgContainer.append("circle")
    .attr("cx", function(d) {
        return (i+1)*60;
    })
    .attr("cy", function(d) {
        return w-40;
    })
    .attr("fill-opacity", 0.5)
    .attr("class", "button")
    .attr("r", 20)
    .attr("index", i)
    .on("click", function() {
        var index = d3.select(this).attr("index");
        var gon = d3.select(".polygon:nth-child("+index+")");

        // I'd like this to work but it's not
        // And the current way works
        // var gon = d3.selectAll('[index='+ index + ']');

        // Hide/show the corresponding polygon
        gon.transition()
        .style("opacity", function() {
            var innergon = d3.select(".polygon:nth-child("+index+")");
            return innergon.style("opacity") == 0 ? 1 : 0;
        });

        d3.select(this).transition()
        .attr("fill-opacity", function() {
            return d3.select(this).attr("fill-opacity") == 0 ? 0.5  : 0;
        });
    });
}

});
//end d3 CSV call

});
