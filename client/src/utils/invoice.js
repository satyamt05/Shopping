import { formatCurrency } from './currency';

export const generateInvoicePDF = (order) => {
    // Create invoice HTML
    const invoiceHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Invoice - Order #${order._id.substring(order._id.length - 8).toUpperCase()}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
                .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #4f46e5; padding-bottom: 20px; }
                .header h1 { color: #4f46e5; margin: 0; }
                .order-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
                .section { margin-bottom: 25px; }
                .section h3 { color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 15px; }
                .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                .items-table th, .items-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                .items-table th { background: #f8f9fa; font-weight: bold; }
                .total-section { text-align: right; margin-top: 20px; }
                .total-row { display: flex; justify-content: flex-end; margin-bottom: 10px; }
                .total-label { width: 120px; text-align: right; padding-right: 20px; }
                .total-value { width: 100px; text-align: right; font-weight: bold; }
                .footer { margin-top: 40px; text-align: center; color: #666; font-size: 14px; }
                .status { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
                .status-paid { background: #d4edda; color: #155724; }
                .status-pending { background: #fff3cd; color: #856404; }
                @media print { body { background: white; } .container { box-shadow: none; } }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🧾 SHOPZOP INVOICE</h1>
                    <p>Tax Invoice | Order #${order._id.substring(order._id.length - 8).toUpperCase()}</p>
                </div>

                <div class="order-info">
                    <div>
                        <strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN')}<br>
                        <strong>Payment Method:</strong> ${order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Credit/Debit Card'}<br>
                        <strong>Status:</strong> <span class="status ${order.isPaid ? 'status-paid' : 'status-pending'}">${order.isPaid ? 'Paid' : 'Payment Pending'}</span>
                    </div>
                    <div style="text-align: right;">
                        <strong>ShopZop</strong><br>
                        123 Fashion Street<br>
                        Mumbai, Maharashtra 400001<br>
                        India<br>
                        📞 +91 98765 43210<br>
                        ✉️ support@shopzop.com
                    </div>
                </div>

                <div class="section">
                    <h3>📍 Shipping Address</h3>
                    <p>
                        ${order.shippingAddress.street}<br>
                        ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}<br>
                        ${order.shippingAddress.country}
                    </p>
                </div>

                <div class="section">
                    <h3>📦 Order Items</h3>
                    <table class="items-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.orderItems.map(item => `
                                <tr>
                                    <td>${item.name}</td>
                                    <td>${item.qty}</td>
                                    <td>${formatCurrency(item.price)}</td>
                                    <td>${formatCurrency(item.qty * item.price)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <div class="total-section">
                    <div class="total-row">
                        <span class="total-label">Subtotal:</span>
                        <span class="total-value">${formatCurrency(order.itemsPrice)}</span>
                    </div>
                    <div class="total-row">
                        <span class="total-label">Shipping:</span>
                        <span class="total-value">${order.shippingPrice === 0 ? 'FREE' : formatCurrency(order.shippingPrice)}</span>
                    </div>
                    <div class="total-row">
                        <span class="total-label">GST (18%):</span>
                        <span class="total-value">${formatCurrency(order.taxPrice)}</span>
                    </div>
                    <div class="total-row" style="border-top: 2px solid #4f46e5; padding-top: 10px; margin-top: 10px;">
                        <span class="total-label" style="font-size: 18px;">Total:</span>
                        <span class="total-value" style="font-size: 18px; color: #4f46e5;">${formatCurrency(order.totalPrice)}</span>
                    </div>
                </div>

                <div class="section">
                    <h3>💳 Payment Information</h3>
                    <p><strong>Payment Method:</strong> ${order.paymentMethod === 'COD' ? 'Cash on Delivery - Pay when you receive' : 'Paid Online'}</p>
                    ${order.paymentMethod === 'COD' ? '<p><strong>Expected Delivery:</strong> 3-5 business days</p>' : ''}
                </div>

                <div class="footer">
                    <p>Thank you for shopping with ShopZop! 🛍️</p>
                    <p>This is a computer-generated invoice and does not require a signature.</p>
                    <p>GSTIN: 27AAAPL1234C1ZV | PAN: AAAPL1234C</p>
                </div>
            </div>
        </body>
        </html>
    `;

    // Create a new window and print
    const printWindow = window.open('', '_blank');
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    
    // Wait for content to load, then print
    printWindow.onload = () => {
        setTimeout(() => {
            printWindow.print();
        }, 500);
    };
};

export const downloadInvoicePDF = (order) => {
    generateInvoicePDF(order);
};
