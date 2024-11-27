import React from "react";
import { Line } from "react-chartjs-2";


const MeasurementChart = ({ chartData, deviceName }) => {
    if (!chartData || chartData.labels.length === 0) {
        return <center><h3>No measurements available</h3></center>;
    }

    const data = {
        labels: chartData.labels,
        datasets: [
            {
                label: `Measurement Values ${deviceName}`,
                data: chartData.data,
                borderColor: "rgb(75, 192, 192)",
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                tension: 0.3,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: true,
                position: "top",
            },
        },
    };

    return (
        <div className="chart-container">
            <center><h2>Measurement Chart</h2></center>
            <Line data={data} options={options} />
        </div>
    );
};

export default MeasurementChart;
