import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isAdminEmail } from '../config/admin';
import AddOrderModal from '../components/AddOrderModal';
import {
  type OrderListItem,
  type OrderFormData,
  type OrderFilters,
  ORDER_STATUS_LABELS,
  getOrders,
  createOrder,
} from '../services';
import './Pedidos.css';

const Pedidos = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const isAdmin = isAdminEmail(user?.email);

  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [ownerNameInput, setOwnerNameInput] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeFilters, setActiveFilters] = useState<OrderFilters>({});
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isAdmin || !token) return;
    fetchOrders(1, activeFilters);
    setPage(1);
  }, [activeFilters, token, isAdmin]);

  useEffect(() => {
    if (!isAdmin || !token) return;
    fetchOrders(page, activeFilters);
  }, [page]);

  const fetchOrders = async (p: number, filters: OrderFilters) => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await getOrders(token, p, filters);
      setOrders(data.items);
      setTotal(data.total);
      setTotalPages(data.total_pages);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOwnerNameChange = (value: string) => {
    setOwnerNameInput(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setPage(1);
      setActiveFilters((prev) => ({ ...prev, ownerName: value.trim() || undefined }));
    }, 400);
  };

  const handleDateFromChange = (value: string) => {
    setDateFrom(value);
    setPage(1);
    setActiveFilters((prev) => ({ ...prev, dateFrom: value || undefined }));
  };

  const handleDateToChange = (value: string) => {
    setDateTo(value);
    setPage(1);
    setActiveFilters((prev) => ({ ...prev, dateTo: value || undefined }));
  };

  const handleStatusToggle = (value: string) => {
    const next = statusFilter === value ? '' : value;
    setStatusFilter(next);
    setPage(1);
    setActiveFilters((prev) => ({ ...prev, status: next || undefined }));
  };

  const handleClearFilters = useCallback(() => {
    setOwnerNameInput('');
    setDateFrom('');
    setDateTo('');
    setStatusFilter('');
    setPage(1);
    setActiveFilters({});
  }, []);

  const hasActiveFilters =
    !!activeFilters.ownerName || !!activeFilters.dateFrom || !!activeFilters.dateTo || !!activeFilters.status;

  const handleCreateOrder = async (data: OrderFormData) => {
    if (!token) return;
    await createOrder(token, data);
    await fetchOrders(1, activeFilters);
    setPage(1);
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr + 'T00:00:00').toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(price);

  if (!isAdmin) {
    return (
      <div className="pedidos-page">
        <div className="access-denied">
          <span className="access-denied-icon">🔒</span>
          <p>Solo el administrador puede acceder a esta sección.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pedidos-page">
      <header className="page-header">
        <div className="page-header-top">
          <div>
            <h1 className="page-title">Pedidos</h1>
            <p className="page-subtitle">
              Gestión de pedidos de retratos
              {total > 0 && <span className="total-badge">{total} pedido{total !== 1 ? 's' : ''}</span>}
            </p>
          </div>
          <button className="btn-add-order" onClick={() => setIsModalOpen(true)}>
            + Nuevo pedido
          </button>
        </div>

        {/* Filter bar */}
        <div className="filter-bar">
          <div className="filter-field">
            <label className="filter-label">Dueño</label>
            <input
              className="filter-input"
              type="text"
              placeholder="Buscar por nombre..."
              value={ownerNameInput}
              onChange={(e) => handleOwnerNameChange(e.target.value)}
            />
          </div>
          <div className="filter-field">
            <label className="filter-label">Fecha desde</label>
            <input
              className="filter-input filter-input--date"
              type="date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(e) => handleDateFromChange(e.target.value)}
            />
          </div>
          <div className="filter-field">
            <label className="filter-label">Fecha hasta</label>
            <input
              className="filter-input filter-input--date"
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(e) => handleDateToChange(e.target.value)}
            />
          </div>
          <div className="filter-field filter-field--status">
            <label className="filter-label">Estado</label>
            <div className="status-filter-pills">
              {Object.entries(ORDER_STATUS_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  className={`status-filter-pill status-filter-pill--${key}${statusFilter === key ? ' status-filter-pill--active' : ''}`}
                  onClick={() => handleStatusToggle(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {hasActiveFilters && (
            <button className="btn-clear-filters" onClick={handleClearFilters}>
              ✕ Limpiar
            </button>
          )}
        </div>
      </header>

      {isLoading ? (
        <div className="loading-state">
          <div className="loading-spinner" />
          <p>Cargando pedidos...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">{hasActiveFilters ? '🔍' : '📋'}</span>
          <p>
            {hasActiveFilters
              ? 'No se encontraron pedidos con esos filtros.'
              : 'No hay pedidos registrados aún.'}
          </p>
          {hasActiveFilters ? (
            <button className="btn-clear-filters btn-clear-filters--center" onClick={handleClearFilters}>
              Limpiar filtros
            </button>
          ) : (
            <button className="btn-add-order" onClick={() => setIsModalOpen(true)}>
              Crear primer pedido
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="orders-table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Dueño</th>
                  <th>Monto</th>
                  <th>Entrega estimada</th>
                  <th>Estado</th>
                  <th>Detalle</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="col-id">{order.id}</td>
                    <td className="col-owner">{order.owner_name}</td>
                    <td className="col-price">{formatPrice(order.agreed_price)}</td>
                    <td className="col-date">{formatDate(order.estimated_delivery_date)}</td>
                    <td className="col-status">
                      <span className={`status-badge status-${order.status}`}>
                        {ORDER_STATUS_LABELS[order.status] ?? order.status}
                      </span>
                    </td>
                    <td className="col-action">
                      <button
                        className="btn-view"
                        onClick={() => navigate(`/pedidos/${order.id}`)}
                        title="Ver detalle"
                        aria-label={`Ver detalle del pedido ${order.id}`}
                      >
                        👁
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ‹ Anterior
              </button>
              <span className="page-info">
                Página {page} de {totalPages}
              </span>
              <button
                className="page-btn"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Siguiente ›
              </button>
            </div>
          )}
        </>
      )}

      <AddOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrder}
      />
    </div>
  );
};

export default Pedidos;
