import { authenticatedFetch } from './api';

export interface Order {
  id: number;
  owner_name: string;
  pet_name: string;
  measurements: string;
  color: string;
  reference_images: string[];
  agreed_price: number;
  order_date: string;
  estimated_delivery_date: string;
  delivered_date: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

export interface OrderListItem {
  id: number;
  owner_name: string;
  agreed_price: number;
  estimated_delivery_date: string;
  status: string;
}

export interface PaginatedOrders {
  items: OrderListItem[];
  total: number;
  page: number;
  total_pages: number;
}

export interface OrderFormData {
  owner_name: string;
  pet_name: string;
  measurements: string;
  color: string;
  agreed_price: number;
  order_date: string;
  estimated_delivery_date: string;
  delivered_date?: string;
  order_status: string;
  notes?: string;
  reference_files?: File[];
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  completado: 'Completado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

export interface OrderFilters {
  ownerName?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
}

export const getOrders = async (
  token: string,
  page: number = 1,
  filters: OrderFilters = {}
): Promise<PaginatedOrders> => {
  const params = new URLSearchParams({ page: String(page) });
  if (filters.ownerName) params.set('owner_name', filters.ownerName);
  if (filters.dateFrom) params.set('date_from', filters.dateFrom);
  if (filters.dateTo) params.set('date_to', filters.dateTo);
  if (filters.status) params.set('status', filters.status);
  const response = await authenticatedFetch(`/orders?${params.toString()}`, token);
  if (!response.ok) {
    throw new Error('Error al obtener los pedidos');
  }
  return response.json();
};

export const getOrderById = async (
  token: string,
  orderId: number
): Promise<Order> => {
  const response = await authenticatedFetch(`/orders/${orderId}`, token);
  if (!response.ok) {
    throw new Error('Error al obtener el pedido');
  }
  return response.json();
};

export const createOrder = async (
  token: string,
  data: OrderFormData
): Promise<Order> => {
  const formData = new FormData();
  formData.append('owner_name', data.owner_name);
  formData.append('pet_name', data.pet_name);
  formData.append('measurements', data.measurements);
  formData.append('color', data.color);
  formData.append('agreed_price', data.agreed_price.toString());
  formData.append('order_date', data.order_date);
  formData.append('estimated_delivery_date', data.estimated_delivery_date);
  if (data.delivered_date) formData.append('delivered_date', data.delivered_date);
  formData.append('order_status', data.order_status);
  if (data.notes) formData.append('notes', data.notes);
  if (data.reference_files) {
    data.reference_files.forEach((file) => formData.append('reference_files', file));
  }

  const response = await authenticatedFetch('/orders', token, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Error al crear el pedido');
  }
  return response.json();
};

export const updateOrder = async (
  token: string,
  orderId: number,
  data: Partial<OrderFormData>
): Promise<Order> => {
  const formData = new FormData();
  if (data.owner_name !== undefined) formData.append('owner_name', data.owner_name);
  if (data.pet_name !== undefined) formData.append('pet_name', data.pet_name);
  if (data.measurements !== undefined) formData.append('measurements', data.measurements);
  if (data.color !== undefined) formData.append('color', data.color);
  if (data.agreed_price !== undefined)
    formData.append('agreed_price', data.agreed_price.toString());
  if (data.order_date !== undefined) formData.append('order_date', data.order_date);
  if (data.estimated_delivery_date !== undefined)
    formData.append('estimated_delivery_date', data.estimated_delivery_date);
  if (data.delivered_date !== undefined) formData.append('delivered_date', data.delivered_date);
  if (data.order_status !== undefined) formData.append('order_status', data.order_status);
  if (data.notes !== undefined) formData.append('notes', data.notes ?? '');
  if (data.reference_files && data.reference_files.length > 0) {
    data.reference_files.forEach((file) => formData.append('reference_files', file));
  }

  const response = await authenticatedFetch(`/orders/${orderId}`, token, {
    method: 'PATCH',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Error al actualizar el pedido');
  }
  return response.json();
};

export const deleteOrder = async (token: string, orderId: number): Promise<void> => {
  const response = await authenticatedFetch(`/orders/${orderId}`, token, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Error al eliminar el pedido');
  }
};

export const quickUpdateOrder = async (
  token: string,
  orderId: number,
  data: { status?: string; delivered_date?: string | null }
): Promise<Order> => {
  const response = await authenticatedFetch(`/orders/${orderId}/quick`, token, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Error al actualizar el pedido');
  }
  return response.json();
};
