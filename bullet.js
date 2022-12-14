(function() {

// Chart design based on the recommendations of Stephen Few. Implementation
// based on the work of Clint Ivy, Jamie Love, and Jason Davies.
// http://projects.instantcognition.com/protovis/bulletchart/
d3.bullet = function() {
  var orient = "left", // TODO top & bottom
      reverse = false,
      duration = 0,
      initial = bulletInitial,
      current = bulletCurrent,
      goal = bulletGoal,
      width = 380,
      height = 30,
      tickFormat = d3.format(",.1f");

  // For each small multiple…
  function bullet(g) {
    g.each(function(d, i) {
      var initials = initial.call(this, d, i),
          currents = current.call(this, d, i),
          goals = goal.call(this, d, i),
          g = d3.select(this);

      // Compute the new x-scale.
      var x1 = d3.scaleLinear()
          .domain([0, 10])
          .range(reverse ? [width, 0] : [0, width]);

      // Retrieve the old x-scale, if this is an update.
      var x0 = this.__chart__ || d3.scaleLinear()
          .domain([0, Infinity])
          .range(x1.range());

      // Stash the new scale.
      this.__chart__ = x1;

      // Derive width-scales from the x-scales.
      var w0 = bulletWidth(x0),
          w1 = bulletWidth(x1);

      // Update the initial rects.
      var initial1 = g.selectAll("rect.init")
          .data([initials]);

      initial1.enter().append("rect")
          .attr("class", function(d, i) { return "initial1 s" + i; })
          .attr("width", w0)
          .attr("height", height)
          .attr("x", reverse ? x0 : 0)
        .transition()
          .duration(duration)
          .attr("width", w1)
          .attr("x", reverse ? x1 : 0);


      // Update the current rects.
      var current1 = g.selectAll("rect.cur")
          .data([currents]);

      current1.enter().append("rect")
          .attr("class", function(d, i) { return "current1 s" + i; })
          .attr("width", w0)
          .attr("height", height / 3)
          .attr("x", reverse ? x0 : 0)
          .attr("y", height / 3)
        .transition()
          .duration(duration)
          .attr("width", w1)
          .attr("x", reverse ? x1 : 0);


      // Update the goal lines.
      var goal1 = g.selectAll("line.goal1")
          .data([goals]);

      goal1.enter().append("line")
          .attr("class", "goal")
          .attr("x1", x0)
          .attr("x2", x0)
          .attr("y1", height / 6)
          .attr("y2", height * 5 / 6)
        .transition()
          .duration(duration)
          .attr("x1", x1)
          .attr("x2", x1);

      // Compute the tick format.
      var format = tickFormat || x1.tickFormat(8);

      // Update the tick groups.
      var tick = g.selectAll("g.tick")
          .data(x1.ticks(8), function(d) {
            return this.textContent || format(d);
          });

      // Initialize the ticks with the old scale, x0.
      var tickEnter = tick.enter().append("g")
          .attr("class", "tick")
          .attr("transform", bulletTranslate(x0))
          .style("opacity", 1e-6);

      tickEnter.append("line")
          .attr("y1", height)
          .attr("y2", height * 7 / 6);

      tickEnter.append("text")
          .attr("text-anchor", "middle")
          .attr("dy", "1em")
          .attr("y", height * 7 / 6)
          .text(format);

      // Transition the entering ticks to the new scale, x1.
      tickEnter.transition()
          .duration(duration)
          .attr("transform", bulletTranslate(x1))
          .style("opacity", 1);

    });
    
  }

  // left, right, top, bottom
  bullet.orient = function(x) {
    if (!arguments.length) return orient;
    orient = x;
    reverse = orient == "right" || orient == "bottom";
    return bullet;
  };

  // initial (bad, satisfactory, good)
  bullet.initial = function(x) {
    if (!arguments.length) return initial;
    initial = x;
    return bullet;
  };

  // goal (previous, goal)
  bullet.goal = function(x) {
    if (!arguments.length) return goal;
    goal = x;
    return bullet;
  };

  // current (actual, forecast)
  bullet.current = function(x) {
    if (!arguments.length) return current;
    current = x;
    return bullet;
  };

  bullet.width = function(x) {
    if (!arguments.length) return width;
    width = x;
    return bullet;
  };

  bullet.height = function(x) {
    if (!arguments.length) return height;
    height = x;
    return bullet;
  };

  bullet.tickFormat = function(x) {
    if (!arguments.length) return tickFormat;
    tickFormat = x;
    return bullet;
  };

  bullet.duration = function(x) {
    if (!arguments.length) return duration;
    duration = x;
    return bullet;
  };

  return bullet;
};

function bulletInitial(d) {
  return d.Initial;
}

function bulletCurrent(d) {
  return d.Current;
}

function bulletGoal(d) {
  return d.Goal;
}

function bulletTranslate(x) {
  return function(d) {
    return "translate(" + x(d) + ",0)";
  };
}

function bulletWidth(x) {
  var x0 = x(0);
  return function(d) {
    return Math.abs(x(d) - x0);
  };
}

})();