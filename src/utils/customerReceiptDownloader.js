/**
 * customerReceiptDownloader.js
 * Generates an official printable Customer Booking / Installment Payment Receipt.
 */
export const downloadCustomerReceiptPDF = (txn, companyName = 'Real Estate Developers') => {
  if (!txn) return;

  const receiptNo = txn.receiptNo || `REC-${Date.now().toString().slice(-6)}`;
  const dateStr = txn.date 
    ? new Date(txn.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN');

  const amountStr = txn.amount || '₹0';

  const printWindow = window.open('', '_blank', 'width=850,height=900');
  if (!printWindow) {
    alert('Please allow popups to view or download the Payment Receipt.');
    return;
  }

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Customer Payment Receipt - ${receiptNo}</title>
  <style>
    @page { size: A4; margin: 15mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      margin: 0;
      padding: 24px;
      background: #fff;
      font-size: 13px;
      line-height: 1.5;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0f766e;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .brand-title {
      font-size: 22px;
      font-weight: 800;
      color: #102a2e;
      margin: 0;
      text-transform: uppercase;
    }
    .brand-sub {
      font-size: 11px;
      color: #64748b;
      margin-top: 4px;
    }
    .receipt-title {
      text-align: right;
    }
    .receipt-title h1 {
      margin: 0;
      font-size: 20px;
      color: #0f766e;
      text-transform: uppercase;
      font-weight: 900;
    }
    .badge-cleared {
      display: inline-block;
      margin-top: 6px;
      padding: 3px 10px;
      background: #ecfdf5;
      color: #059669;
      border: 1px solid #a7f3d0;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
    }
    .meta-grid {
      display: flex;
      justify-content: space-between;
      gap: 20px;
      margin-bottom: 24px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
    }
    .meta-col h3 {
      font-size: 11px;
      text-transform: uppercase;
      color: #64748b;
      margin: 0 0 6px 0;
      font-weight: 700;
    }
    .meta-col p {
      margin: 2px 0;
      font-weight: 600;
      color: #0f172a;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    th {
      background: #102a2e;
      color: #fff;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 11px;
      padding: 10px 14px;
      text-align: left;
    }
    td {
      padding: 12px 14px;
      border-bottom: 1px solid #e2e8f0;
      color: #334155;
    }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .totals-area {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 30px;
    }
    .totals-box {
      width: 280px;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px 18px;
      background: #f8fafc;
    }
    .totals-grand {
      display: flex;
      justify-content: space-between;
      font-size: 16px;
      font-weight: 900;
      color: #0f766e;
    }
    .footer {
      border-top: 1px dashed #cbd5e1;
      padding-top: 16px;
      text-align: center;
      color: #94a3b8;
      font-size: 11px;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
    }
    .btn-bar {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-bottom: 16px;
    }
    .btn {
      background: #0f766e;
      color: #fff;
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 12px;
      cursor: pointer;
    }
    .btn:hover { background: #0d5f58; }
  </style>
</head>
<body>
  <div class="no-print btn-bar">
    <button class="btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
  </div>

  <div class="header">
    <div>
      <h2 class="brand-title">${companyName}</h2>
      <div class="brand-sub">Real Estate Project Developer & Promoters</div>
      <div class="brand-sub">Official Escrow Ledger & Booking Acknowledgment</div>
    </div>
    <div class="receipt-title">
      <h1>PAYMENT RECEIPT</h1>
      <div style="font-weight: bold; color: #334155; margin-top: 2px;"># ${receiptNo}</div>
      <span class="badge-cleared">● ${txn.status || 'Cleared'}</span>
    </div>
  </div>

  <div class="meta-grid">
    <div class="meta-col">
      <h3>Received From (Buyer):</h3>
      <p style="font-size: 14px; font-weight: 800; color: #102a2e;">${txn.customer || 'Valued Customer'}</p>
      <p>Allocated Inventory: <strong>${txn.plot || 'Selected Plot / Unit'}</strong></p>
    </div>
    <div class="meta-col" style="text-align: right;">
      <h3>Receipt Details:</h3>
      <p>Date of Clearance: <strong>${dateStr}</strong></p>
      <p>Banking Mode / Channel: <strong>${txn.mode || 'Direct Wire / UPI'}</strong></p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 50px;" class="text-center">Sr.</th>
        <th>Particulars / Payment Milestone</th>
        <th class="text-center">Inventory Tag</th>
        <th class="text-right">Amount Realized</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="text-center">1</td>
        <td>
          <div style="font-weight: 800; color: #102a2e;">${txn.type || 'Plot Booking Advance Token'}</div>
          <div style="font-size: 11px; color: #64748b;">Direct Escrow Credit under Sales Agreement</div>
        </td>
        <td class="text-center" style="font-weight: bold; color: #0f766e;">${txn.plot || 'Unit'}</td>
        <td class="text-right" style="font-weight: 900; color: #0f766e; font-size: 14px;">${amountStr}</td>
      </tr>
    </tbody>
  </table>

  <div class="totals-area">
    <div class="totals-box">
      <div class="totals-grand">
        <span>Total Realized:</span>
        <span>${amountStr}</span>
      </div>
    </div>
  </div>

  <div class="footer">
    <p>This payment receipt acknowledges valid clearance into escrow accounts. Subject to realization of instrument.</p>
    <p>© ${new Date().getFullYear()} ${companyName}. Generated via Real Estate SaaS Platform.</p>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

