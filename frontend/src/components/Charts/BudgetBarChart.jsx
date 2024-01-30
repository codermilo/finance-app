import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const BudgetBarChart = ({ totalIncome, totalExpense, remainingBalance }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    const parentWidth = chartRef.current.clientWidth;
    const width = 300;
    const height = 8;

    // Clear existing content
    d3.select(chartRef.current).html("");

    const svg = d3
      .select(chartRef.current)
      .append("svg")
      .attr("width", "100%")
      .attr("height", height);

    const scale = d3
      .scaleLinear()
      .domain([0, totalIncome])
      .range([0, parentWidth]);

    // Draw total income bar with animation
    svg
      .append("rect")
      .attr("width", 0)
      .attr("height", height)
      .attr("fill", "#91908d") // Grey color
      .transition()
      .duration(1000) // Animation duration in milliseconds
      .attr("width", scale(totalIncome));

    // Draw total expense bar with animation
    svg
      .append("rect")
      .attr("width", 0)
      .attr("height", height)
      .attr("fill", "#F44336") // Red color
      .transition()
      .duration(1000) // Animation duration in milliseconds
      .attr("width", scale(totalExpense));

    // Draw remaining balance bar with animation
    svg
      .append("rect")
      .attr("width", 0)
      .attr("height", height)
      .attr("fill", "#e63c3a") // Orange color
      .transition()
      .duration(1000) // Animation duration in milliseconds
      .attr("width", scale(remainingBalance));
  }, [totalIncome, totalExpense, remainingBalance]);

  return <div className="balance_chart" ref={chartRef}></div>;
};

export default BudgetBarChart;
