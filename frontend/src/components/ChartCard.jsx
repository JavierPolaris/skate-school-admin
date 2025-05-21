import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { MdGroups } from 'react-icons/md';
import '../css/Chart.css';

function ChartCard() {
  const [tricksViewed, setTricksViewed] = useState(0);

  useEffect(() => {
    fetch('http://localhost:5000/api/tricks/total-views')
      .then(res => res.json())
      .then(data => setTricksViewed(data.totalViews || 0))
      .catch(err => console.error(err));
  }, []);

  const chartData = {
    labels: ['Total Visualizaciones'], // Puedes añadir más si tienes datos por mes, etc.
    datasets: [
      {
        label: 'Visualizaciones',
        data: [tricksViewed],
        borderColor: '#FF4081',
        backgroundColor: 'rgba(255, 64, 129, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return (
    <div className="chart-wrapper">
      <div className="chart-top-section">
        <div className="chart-header-father">
          <div className="chart-header">
            <h3>Trucos Vistos</h3>
            <span className="chart-month">Total</span>
          </div>
          <div className="chart-canvas">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="chart-footer-section">
        <div className="footer-content">
          <MdGroups size={25} />
          <p>
            <strong>{tricksViewed}</strong> Visualizaciones Totales de Trucos
          </p>
        </div>
      </div>
    </div>
  );
}

export default ChartCard;
