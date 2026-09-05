export function mapOrder(row) {
  return {
    reference: row.reference,
    status: row.status,
    subtotal: row.subtotal,
    shippingCost: row.shipping_cost,
    total: row.total,
    customer: {
      name: row.customer_name,
      email: row.customer_email,
      phone: row.customer_phone,
      document: row.customer_document,
    },
    shipping: {
      postalCode: row.shipping_postal_code,
      street: row.shipping_street,
      number: row.shipping_number,
      complement: row.shipping_complement,
      district: row.shipping_district,
      city: row.shipping_city,
      state: row.shipping_state,
      serviceId: row.shipping_service_id,
      serviceName: row.shipping_service_name,
      company: row.shipping_company,
      deadline: row.shipping_deadline,
      trackingCode: row.tracking_code,
    },
    payment: {
      id: row.payment_id,
      status: row.payment_status,
      method: row.payment_method,
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}