import { Link, Route, Routes, useLocation } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import EmployeeDetailPage from './pages/EmployeeDetailPage';

const App = () => {
  const location = useLocation();
  return (
    <div className="shell">
      <aside className="sidebar">
        <h1>NowOps Device Intelligence</h1>
        <nav>
          <Link className={location.pathname === '/' ? 'active' : ''} to="/">
            Dashboard
          </Link>
        </nav>
      </aside>
      <main className="content">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/employee/:id" element={<EmployeeDetailPage />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
