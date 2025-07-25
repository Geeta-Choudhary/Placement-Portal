/* eslint-disable react/prop-types */
import { useEffect, useRef } from "react";
import * as echarts from "echarts";

function PieChart({ data }) {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const myChart = echarts.init(chartRef.current);

    const option = {
      tooltip: {
        trigger: "item",
      },
      legend: {
        top: "5%",
        left: "center",
      },
      series: [
        {
          name: "Activity Type",
          type: "pie",
          radius: ["40%", "70%"],
          center: ["50%", "70%"],
          startAngle: 180,
          endAngle: 360,
          label: {
            show: true,
            formatter: "{b}: {c}",
          },
          data: data,
        },
      ],
    };

    myChart.setOption(option);

    // Handle Resize
    const handleResize = () => myChart.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      myChart.dispose();
    };
  }, [data]);

  return <div ref={chartRef} className="w-full h-64"></div>;
}

export default PieChart;
