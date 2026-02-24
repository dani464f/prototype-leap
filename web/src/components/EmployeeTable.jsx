import { Link } from 'react-router-dom';

const EmployeeTable = ({ rows }) => (
  <div className="table-wrap card">
    <table>
      <thead>
        <tr>
          <th>Name</th><th>Department</th><th>Role</th><th>Device</th><th>Current Tier</th><th>Last Updated</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(({ employee, device, tier }) => (
          <tr key={employee.id}>
            <td><Link to={`/employee/${employee.id}`}>{employee.name}</Link></td>
            <td>{employee.department}</td>
            <td>{employee.role}</td>
            <td>{device?.hostname || '-'}</td>
            <td><span className={`tier tier-${tier?.currentTier || 1}`}>Tier {tier?.currentTier || 1}</span></td>
            <td>{tier?.lastUpdated ? new Date(tier.lastUpdated).toLocaleString() : '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default EmployeeTable;
