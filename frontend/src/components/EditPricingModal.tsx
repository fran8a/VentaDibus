import { useState, useEffect } from 'react';
import { type Pricing, updateMultiplePricing } from '../services';
import './EditPricingModal.css';

interface EditPricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  pricingData: Pricing[];
  token: string;
  onUpdated: () => void;
}

const SIZES = ['15x21', '20x30', '30x40'];
const STYLES = ['Blanco y negro', 'Color'];

const EditPricingModal = ({ isOpen, onClose, pricingData, token, onUpdated }: EditPricingModalProps) => {
  const [formValues, setFormValues] = useState<Record<number, { price_without_frame: number; price_with_frame: number }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && pricingData.length > 0) {
      const initial: Record<number, { price_without_frame: number; price_with_frame: number }> = {};
      pricingData.forEach((item) => {
        initial[item.id] = {
          price_without_frame: item.price_without_frame,
          price_with_frame: item.price_with_frame,
        };
      });
      setFormValues(initial);
      setError(null);
    }
  }, [isOpen, pricingData]);

  if (!isOpen) return null;

  const handleChange = (id: number, field: 'price_without_frame' | 'price_with_frame', value: string) => {
    const numValue = value === '' ? 0 : parseInt(value, 10);
    setFormValues((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: isNaN(numValue) ? 0 : numValue,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Only send updates for prices that actually changed
      const updates = pricingData
        .filter((item) => {
          const current = formValues[item.id];
          if (!current) return false;
          return (
            current.price_without_frame !== item.price_without_frame ||
            current.price_with_frame !== item.price_with_frame
          );
        })
        .map((item) => ({
          id: item.id,
          data: formValues[item.id],
        }));

      if (updates.length === 0) {
        onClose();
        return;
      }

      await updateMultiplePricing(token, updates);

      onUpdated();
      onClose();
    } catch (err) {
      console.error('Error updating prices:', err);
      setError('Error de conexión al actualizar los precios.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Build ordered list: for each size, for each style
  const orderedItems: Pricing[] = [];
  SIZES.forEach((size) => {
    STYLES.forEach((style) => {
      const item = pricingData.find((p) => p.size === size && p.style === style);
      if (item) orderedItems.push(item);
    });
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="edit-pricing-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Editar Precios</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="pricing-edit-form">
          {error && <div className="pricing-error">{error}</div>}

          <table className="pricing-edit-table">
            <thead>
              <tr>
                <th className="cell-medida">Medida</th>
                <th className="cell-estilo">Estilo</th>
                <th className="cell-precio">Sin Cuadro ($)</th>
                <th className="cell-precio">Con Cuadro ($)</th>
              </tr>
            </thead>
            <tbody>
              {SIZES.map((size) => {
                const sizeItems = orderedItems.filter((item) => item.size === size);
                return sizeItems.map((item, idx) => (
                  <tr key={item.id} className={idx === 0 ? 'size-first-row' : ''}>
                    {idx === 0 && (
                      <td className="cell-medida" rowSpan={sizeItems.length}>
                        {size.replace('x', ' x ')}
                      </td>
                    )}
                    <td className="cell-estilo">
                      {item.style === 'Blanco y negro' ? 'ByN' : 'Color'}
                    </td>
                    <td className="cell-precio">
                      <input
                        type="number"
                        min={0}
                        value={formValues[item.id]?.price_without_frame ?? item.price_without_frame}
                        onChange={(e) => handleChange(item.id, 'price_without_frame', e.target.value)}
                        className="pricing-input"
                      />
                    </td>
                    <td className="cell-precio">
                      <input
                        type="number"
                        min={0}
                        value={formValues[item.id]?.price_with_frame ?? item.price_with_frame}
                        onChange={(e) => handleChange(item.id, 'price_with_frame', e.target.value)}
                        className="pricing-input"
                      />
                    </td>
                  </tr>
                ));
              })}
            </tbody>
          </table>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel" disabled={isSubmitting}>
              Cancelar
            </button>
            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPricingModal;
