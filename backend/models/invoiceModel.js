
const { invoicePool } = require('../config/database');

async function createInvoice(invoiceData) {
    const {
        invoice_number,
        client_id,
        invoice_date,
        hsn_sac_code,
        sub_total,
        cgst_amt,
        sgst_amt,
        igst_amt,
        total_amount,
        items
    } = invoiceData;

    try {
        await invoicePool.query('BEGIN');

        const invoiceResult = await invoicePool.query(
            'INSERT INTO invoices (invoice_number, client_id, invoice_date, hsn_sac_code, sub_total, cgst_amount, sgst_amount, igst_amount, total_amount) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
            [invoice_number, client_id, invoice_date, hsn_sac_code, sub_total, cgst_amt, sgst_amt, igst_amt, total_amount]
        );

        const invoiceId = invoiceResult.rows[0].id;

        for (const item of items) {
            await invoicePool.query(
                'INSERT INTO invoice_items (invoice_id, sr_no, scheme, shipping_bill_no, shipping_date, port, s_bill_count, rate, amount) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
                [invoiceId, item.sr_no, item.scheme, item.shipping_bill_no, item.shipping_date, item.port, item.s_bill_count, item.rate, (parseFloat(item.s_bill_count) * parseFloat(item.rate)).toFixed(2)]
            );
        }

        await invoicePool.query('COMMIT');
        return invoiceId;

    } catch (error) {
        await invoicePool.query('ROLLBACK');
        console.error('Error creating invoice:', error);
        throw error;
    }
}

module.exports = { createInvoice };