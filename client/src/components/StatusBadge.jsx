const STATUS_CLASS_MAP = {
  Pending: 'status-pending',
  'Pending Review': 'status-pending',
  Processing: 'status-processing',
  Approved: 'status-processing',
  Printing: 'status-printing',
  Shipped: 'status-shipped',
  Delivered: 'status-delivered',
  Completed: 'status-delivered',
  Cancelled: 'status-cancelled',
  Rejected: 'status-cancelled',
};

export default function StatusBadge({ status }) {
  const cls = STATUS_CLASS_MAP[status] || 'status-pending';
  return <span className={`status-badge ${cls}`}>{status}</span>;
}
