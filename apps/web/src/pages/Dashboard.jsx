import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/Dashboard.css';
import { FaCalendarAlt, FaBell, FaEnvelope, FaCaretDown } from 'react-icons/fa';
import { MdGroups, MdPerson } from 'react-icons/md';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto'
import API_URL from '../config';
import ChartCard from '../components/ChartCard';
import TruncatedText from '../components/TruncatedText';
import Cours from '../assets/cours.png';


const Dashboard = () => {
  const [students, setStudents] = useState(0);
  const [groups, setGroups] = useState(0);
  const [tricksViewed, setTricksViewed] = useState(0);
  const navigate = useNavigate();
  const [groupList, setGroupList] = useState([]);
  const [topTrick, setTopTrick] = useState(null);
  const chartRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const groupsPerPage = 5;

  const indexOfLastGroup = currentPage * groupsPerPage;
  const indexOfFirstGroup = indexOfLastGroup - groupsPerPage;
  const currentGroups = groupList.slice(indexOfFirstGroup, indexOfLastGroup);
  const totalPages = Math.ceil(groupList.length / groupsPerPage);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) setCurrentPage(page);
  };


  const getGradient = (ctx, area) => {
    const gradient = ctx.createLinearGradient(0, area.bottom, 0, area.top);
    gradient.addColorStop(0, 'rgba(255,64,129,0.1)');  // color inferior
    gradient.addColorStop(1, 'rgba(255,64,129,1)');    // color superior
    return gradient;
  };

  const data = {
    labels: ['1 May', '5 May', '10 May', '15 May', '20 May', '25 May', '31 May'],
    datasets: [
      {
        label: 'Trucos Vistos',
        data: [0, 25, 15, 30, 20, 40, 50],
        borderColor: (ctx) => {
          const chart = ctx.chart;
          const { ctx: canvasCtx, chartArea } = chart;
          if (!chartArea) {
            // Chart aún no está montado
            return 'var(--kk-color-primary)';
          }
          return getGradient(canvasCtx, chartArea);
        },
        borderWidth: 3,
        pointRadius: 4,
        pointBackgroundColor: 'var(--kk-color-primary)',
        fill: false,
        tension: 0.4
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        ticks: { color: '#fff' },
        grid: { display: false }
      },
      y: {
        ticks: { color: '#fff' },
        grid: { color: 'rgba(255,255,255,0.1)' }
      },
    },
  };

  useEffect(() => {
    axios.get(`${API_URL}/users/students`)
      .then((response) => {
        setStudents(response.data.length);
      })
      .catch(console.error);

    axios.get(`${API_URL}/groups`)
      .then((response) => {
        setGroups(response.data.length);
      })
      .catch(console.error);

    axios.get(`${API_URL}/tricks/total-views`)
      .then((response) => {
        setTricksViewed(response.data.total);
      })
      .catch(console.error);

    axios.get(`${API_URL}/groups`)
      .then((response) => {
        setGroupList(response.data);
      })
      .catch(console.error);

  }, []);

  useEffect(() => {
    axios.get(`${API_URL}/tricks/most-viewed`)
      .then((response) => setTopTrick(response.data))
      .catch(console.error);
  }, []);

  const extractYouTubeId = (url) => {
    if (!url) return '';
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/;
    const match = url.match(regex);
    return match ? match[1] : '';
  };



  return (
    <div className="dashboard-container">


      <div className="dashboard-stats">
        <div className="stats-container">
          <div className="stat-box stat-box2 star-box-aling">
            <MdPerson size={40} />
            <h3>{students}</h3>
            <p>Alumnos</p>
          </div>
          <div className="stat-box stat-box3 star-box-aling">
            <MdGroups size={40} />
            <h3>{groups}</h3>
            <p>Grupos</p>
          </div>
          <div className=" stat-box1 scale-80">
            <ChartCard
              data={data}
              options={options}
              tricksViewed={tricksViewed}
            />
          </div>
        </div>


      </div >
      <div className="body_header_dashboard">
        <div className="headerline">
          <h2 className="h2dashboard">Grupos</h2>
        </div>

        <div className="groups-table-container">
          <table className="groups-table">

            <tbody>
              {currentGroups.map((group) => (
                <tr key={group._id}>
                  <td>
                    <div className="group-info">
                      <img src={Cours} alt="avatar" />
                      <span>{group.name}</span>
                    </div>
                  </td>
                  <td>{group.members.length} alumnos</td>
                  <td>
                    <img
                      src={group.avatar ? group.avatar : '/placeholder.png'}
                      alt="avatar"
                      className="group-avatar"
                    />
                  </td>
                  <td><span className="group-ranking">#{group.ranking}</span></td>
                  <td>
                    {group.previousRanking === undefined ? (
                      <span>-</span>
                    ) : group.ranking < group.previousRanking ? (
                      <span className="arrow-up" style={{ color: '#00ff7f' }}>↑</span>
                    ) : group.ranking === group.previousRanking ? (
                      <span className="arrow-equal" style={{ color: 'var(--kk-color-accent)' }}>=</span>
                    ) : (
                      <span className="arrow-down" style={{ color: '#ff4c4c' }}>↓</span>
                    )}
                  </td>
                  <td>
                    <TruncatedText
                      text={group.tricks}
                      maxLines={2}
                      maxWidth="200px"
                    />
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
          <div className="pagination">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Anterior
            </button>
            <span>Página {currentPage} de {totalPages}</span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </button>
          </div>

        </div>

      </div>



      <div className="dashboard-content">
        <div className="groups-section">
          <h3>Grupos</h3>
        </div>
        <div className="tricks-section">
          <h3>Tu Truco Más Visto</h3>
          {topTrick ? (
            <div className="most-viewed-trick">
              <h4>{topTrick.name}</h4>

              <div className="video-wrapper">
                <iframe
                  width="100%"
                  height="315"
                  src={`https://www.youtube.com/embed/${extractYouTubeId(topTrick.video)}`}
                  title={topTrick.name}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          ) : (
            <p>No hay trucos registrados aún.</p>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
