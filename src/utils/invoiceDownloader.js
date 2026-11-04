/**
 * invoiceDownloader.js
 * Generates an official, printable Tax Invoice & Receipt HTML document and triggers print/save as PDF.
 */
export const downloadTaxInvoicePDF = (txn) => {
  if (!txn) return;

  const invoiceNo = txn.invoiceNo || `INV-${Date.now().toString().slice(-6)}`;
  const dateStr = txn.billingDate 
    ? new Date(txn.billingDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN');
  
  const baseAmount = Number(txn.amount || (txn.total ? Math.round(txn.total / 1.18) : 0));
  const gstAmount = Number(txn.gst || (txn.total ? txn.total - baseAmount : 0));
  const totalAmount = Number(txn.total || baseAmount + gstAmount);

  const printWindow = window.open('', '_blank', 'width=850,height=900');
  if (!printWindow) {
    alert('Please allow popups to view or download the Tax Invoice.');
    return;
  }

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Tax Invoice - ${invoiceNo}</title>
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
      font-size: 24px;
      font-weight: 800;
      color: #102a2e;
      margin: 0;
      letter-spacing: -0.5px;
    }
    .brand-sub {
      font-size: 11px;
      color: #64748b;
      margin-top: 4px;
      font-weight: 500;
    }
    .invoice-title {
      text-align: right;
    }
    .invoice-title h1 {
      margin: 0;
      font-size: 22px;
      color: #0f766e;
      text-transform: uppercase;
      font-weight: 900;
      letter-spacing: 0.5px;
    }
    .badge-paid {
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
    .totals-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 12px;
      color: #475569;
    }
    .totals-grand {
      display: flex;
      justify-content: space-between;
      padding-top: 10px;
      margin-top: 10px;
      border-top: 2px solid #0f766e;
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
      <h2 class="brand-title">DIGICODERS SAAS CRM</h2>
      <div class="brand-sub">Enterprise Multi-Tenant Real Estate Platform</div>
      <div class="brand-sub">GSTIN: 09AAACD1234F1Z8 • support@crm.com</div>
    </div>
    <div class="invoice-title">
      <h1>TAX INVOICE</h1>
      <div style="font-weight: bold; color: #334155; margin-top: 2px;"># ${invoiceNo}</div>
      <span class="badge-paid">● Payment Successful</span>
    </div>
  </div>

  <div class="meta-grid">
    <div class="meta-col">
      <h3>Billed To (Client / Tenant):</h3>
      <p style="font-size: 14px; font-weight: 800; color: #102a2e;">${txn.company || 'Customer Company'}</p>
      <p>Authorized Rep: ${txn.ownerName || 'Company Administrator'}</p>
      <p>Billing Cycle: Annual / Prepaid</p>
    </div>
    <div class="meta-col" style="text-align: right;">
      <h3>Invoice Details:</h3>
      <p>Date of Issue: <strong>${dateStr}</strong></p>
      <p>Payment Method: <strong>${txn.method || 'Razorpay Gateway'}</strong></p>
      <p>Status: <strong style="color: #059669;">Settled (Verified)</strong></p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 50px;" class="text-center">Sr.</th>
        <th>Description / Service Package</th>
        <th class="text-center">Plan Tier</th>
        <th class="text-center">HSN/SAC</th>
        <th class="text-right">Taxable Value</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="text-center">1</td>
        <td>
          <div style="font-weight: 800; color: #102a2e;">Cloud SaaS CRM License Subscription</div>
          <div style="font-size: 11px; color: #64748b;">Full suite plot management, VoIP dialing & channel partner portal allocation</div>
        </td>
        <td class="text-center" style="font-weight: bold; text-transform: capitalize;">${txn.plan || 'Standard'}</td>
        <td class="text-center font-mono">998313</td>
        <td class="text-right" style="font-weight: bold;">₹${baseAmount.toLocaleString('en-IN')}</td>
      </tr>
    </tbody>
  </table>

  <div class="totals-area">
    <div class="totals-box">
      <div class="totals-row">
        <span>Taxable Subtotal:</span>
        <span style="font-weight: 700;">₹${baseAmount.toLocaleString('en-IN')}</span>
      </div>
      <div class="totals-row">
        <span>CGST (9%):</span>
        <span>₹${Math.round(gstAmount / 2).toLocaleString('en-IN')}</span>
      </div>
      <div class="totals-row">
        <span>SGST (9%):</span>
        <span>₹${Math.round(gstAmount / 2).toLocaleString('en-IN')}</span>
      </div>
      <div class="totals-grand">
        <span>Total Paid:</span>
        <span>₹${totalAmount.toLocaleString('en-IN')}</span>
      </div>
    </div>
  </div>

  <div class="footer">
    <p>This is a computer generated official tax invoice and electronic payment receipt under IT Act 2000. No physical signature required.</p>
    <p>© ${new Date().getFullYear()} DigiCoders Real Estate SaaS CRM. All Rights Reserved.</p>
  </div>

  <script>
    // Auto-trigger print dialog for immediate PDF download
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

/**
 * Utility to download raw data arrays as CSV files
 */
export const downloadCSV = (filename, rows) => {
  if (!rows || !rows.length) return;
  const separator = ',';
  const keys = Object.keys(rows[0]);
  const csvContent =
    keys.join(separator) +
    '\n' +
    rows.map(row => {
      return keys.map(k => {
        let cell = row[k] === null || row[k] === undefined ? '' : row[k];
        cell = cell instanceof Date ? cell.toLocaleString() : cell.toString().replace(/"/g, '""');
        if (cell.search(/("|,|\n)/g) >= 0) cell = `"${cell}"`;
        return cell;
      }).join(separator);
    }).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

