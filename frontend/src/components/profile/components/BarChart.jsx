/* eslint-disable react/prop-types */
import  { useEffect, useRef } from "react";
import * as echarts from "echarts";

const BarChart = ({data}) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const myChart = echarts.init(chartRef.current);

    const option = {
      xAxis: {
        type: "category",
        data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      },
      yAxis: {
        type: "value",
      },
      series: [
        {
          data: data,
          type: "bar",
          barWidth: "50%", // Adjust bar width
          itemStyle: {
            color: "#0073E6", // Set bar color
            borderRadius: [2, 2, 0, 0], // Rounded top corners
          },
        },
      ],
      tooltip: {
        trigger: "axis",
      },
    };

    myChart.setOption(option);

    // Cleanup on unmount
    return () => myChart.dispose();
  }, [data]);

  return <div ref={chartRef} className="w-full h-64" />;
};

export default BarChart;
