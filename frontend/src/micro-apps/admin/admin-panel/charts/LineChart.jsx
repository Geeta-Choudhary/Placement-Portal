/* eslint-disable react/prop-types */
import { useEffect, useRef } from "react";
import * as echarts from "echarts";

const LineChart = ({ data, labels }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const myChart = echarts.init(chartRef.current);

    const option = {
      xAxis: { type: "category", data: labels },
      yAxis: { type: "value" },
      series: [{ data: data, type: "line", smooth: true, lineStyle: { color: "#34D399" }, itemStyle: { color: "#34D399" } }],
      tooltip: { trigger: "axis" },
    };

    myChart.setOption(option);

    return () => myChart.dispose();
  }, [data, labels]);

  return <div ref={chartRef} className="w-full h-64" />;
};
export default LineChart;