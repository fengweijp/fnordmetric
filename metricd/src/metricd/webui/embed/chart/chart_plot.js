/**
 * This file is part of the "FnordMetric" project
 *   Copyright (c) 2016 Laura Schlimmer, FnordCorp B.V.
 *
 * FnordMetric is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License v3.0. You should have received a
 * copy of the GNU General Public License along with this program. If not, see
 * <http://www.gnu.org/licenses/>.
 */

/**
 * Renders a chart and optionally a summary for the provided series
 *
 * @param elem   {HTMLElement} an HTML elem within the chart will be rendered
 * @param params {object}      the chart's configuration
 */
FnordMetricChart.Plotter = function(elem, params) {
  'use strict';

  var width = 1240; // FIXME
  var height = 180;
  var canvas_margin_top = 10;
  var canvas_margin_right = 1;
  var canvas_margin_bottom = 1;
  var canvas_margin_left = 1;
  var x_domain = new FnordMetricChart.PlotterLinearDomain;
  var x_ticks_count = 12;
  var y_domain = new FnordMetricChart.PlotterLinearDomain; //FIXME allow multiple y_domains
  var y_ticks_count = 5;
  var y_label_width = 50; // FIXME

  this.render = function(result) {
    /* set up domains */
    result.series.forEach(function(s) {
      y_domain.findMinMax(s.values);
      x_domain.findMinMax(s.time);
    });

    /* set up layout */
    fitLayout();

    /* draw the svg */
    var svg = drawChart(result);
    elem.innerHTML = svg;
  }

  function fitLayout() {
    /* fit the y axis */
    if (params.axis_y_position == "inside") {

    } else {
      canvas_margin_left = y_label_width;
    }

    /* fit the x axis */
    canvas_margin_bottom += 16; // FIXME
  }

  function drawChart(result) {
    var svg = new FnordMetricChart.SVGHelper();
    svg.svg += "<svg class='fm-chart' viewBox='0 0 " + width + " " + height + "' >";

    drawBorders(svg);
    drawXAxis(svg);
    drawYAxis(result, svg);

    result.series.forEach(function(s) {
      drawLine(s, svg);

      if (params.points) {
        drawPoints(s, svg);
      }
    });

    svg.svg += "</svg>"
    return svg.svg;
  }

  function drawBorders(c) {
    /** render top border **/
    if (params.border_top) {
      c.drawLine(
          canvas_margin_left,
          width - canvas_margin_right,
          canvas_margin_top,
          canvas_margin_top,
          "border");
    }

    /** render right border  **/
    if (params.border_right) {
      c.drawLine(
          width - canvas_margin_right,
          width - canvas_margin_right,
          canvas_margin_top,
          height - canvas_margin_bottom,
          "border");
    }

    /** render bottom border  **/
    if (params.border_bottom) {
      c.drawLine(
          canvas_margin_left,
          width - canvas_margin_right,
          height - canvas_margin_bottom,
          height - canvas_margin_bottom,
          "border");
    }

    /** render left border **/
    if (params.border_left) {
      c.drawLine(
          canvas_margin_left,
          canvas_margin_left,
          canvas_margin_top,
          height - canvas_margin_bottom,
          "border");
    }
  }

  function drawXAxis(c) {
    c.svg += "<g class='axis x'>";

    /** render tick/grid **/
    var text_padding = 5;
    for (var i = 1; i < x_ticks_count; i++) {
      var tick_x_domain = (i / x_ticks_count);
      var tick_x_screen = tick_x_domain * (width - (canvas_margin_left + canvas_margin_right)) + canvas_margin_left;

      c.drawLine(
          tick_x_screen,
          tick_x_screen,
          canvas_margin_top,
          height - canvas_margin_bottom,
          "grid");

      c.drawText(
          tick_x_screen,
          (height - canvas_margin_bottom) + text_padding,
          "2017-01-01");
    }

    c.svg += "</g>";
  }

   function drawYAxis(result, c) {
    c.svg += "<g class='axis y'>";

    /** build tick labels **/
    var tick_values = []
    for (var i = 0; i <= y_ticks_count ; i++) {
      tick_values.push(y_domain.convertScreenToDomain(1.0 - (i / y_ticks_count)));
    }

    var unit = result.unit;
    var tick_labels = FnordMetricUnits.formatValues(unit, tick_values);

    /** render tick/grid **/
    for (var i = 0; i <= y_ticks_count ; i++) {
      var tick_y_domain = (i / y_ticks_count);
      var tick_y_screen = tick_y_domain * (height - (canvas_margin_bottom + canvas_margin_top)) + canvas_margin_top;

      c.drawLine(
          canvas_margin_left,
          width - canvas_margin_right,
          tick_y_screen,
          tick_y_screen,
          "grid");

      if (params.axis_y_position == "inside" && (i == y_ticks_count)) {
        /* skip text */
      } else if (params.axis_y_position == "inside") {
        var text_padding = 3;
        c.drawText(
            canvas_margin_left + text_padding,
            tick_y_screen,
            tick_labels[i],
            "inside");
      } else {
        var text_padding = 8;
        c.drawText(
            canvas_margin_left - text_padding,
            tick_y_screen,
            tick_labels[i],
            "outside");
      }
    }

    c.svg += "</g>";
   }

  function drawLine(series, c) {
    var points = [];

    for (var i = 0; i < series.values.length; i++) {
      var x = x_domain.convertDomainToScreen(series.time[i]);
      var y = y_domain.convertDomainToScreen(series.values[i]);

      var x_screen = x * (width - (canvas_margin_left + canvas_margin_right)) + canvas_margin_left;
      var y_screen = (1.0 - y) * (height - (canvas_margin_bottom + canvas_margin_top)) + canvas_margin_top;

      points.push([x_screen, y_screen]);
    }

    c.drawPath(points, "line");
  }

  function drawPoints(series, c) {
    var point_size = 3;

    for (var i = 0; i < series.values.length; i++) {
      var x = x_domain.convertDomainToScreen(series.time[i]);
      var y = y_domain.convertDomainToScreen(series.values[i]);

      var x_screen = x * (width - (canvas_margin_left + canvas_margin_right)) + canvas_margin_left;
      var y_screen = height - (y * (height - (canvas_margin_bottom + canvas_margin_top)) + canvas_margin_bottom);

      c.drawPoint(x_screen, y_screen, point_size, "point");
    }
  }

}

