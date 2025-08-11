// Export utilities for orders and other data

export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Convert orders data to CSV format
  const headers = ['Order ID', 'Customer Name', 'Customer Email', 'Products', 'Rental Start', 'Rental End', 'Status', 'Total Amount', 'Created Date', 'Notes'];
  
  const csvContent = [
    headers.join(','),
    ...data.map(order => [
      order.orderNumber,
      `"${order.customer.firstName} ${order.customer.lastName}"`,
      order.customer.email,
      `"${order.items.map(item => `${item.productId.name} (x${item.quantity})`).join(', ')}"`,
      new Date(order.rentalStart).toLocaleDateString(),
      new Date(order.rentalEnd).toLocaleDateString(),
      order.status,
      order.totalAmount,
      new Date(order.createdAt).toLocaleDateString(),
      `"${order.notes || ''}"`
    ].join(','))
  ].join('\n');

  downloadFile(csvContent, filename || `orders-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
};

export const exportToPDF = async (order) => {
  // For now, we'll create a simple HTML receipt that can be printed as PDF
  const receiptHTML = generateReceiptHTML(order);
  
  // Open in new window for printing
  const printWindow = window.open('', '_blank');
  printWindow.document.write(receiptHTML);
  printWindow.document.close();
  printWindow.focus();
  
  // Auto-print after a short delay
  setTimeout(() => {
    printWindow.print();
  }, 500);
};

export const generateReceiptHTML = (order) => {
  const calculateDuration = () => {
    const start = new Date(order.rentalStart);
    const end = new Date(order.rentalEnd);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Order Receipt - ${order.orderNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
        .company-name { font-size: 24px; font-weight: bold; color: #2563eb; }
        .order-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .customer-info, .rental-info { width: 48%; }
        .section-title { font-weight: bold; font-size: 16px; margin-bottom: 10px; color: #374151; }
        .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .items-table th { background-color: #f3f4f6; font-weight: bold; }
        .total-section { margin-top: 20px; text-align: right; }
        .total-row { display: flex; justify-content: space-between; margin: 5px 0; }
        .total-final { font-weight: bold; font-size: 18px; border-top: 2px solid #333; padding-top: 10px; }
        .status-badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        .status-pending { background-color: #fef3c7; color: #92400e; }
        .status-confirmed { background-color: #dbeafe; color: #1e40af; }
        .status-in-progress { background-color: #e9d5ff; color: #7c3aed; }
        .status-completed { background-color: #d1fae5; color: #065f46; }
        .status-cancelled { background-color: #fee2e2; color: #dc2626; }
        .notes-section { margin-top: 20px; padding: 15px; background-color: #f9fafb; border-radius: 8px; }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">RentEasy</div>
        <div>Rental Order Receipt</div>
      </div>

      <div class="order-info">
        <div class="customer-info">
          <div class="section-title">Customer Information</div>
          <div><strong>Name:</strong> ${order.customer.firstName} ${order.customer.lastName}</div>
          <div><strong>Email:</strong> ${order.customer.email}</div>
          <div><strong>Phone:</strong> ${order.customer.phone || 'Not provided'}</div>
        </div>
        
        <div class="rental-info">
          <div class="section-title">Order Details</div>
          <div><strong>Order ID:</strong> ${order.orderNumber}</div>
          <div><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</div>
          <div><strong>Status:</strong> <span class="status-badge status-${order.status}">${order.status.toUpperCase()}</span></div>
          <div><strong>Duration:</strong> ${calculateDuration()} days</div>
        </div>
      </div>

      <div class="section-title">Rental Period</div>
      <div style="margin-bottom: 20px;">
        <strong>Start:</strong> ${new Date(order.rentalStart).toLocaleDateString()} | 
        <strong>End:</strong> ${new Date(order.rentalEnd).toLocaleDateString()}
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map(item => `
            <tr>
              <td>${item.productId.name}</td>
              <td>${item.quantity}</td>
              <td>₹${item.unitPrice}</td>
              <td>₹${item.unitPrice * item.quantity}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="total-section">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>₹${order.subtotal || order.totalAmount}</span>
        </div>
        <div class="total-row">
          <span>Tax:</span>
          <span>₹${order.taxAmount || 0}</span>
        </div>
        <div class="total-row">
          <span>Delivery:</span>
          <span>₹${order.deliveryCharge || 0}</span>
        </div>
        <div class="total-row total-final">
          <span>Total Amount:</span>
          <span>₹${order.totalAmount}</span>
        </div>
      </div>

      ${order.notes ? `
        <div class="notes-section">
          <div class="section-title">Order Notes</div>
          <div>${order.notes}</div>
        </div>
      ` : ''}

      <div style="margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px;">
        <div>Thank you for choosing RentEasy!</div>
        <div>For support, contact us at support@renteasy.com</div>
      </div>
    </body>
    </html>
  `;
};

const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};
