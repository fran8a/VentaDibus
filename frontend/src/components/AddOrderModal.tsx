import { useState, useEffect } from 'react';
import type { Order, OrderFormData } from '../services/ordersService';
import './AddOrderModal.css';

const ORDER_STATUSES = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_proceso', label: 'En proceso' },
  { value: 'completado', label: 'Completado' },
  { value: 'entregado', label: 'Entregado' },
  { value: 'cancelado', label: 'Cancelado' },
];

interface AddOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: OrderFormData) => Promise<void>;
  editOrder?: Order | null;
}

const EMPTY_FORM: OrderFormData = {
  owner_name: '',
  pet_name: '',
  measurements: '',
  color: '',
  agreed_price: 0,
  order_date: '',
  estimated_delivery_date: '',
  delivered_date: '',
  order_status: 'pendiente',
  notes: '',
  reference_files: [],
};

const AddOrderModal = ({ isOpen, onClose, onSubmit, editOrder }: AddOrderModalProps) => {
  const [form, setForm] = useState<OrderFormData>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  useEffect(() => {
    if (editOrder) {
      setForm({
        owner_name: editOrder.owner_name,
        pet_name: editOrder.pet_name,
        measurements: editOrder.measurements,
        color: editOrder.color,
        agreed_price: editOrder.agreed_price,
        order_date: editOrder.order_date,
        estimated_delivery_date: editOrder.estimated_delivery_date,
        delivered_date: editOrder.delivered_date ?? '',
        order_status: editOrder.status,
        notes: editOrder.notes ?? '',
        reference_files: [],
      });
      setFileNames([]);
    } else {
      setForm(EMPTY_FORM);
      setFileNames([]);
    }
  }, [editOrder, isOpen]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'agreed_price' ? parseFloat(value) || 0 : value }));
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setForm((prev) => ({ ...prev, reference_files: files }));
    setFileNames(files.map((f) => f.name));
  };

  const validateForm = () => {
    if (
      !form.owner_name ||
      !form.pet_name ||
      !form.measurements ||
      !form.color ||
      !form.agreed_price ||
      !form.order_date ||
      !form.estimated_delivery_date
    ) {
      alert('Completá todos los campos obligatorios.');
      return false;
    }

    return true;
  };

  const submitOrder = async () => {
    setIsConfirmModalOpen(false);

    setIsSubmitting(true);
    try {
      await onSubmit(form);
      setForm(EMPTY_FORM);
      setFileNames([]);
      onClose();
    } catch {
      alert('Error al guardar el pedido. Intentá de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitClick = async () => {
    if (!validateForm()) return;

    if (editOrder) {
      setIsConfirmModalOpen(true);
      return;
    }

    await submitOrder();
  };

  const handleClose = () => {
    if (isConfirmModalOpen) {
      setIsConfirmModalOpen(false);
      return;
    }

    if (!isSubmitting) {
      setForm(EMPTY_FORM);
      setFileNames([]);
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="order-modal-content">
        <div className="modal-header">
          <h2 className="modal-title">{editOrder ? 'Editar Pedido' : 'Nuevo Pedido'}</h2>
          <button className="modal-close" onClick={handleClose} disabled={isSubmitting}>
            ×
          </button>
        </div>

        <div className="order-modal-body">
          <div className="order-form-grid">
            <div className="form-group">
              <label className="form-label">Nombre del dueño *</label>
              <input
                className="form-input"
                name="owner_name"
                value={form.owner_name}
                onChange={handleChange}
                placeholder="Ej: María García"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nombre de la mascota *</label>
              <input
                className="form-input"
                name="pet_name"
                value={form.pet_name}
                onChange={handleChange}
                placeholder="Ej: Firulais"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Medidas *</label>
              <input
                className="form-input"
                name="measurements"
                value={form.measurements}
                onChange={handleChange}
                placeholder="Ej: 30x40 cm"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Color *</label>
              <input
                className="form-input"
                name="color"
                value={form.color}
                onChange={handleChange}
                placeholder="Ej: Color / Blanco y negro"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Precio acordado (ARS) *</label>
              <input
                className="form-input"
                type="number"
                name="agreed_price"
                value={form.agreed_price || ''}
                onChange={handleChange}
                placeholder="Ej: 15000"
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Estado *</label>
              <select
                className="form-input"
                name="order_status"
                value={form.order_status}
                onChange={handleChange}
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Fecha del pedido *</label>
              <input
                className="form-input"
                type="date"
                name="order_date"
                value={form.order_date}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Fecha estimada de entrega *</label>
              <input
                className="form-input"
                type="date"
                name="estimated_delivery_date"
                value={form.estimated_delivery_date}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Fecha entregado</label>
              <input
                className="form-input"
                type="date"
                name="delivered_date"
                value={form.delivered_date ?? ''}
                onChange={handleChange}
              />
            </div>

            <div className="form-group form-group--full">
              <label className="form-label">Notas / Detalles adicionales</label>
              <textarea
                className="form-input form-textarea"
                name="notes"
                value={form.notes ?? ''}
                onChange={handleChange}
                placeholder="Observaciones del pedido..."
                rows={3}
              />
            </div>

            <div className="form-group form-group--full">
              <label className="form-label">
                Imágenes de referencia {editOrder ? '(reemplaza las actuales si subís nuevas)' : ''}
              </label>
              <label className="file-input-button">
                <span>📎</span>
                <span>{fileNames.length > 0 ? `${fileNames.length} archivo(s) seleccionado(s)` : 'Seleccionar imágenes'}</span>
                <input
                  type="file"
                  className="file-input"
                  accept="image/*"
                  multiple
                  onChange={handleFiles}
                />
              </label>
              {fileNames.length > 0 && (
                <ul className="file-list">
                  {fileNames.map((name, i) => (
                    <li key={i} className="file-list-item">
                      📸 {name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </button>
          <button className="btn-submit" onClick={handleSubmitClick} disabled={isSubmitting}>
            {isSubmitting
              ? 'Guardando...'
              : editOrder
                ? 'Confirmar cambios'
                : 'Crear pedido'}
          </button>
        </div>

        {isConfirmModalOpen && (
          <div className="confirm-update-overlay">
            <div className="confirm-update-modal" role="dialog" aria-modal="true">
              <h3 className="confirm-update-title">Confirmar cambios</h3>
              <p className="confirm-update-text">
                ¿Querés guardar los cambios en este pedido?
              </p>
              <div className="confirm-update-actions">
                <button
                  className="btn-confirm-cancel"
                  onClick={() => setIsConfirmModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Volver
                </button>
                <button
                  className="btn-confirm-submit"
                  onClick={submitOrder}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Guardando...' : 'Sí, guardar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddOrderModal;
