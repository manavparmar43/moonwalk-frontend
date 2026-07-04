'use client';

export default function ChefRow({ chef, onEdit, onDelete }) {
  return (
    <tr>
      <td>{chef.chefName}</td>
      <td>{chef.chefEmail}</td>
      <td>{chef.status}</td>
      <td>{chef.maxConcurrentOrders}</td>
      <td>
        <div className="row-actions">
          <button className="secondary icon-btn" title="Edit" onClick={() => onEdit(chef)}>
            <i className="fa-solid fa-pen" />
          </button>
          <button className="secondary icon-btn" title="Delete" onClick={() => onDelete(chef)}>
            <i className="fa-solid fa-trash" />
          </button>
        </div>
      </td>
    </tr>
  );
}
