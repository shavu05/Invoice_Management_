function generateInvoiceHtmlFromForm(formData) {

    const clientName = document.querySelector('#client-select option:checked').textContent;
    const invoiceNumber = formData.get('invoice_number');
    const invoiceDate = formData.get('invoice_date');

    // Gather item rows
    const rows = Array.from(document.querySelectorAll('#invoice-items-body tr')).map(row => {
        const cells = row.querySelectorAll('input, select');
        return `
            <tr>
                ${Array.from(cells).map(cell => `<td>${cell.value}</td>`).join('')}
            </tr>`;
    }).join('');

    return `
        <html>
        <head>
            <style>
                table, th, td { border: 1px solid black; border-collapse: collapse; padding: 5px; }
                body { font-family: Arial; margin: 20px; }
            </style>
        </head>
        <body>
            <h2>Invoice</h2>
            <p><strong>Client:</strong> ${clientName}</p>
            <p><strong>Invoice No:</strong> ${invoiceNumber}</p>
            <p><strong>Date:</strong> ${invoiceDate}</p>
            <table>
                <thead><tr><th>Sr No</th><th>Scheme</th><th>SB No</th><th>Date</th><th>Port</th><th>Count</th><th>Rate</th><th>Amount</th></tr></thead>
                <tbody>${rows}</tbody>
            </table>
        </body>
        </html>`;
}
