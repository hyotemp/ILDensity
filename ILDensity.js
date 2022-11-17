var op = 1;
var cl = 0;

var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var projection = d3.geoAlbersUsa()
    .scale(5000)
    .translate([width * -0.3, height * 0.7]);

var path = d3.geoPath()
    .projection(projection);

var colorA = d3.scaleThreshold()
    .domain([1, 10, 50, 200, 500, 1000, 1500, 4000])
    .range(d3.schemeOrRd[9]);

var colorB = d3.scaleThreshold()
    .domain([1, 10, 50, 200, 500, 1000, 1500, 4000])
    .range(d3.schemeBlues[9]);

var x = d3.scaleSqrt()
    .domain([0, 4500])
    .rangeRound([440, 950]);

var g = svg.append("g")
    .attr("class", "key")
    .attr("transform", "translate(0,40)");

draw();

function draw() {

    if (cl == 0) {
        g.selectAll("rect")
            .data(colorA.range().map(function (d) {
                d = colorA.invertExtent(d);
                if (d[0] == null) d[0] = x.domain()[0];
                if (d[1] == null) d[1] = x.domain()[1];
                return d;
            }))
            .enter().append("rect")
            .attr("height", 8)
            .attr("x", function (d) {
                return x(d[0]);
            })
            .attr("width", function (d) {
                return x(d[1]) - x(d[0]);
            })
            .attr("fill", function (d) {
                return colorA(d[0]);
            });
    } else {
        g.selectAll("rect")
            .data(colorB.range().map(function (d) {

                d = colorB.invertExtent(d);

                if (d[0] == null) d[0] = x.domain()[0];
                if (d[1] == null) d[1] = x.domain()[1];
                return d;
            }))
            .enter().append("rect")
            .attr("height", 8)
            .attr("x", function (d) {
                return x(d[0]);
            })
            .attr("width", function (d) {
                return x(d[1]) - x(d[0]);
            })
            .attr("fill", function (d) {

                return colorB(d[0]);

            });
    }
    g.append("text")
        .attr("class", "caption")
        .attr("x", x.range()[0])
        .attr("y", -6)
        .attr("fill", "#000")
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text("Population per square mile");

    g.call(d3.axisBottom(x)
            .tickSize(13)
            .tickValues(colorA.domain()))
        .select(".domain")
        .remove();


    // geomap
    var Idlist = d3.map();
    d3.queue()
        .defer(d3.json, "us-10m.json")
        .defer(d3.csv, "ILDensityData.csv", function (d) {
            Idlist.set(d.id, +d.density);
        })
        .await(ready);

    function ready(error, us) {
        if (error) throw error;
        //console.log(allCounties);
        svg.append("g")
            .attr("class", "counties")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.counties).features)
            .enter().append("path")
            .style("fill", function (d) {
                //console.log(d)
                if (Idlist.get(d.id)) {
                    if (cl == 0)
                        return colorA(Idlist.get(d.id));
                    else
                        return colorB(Idlist.get(d.id));
                } else
                    "none"
            })
            .attr("stroke", "#000")
            .attr("stroke-opacity", function (d) {
                //console.log(d)
                if (Idlist.get(d.id))
                    return op
                else
                    return 0;
            })
            .attr('opacity', '0.70')
            .attr("d", path)
            .append("title")
            .text(function (d) {
                return "Population Density: " + Idlist.get(d.id);
            });


        //      console.log(us)
        svg.append("path")
            .datum(topojson.mesh(us, us.objects.states, function (a, b) {
                return a !== b;
            }))
            .attr("class", "states")
            .attr("d", path);

    }

}

function changeA() {
    d3.selectAll("rect").remove();
    d3.selectAll("path").remove();
    cl = 0;
    draw();
}

function changeB() {
    d3.selectAll("rect").remove();
    d3.selectAll("path").remove();
    cl = 1;
    draw();
}

function changeVis() {
    svg.selectAll("path").remove()

    if (op > 0) {
        op = 0;
        console.log(op)
    } else {
        op = 0.3;
        console.log(op)
    }
    draw();
}
