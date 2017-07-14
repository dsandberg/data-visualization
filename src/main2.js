require('./main.scss');
import data from './data.json';

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

          var x = d3.scale.linear()
    .range([0, 2 * Math.PI]);

var y = d3.scale.linear()
    .range([0, radius]);

var partition = d3.layout.partition()
    .sort(null)
    .size([2 * Math.PI, radius * radius])
    .value(function(d) { return 1; });

var arc = d3.svg.arc()
    .startAngle(function(d) { return d.x; })
    .endAngle(function(d) { return d.x + d.dx; })
    .innerRadius(function(d) { return Math.sqrt(d.y); })
    .outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });

  // var path = svg.datum(data).selectAll("path")
  //     .data(partition.nodes)
  //   .enter().append("path")
      // .attr("display", function(d) { return d.depth ? null : ''; }) // hide inner ring
      // .attr("d", arc)
      // .style("stroke", "#333")
      // .style("fill", function(d) { return color((d.children ? d : d.parent).name); })
      // .style("fill-rule", "evenodd")
      // .each(stash);

  var g = svg.datum(data).selectAll("g")
      .data(partition.nodes)
    .enter().append("g");

  var path = g.append("path")
   .attr("display", function(d) { return d.depth ? null : ''; }) // hide inner ring
    .attr("d", arc)
    .style("stroke", "#333")
    .style("fill", function(d) { return color((d.children ? d : d.parent).name); })
    .style("fill-rule", "evenodd")
    .each(stash);

  var text = g.append("text")
    .attr("transform", function(d) { return "rotate(" + computeTextRotation(d) + ")"; })
    .attr("x", function(d) { return y(d.y / 100000); })
    .attr("dx", "6") // margin
    .attr("dy", ".35em") // vertical-align
    .text(function(d) { return d.name; });

  d3.selectAll("input").on("change", function change() {
    var value = this.value === "count"
        ? function() { return 1; }
        : function(d) { return d.size; };

        console.log(path);
    path
        .data(partition.value(value).nodes)
      .transition()
        .duration(1500)
        .attrTween("d", arcTween);
  });

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

function computeTextRotation(d) {
  return (x(d.x + d.dx / 2) - Math.PI / 2) / Math.PI * 180;
}

d3.select(self.frameElement).style("height", height + "px");