import { useEffect, useRef } from "react";
import * as echarts from "echarts";
/* eslint-disable react/prop-types */
const BarChart = ({ drives }) => {
  const chartRef = useRef(null);

  // Calculate dynamic height based on number of drives
  const barHeight = 40; // Height per bar (adjustable)
  const minHeight = 256; // Minimum height (equivalent to h-64)
  const dynamicHeight = Math.max(minHeight, drives.length * barHeight); // Ensure minimum height

  useEffect(() => {
    if (!chartRef.current || !drives || drives.length === 0) return;

    const myChart = echarts.init(chartRef.current);

    const driveNames = drives.map((drive) => drive.company || "Unknown Drive");
    const registrationCounts = drives.map((drive) => drive.registrations || drive.applications || 0);

    const option = {
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      xAxis: { type: "value", axisLabel: { formatter: "{value}" } },
      yAxis: {
        type: "category",
        data: driveNames,
        axisLabel: {
          interval: 0, // Show all labels
          rotate: 0,   // No rotation for horizontal readability
          margin: 10,  // Space between labels and bars
        },
      },
      series: [
        {
          name: "Registrations",
          type: "bar",
          barWidth: "50%",
          data: registrationCounts,
          itemStyle: { color: "#0073E6", borderRadius: [0, 2, 2, 0] },
          label: { show: true, position: "right", formatter: "{c}" },
        },
      ],
      grid: {
        left: "5%", // Increased left margin for long drive names
        right: "10%",
        top: "5%",  // Space for title
        bottom: "5%",
        containLabel: true, // Ensure labels fit within the grid
      },
    };

    myChart.setOption(option);

    // Resize chart to match dynamic height
    myChart.resize({ height: dynamicHeight });

    // Cleanup on unmount
    return () => myChart.dispose();
  }, [drives, dynamicHeight]);

  return <div ref={chartRef} className="w-full" style={{ height: `${dynamicHeight}px` }} />;
};
export default BarChart;