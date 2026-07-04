'use client';

export default function MenuItemRow({ item, onEdit, onDelete }) {
  return (
    <tr>
      <td>{item.name}</td>
      <td>{item.prepTimeMinutes} min</td>
      <td>₹{item.price}</td>
      <td>
        <div className="row-actions">
          <button className="secondary icon-btn" title="Edit" onClick={() => onEdit(item)}>
            <i className="fa-solid fa-pen" />
          </button>
          <button className="secondary icon-btn" title="Delete" onClick={() => onDelete(item)}>
            <i className="fa-solid fa-trash" />
          </button>
        </div>
      </td>
    </tr>
  );
}
