/* eslint-disable react/prop-types */
import { useEffect, useRef } from "react";
import * as echarts from "echarts";

// PieChart and LineChart (unchanged)
const PieChart = ({ data }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const myChart = echarts.init(chartRef.current);

    const option = {
      tooltip: { trigger: "item" },
      series: [
        {
          name: "Placement Status",
          type: "pie",
          radius: "79%",
          data: data,
          emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: "rgba(0, 0, 0, 0.5)" } },
        },
      ],
    };

    myChart.setOption(option);

    return () => myChart.dispose();
  }, [data]);

  return <div ref={chartRef} className="w-full h-80" />;
};
export default PieChart;