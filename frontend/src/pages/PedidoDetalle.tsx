import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AddOrderModal from '../components/AddOrderModal';
import {
  type Order,
  type OrderFormData,
  ORDER_STATUS_LABELS,
  getOrderById,
  updateOrder,
  deleteOrder,
  quickUpdateOrder,
  STATIC_BASE_URL,
} from '../services';
import './PedidoDetalle.css';

const ADMIN_EMAIL = 'franochoarodriguez@gmail.com';

const PedidoDetalle = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const isAdmin = user?.email === ADMIN_EMAIL;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingDelivery, setIsUpdatingDelivery] = useState(false);
  const [deliveryDateInput, setDeliveryDateInput] = useState('');
  const [isEditingDelivery, setIsEditingDelivery] = useState(false);
  const [isStatusConfirmOpen, setIsStatusConfirmOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin || !token || !id) return;
    fetchOrder();
  }, [id, token, isAdmin]);

  useEffect(() => {
    setDeliveryDateInput(order?.delivered_date ?? '');
    setIsEditingDelivery(false);
  }, [order?.id]);

  useEffect(() => {
    const className = 'lightbox-open';
    if (lightboxImage) {
      document.body.classList.add(className);
    } else {
      document.body.classList.remove(className);
    }

    return () => {
      document.body.classList.remove(className);
    };
  }, [lightboxImage]);

  const fetchOrder = async () => {
    if (!token || !id) return;
    setIsLoading(true);
    try {
      const data = await getOrderById(token, Number(id));
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (data: OrderFormData) => {
    if (!token || !id) return;
    await updateOrder(token, Number(id), data);
    await fetchOrder();
  };

  const handleDelete = async () => {
    if (!token || !id) return;
    if (!confirm('¿Estás segura de que querés eliminar este pedido?')) return;
    setIsDeleting(true);
    try {
      await deleteOrder(token, Number(id));
      navigate('/pedidos');
    } catch {
      alert('Error al eliminar el pedido.');
      setIsDeleting(false);
    }
  };

  const handleQuickStatus = async (newStatus: string) => {
    if (!token || !id || newStatus === order?.status || isUpdatingStatus) return;
    setIsUpdatingStatus(true);
    try {
      const updated = await quickUpdateOrder(token, Number(id), { status: newStatus });
      setOrder(updated);
    } catch {
      alert('Error al actualizar el estado.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const requestQuickStatus = (newStatus: string) => {
    if (!order || isUpdatingStatus || newStatus === order.status) return;
    setPendingStatus(newStatus);
    setIsStatusConfirmOpen(true);
  };

  const confirmQuickStatus = async () => {
    if (!pendingStatus) return;
    setIsStatusConfirmOpen(false);
    await handleQuickStatus(pendingStatus);
    setPendingStatus(null);
  };

  const handleQuickDeliveredDate = async (dateStr: string | null) => {
    if (!token || !id || isUpdatingDelivery) return;
    setIsUpdatingDelivery(true);
    try {
      const updated = await quickUpdateOrder(token, Number(id), { delivered_date: dateStr });
      setOrder(updated);
    } catch {
      alert('Error al actualizar la fecha de entrega.');
    } finally {
      setIsUpdatingDelivery(false);
    }
  };

  const todayISO = () => new Date().toISOString().split('T')[0];

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '—';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(price);

  if (!isAdmin) {
    return (
      <div className="detalle-page">
        <div className="access-denied">
          <span>🔒</span>
          <p>Solo el administrador puede acceder a esta sección.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="detalle-page">
        <div className="loading-state">
          <div className="loading-spinner" />
          <p>Cargando pedido...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="detalle-page">
        <div className="access-denied">
          <span>📭</span>
          <p>Pedido no encontrado.</p>
          <button className="btn-back" onClick={() => navigate('/pedidos')}>
            Volver a pedidos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="detalle-page">
      <div className="detalle-header">
        <button className="btn-back" onClick={() => navigate('/pedidos')}>
          ← Volver
        </button>
        <div className="detalle-header-actions">
          <button className="btn-edit" onClick={() => setIsEditModalOpen(true)}>
            ✏️ Editar
          </button>
          <button className="btn-delete" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Eliminando...' : '🗑 Eliminar'}
          </button>
        </div>
      </div>

      <div className="detalle-title-row">
        <h1 className="detalle-title">Pedido #{order.id}</h1>
        <span className={`status-badge status-${order.status}`}>
          {ORDER_STATUS_LABELS[order.status] ?? order.status}
        </span>
      </div>

      <div className="detalle-grid">
        {/* Seguimiento rápido */}
        <section className="detalle-card detalle-card--full tracking-card">
          <h2 className="card-title">🔄 Seguimiento del pedido</h2>

          <div className="tracking-section">
            <span className="tracking-label">Estado</span>
            <div className="status-pills">
              {Object.entries(ORDER_STATUS_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  className={`status-pill status-pill--${key}${order.status === key ? ' status-pill--active' : ''}`}
                  onClick={() => requestQuickStatus(key)}
                  disabled={isUpdatingStatus || order.status === key}
                >
                  {label}
                </button>
              ))}
              {isUpdatingStatus && <span className="tracking-updating">Guardando…</span>}
            </div>

            {isStatusConfirmOpen && pendingStatus && (
              <div className="status-confirm-overlay">
                <div className="status-confirm-modal" role="dialog" aria-modal="true">
                  <h3 className="status-confirm-title">Confirmar estado</h3>
                  <p className="status-confirm-text">
                    ¿Querés cambiar el estado a{' '}
                    <strong>{ORDER_STATUS_LABELS[pendingStatus] ?? pendingStatus}</strong>?
                  </p>
                  <div className="status-confirm-actions">
                    <button
                      className="status-confirm-cancel"
                      onClick={() => {
                        setIsStatusConfirmOpen(false);
                        setPendingStatus(null);
                      }}
                      disabled={isUpdatingStatus}
                    >
                      Cancelar
                    </button>
                    <button
                      className="status-confirm-submit"
                      onClick={confirmQuickStatus}
                      disabled={isUpdatingStatus}
                    >
                      {isUpdatingStatus ? 'Guardando…' : 'Confirmar'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="tracking-divider" />

          <div className="tracking-section">
            <span className="tracking-label">Fecha de entrega real</span>
            {isEditingDelivery ? (
              <div className="delivery-edit-row">
                <input
                  type="date"
                  className="delivery-date-input"
                  value={deliveryDateInput}
                  onChange={(e) => setDeliveryDateInput(e.target.value)}
                />
                <button
                  className="btn-delivery-save"
                  onClick={() => handleQuickDeliveredDate(deliveryDateInput || null)}
                  disabled={isUpdatingDelivery}
                >
                  {isUpdatingDelivery ? 'Guardando…' : '✓ Guardar'}
                </button>
                <button
                  className="btn-delivery-cancel"
                  onClick={() => {
                    setDeliveryDateInput(order.delivered_date ?? '');
                    setIsEditingDelivery(false);
                  }}
                  disabled={isUpdatingDelivery}
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="delivery-view-row">
                {order.delivered_date ? (
                  <>
                    <span className="delivery-date-display">{formatDate(order.delivered_date)}</span>
                    <button
                      className="btn-delivery-action btn-edit-date"
                      onClick={() => setIsEditingDelivery(true)}
                      disabled={isUpdatingDelivery}
                    >
                      ✏️ Cambiar
                    </button>
                    <button
                      className="btn-delivery-action btn-clear-date"
                      onClick={() => handleQuickDeliveredDate(null)}
                      disabled={isUpdatingDelivery}
                    >
                      {isUpdatingDelivery ? '…' : '✕ Borrar'}
                    </button>
                  </>
                ) : (
                  <>
                    <span className="delivery-no-date">— Sin fecha de entrega</span>
                    <button
                      className="btn-delivery-action btn-today"
                      onClick={() => handleQuickDeliveredDate(todayISO())}
                      disabled={isUpdatingDelivery}
                    >
                      {isUpdatingDelivery ? '…' : '📦 Marcar hoy'}
                    </button>
                    <button
                      className="btn-delivery-action btn-edit-date"
                      onClick={() => setIsEditingDelivery(true)}
                      disabled={isUpdatingDelivery}
                    >
                      📅 Elegir fecha
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Datos del cliente */}
        <section className="detalle-card">
          <h2 className="card-title">👤 Cliente</h2>
          <div className="card-fields">
            <div className="field">
              <span className="field-label">Nombre del dueño</span>
              <span className="field-value">{order.owner_name}</span>
            </div>
            <div className="field">
              <span className="field-label">Nombre de la mascota</span>
              <span className="field-value">{order.pet_name}</span>
            </div>
          </div>
        </section>

        {/* Datos del retrato */}
        <section className="detalle-card">
          <h2 className="card-title">🎨 Retrato</h2>
          <div className="card-fields">
            <div className="field">
              <span className="field-label">Medidas</span>
              <span className="field-value">{order.measurements}</span>
            </div>
            <div className="field">
              <span className="field-label">Color</span>
              <span className="field-value">{order.color}</span>
            </div>
          </div>
        </section>

        {/* Fechas */}
        <section className="detalle-card">
          <h2 className="card-title">📅 Fechas</h2>
          <div className="card-fields">
            <div className="field">
              <span className="field-label">Fecha del pedido</span>
              <span className="field-value">{formatDate(order.order_date)}</span>
            </div>
            <div className="field">
              <span className="field-label">Entrega estimada</span>
              <span className="field-value">{formatDate(order.estimated_delivery_date)}</span>
            </div>
            <div className="field">
              <span className="field-label">Fecha entregado</span>
              <span className="field-value">{formatDate(order.delivered_date)}</span>
            </div>
          </div>
        </section>

        {/* Precio */}
        <section className="detalle-card">
          <h2 className="card-title">💰 Precio</h2>
          <div className="card-fields">
            <div className="field">
              <span className="field-label">Precio acordado</span>
              <span className="field-value field-price">{formatPrice(order.agreed_price)}</span>
            </div>
          </div>
        </section>

        {/* Notas */}
        {order.notes && (
          <section className="detalle-card detalle-card--full">
            <h2 className="card-title">📝 Notas</h2>
            <p className="notes-text">{order.notes}</p>
          </section>
        )}

        {/* Imágenes de referencia */}
        {order.reference_images && order.reference_images.length > 0 && (
          <section className="detalle-card detalle-card--full">
            <h2 className="card-title">📸 Imágenes de referencia</h2>
            <div className="reference-images-grid">
              {order.reference_images.map((url, i) => (
                <div
                  key={i}
                  className="reference-image-wrapper"
                  onClick={() => setLightboxImage(`${STATIC_BASE_URL}${url}`)}
                >
                  <img
                    src={`${STATIC_BASE_URL}${url}`}
                    alt={`Referencia ${i + 1}`}
                    className="reference-image"
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <div className="lightbox" onClick={() => setLightboxImage(null)}>
          <button className="lightbox-close" onClick={() => setLightboxImage(null)}>
            ×
          </button>
          <img src={lightboxImage} alt="Imagen de referencia" className="lightbox-image" />
        </div>
      )}

      <AddOrderModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdate}
        editOrder={order}
      />
    </div>
  );
};

export default PedidoDetalle;
