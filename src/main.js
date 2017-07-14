require('./main.scss');
import data from './data.json';

var value = function(d) { return 1; };

var width = 960,
    height = 700,
    radius = Math.min(width, height) / 2,
    color = d3.scale.ordinal()
      .range(["#E1FB07", "#E1FB07", "#A8B916" , "#6F7726",    "#FF32A8", "#BC3382", "#79345C", "#363636"]);


var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var partition = d3.layout.partition()
    .sort(null)
    .size([2 * Math.PI, radius * radius])
    .value(function(d) { return 1; });

var arc = d3.svg.arc()
    .startAngle(function(d) { return d.x; })
    .endAngle(function(d) { return d.x + d.dx; })
    .innerRadius(function(d) { return Math.sqrt(d.y); })
    .outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });

  var path = svg.datum(data).selectAll("path")
      .data(partition.value(value).nodes)
      .enter().append("g")
        
  var allPaths = path.append("path")
      .attr("display", function(d) { return d.depth ? null : null; }) // hide inner ring
      .attr("d", arc)
      .style("stroke", "#333")
      .style("fill", function(d) { return color((d.children ? d : d.parent).name); })
      .style("fill-rule", "evenodd")
      .each(stash);

  var allText = path.append("text")
        .text(function(d) {return shortName(d.name)})
        .classed("label", true)
        .attr("x", function(d) { return d.x; })
        .attr("text-anchor", "middle")
        // translate to the desired point and set the rotation
        .attr("transform", function(d) {
            if (d.depth > 0) {
                return "translate(" + arc.centroid(d) + ")" +
                       "rotate(" + getAngle(d) + ")";
            }  else {
                return null;
            }
        })
        .attr("dx", "6") // margin
        .attr("dy", ".35em") // vertical-align
        .attr("pointer-events", "none");

//});

function getAngle(d) {
    // Offset the angle by 90 deg since the '0' degree axis for arc is Y axis, while
    // for text it is the X axis.
    var thetaDeg = (180 / Math.PI * (arc.startAngle()(d) + arc.endAngle()(d)) / 2 - 90);
    // If we are rotating the text by more than 90 deg, then "flip" it.
    // This is why "text-anchor", "middle" is important, otherwise, this "flip" would
    // a little harder.
    return (thetaDeg > 90) ? thetaDeg - 180 : thetaDeg;
}

function shortName(name) {
  var short = name;
  var nameArray = name.split(' ');
  if (nameArray.length >= 2) {
    short = nameArray[0][0] + nameArray[1][0];
  }
  return short;
}

// Stash the old values for transition.
function stash(d) {
  d.x0 = d.x;
  d.dx0 = d.dx;
}

// Interpolate the arcs in data space.
function arcTween(a) {
  var i = d3.interpolate({x: a.x0, dx: a.dx0}, a);
  return function(t) {
    var b = i(t);
    a.x0 = b.x;
    a.dx0 = b.dx;
    return arc(b);
  };
}

d3.select(self.frameElement).style("height", height + "px");

// Change View!
d3.selectAll("input").on("change", function change() {
  var value = this.value === "count"
      ? function() { return 1; }
      : function(d) { return d.size; };

      console.log(allPaths);

  allPaths
      .data(partition.value(value).nodes)
    .transition()
      .duration(1000)
      .attrTween("d", arcTween);

  if (this.value !== "count") {
    console.log('text av');

    allText
      .transition()
        .duration(300)
        .style('opacity', '0')
        .style("font-size","1px");


      // .attr('visibility' , 'hidden');
  } else {
      allText
        .transition()
          .delay(800)
          .duration(300)
          .style('opacity', '1')
          .style("font-size","14px");
  }

});