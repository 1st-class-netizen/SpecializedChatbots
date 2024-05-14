import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface AmplitudeGraphProps {
  dataArray: Uint8Array;
}

const AmplitudeGraph: React.FC<AmplitudeGraphProps> = ({ dataArray }) => {
  const labels = Array.from({ length: dataArray.length }, (_, i) => i.toString());
  const data = {
    labels,
    datasets: [
      {
        label: 'Amplitude',
        data: Array.from(dataArray),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    scales: {
      x: { display: false },
      y: { beginAtZero: true },
    },
  };

  return <Bar data={data} options={options} />;
};

export default AmplitudeGraph;
