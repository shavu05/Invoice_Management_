
const puppeteer = require('puppeteer');

async function generateInvoicePDF(data) {
    const { invoice_number, client_name, client_address, invoice_date, items } = data;

    const html = `
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        </style>
    </head>
    <body>
        <h1>Invoice #${invoice_number}</h1>
        <p><strong>Client:</strong> ${client_name}</p>
        <p><strong>Address:</strong> ${client_address}</p>
        <p><strong>Date:</strong> ${invoice_date}</p>

        <table>
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${items.map(item => `
                    <tr>
                        <td>${item.name}</td>
                        <td>${item.qty}</td>
                        <td>${item.rate}</td>
                        <td>${(item.qty * item.rate).toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </body>
    </html>
    `;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();

    return pdfBuffer;
}

module.exports = { generateInvoicePDF };
