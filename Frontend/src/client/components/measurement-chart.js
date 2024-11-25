import React from "react";
import { Line } from "react-chartjs-2";  // Chart.js component for line chart
import { Chart } from "chart.js"; // Import Chart.js directly
import { CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// No need to register components in Chart.js 2.x (works out of the box)

const MeasurementChart = ({ chartData }) => {
    if (!chartData || chartData.labels.length === 0) {
        return <p>No measurements available</p>;
    }

    const data = {
        labels: chartData.labels,  // Use labels from chartData
        datasets: [
            {
                label: "Measurement Values",
                data: chartData.data,  // Use data from chartData
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
            <h3>Measurement Chart</h3>
            <Line data={data} options={options} />
        </div>
    );
};

export default MeasurementChart;
