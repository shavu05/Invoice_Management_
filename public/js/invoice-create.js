
// Global variables
let clients = [];
let schemes = [];
let ports = [];
let currentClient = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Load all reference data
        await loadReferenceData();
        
        // Set up event listeners
        setupEventListeners();
        
        // Add first empty item row
        addItemRow();
        
        // Set today's date as default invoice date
        document.getElementById('invoice-date').valueAsDate = new Date();
        
        // Generate a default invoice number
        generateInvoiceNumber();
        
    } catch (error) {
        console.error('Initialization error:', error);
        alert('Failed to initialize application: ' + error.message);
    }
});

// Load all reference data from API
async function loadReferenceData() {
    try {
        // Fetch all data in parallel
        const [clientsRes, schemesRes, portsRes] = await Promise.all([
            fetch('/api/clients'),
            fetch('/api/schemes'),
            fetch('/api/ports')
        ]);
        
        // Check for errors
        if (!clientsRes.ok) throw new Error('Failed to fetch clients');
        if (!schemesRes.ok) throw new Error('Failed to fetch schemes');
        if (!portsRes.ok) throw new Error('Failed to fetch ports');
        
        // Parse responses
        clients = await clientsRes.json();
        schemes = await schemesRes.json();
        ports = await portsRes.json();
        
        // Populate client dropdown
        populateClientSelect();
        
    } catch (error) {
        console.error('Error loading reference data:', error);
        throw error;
    }
}

// Set up event listeners
function setupEventListeners() {
    // Client selection change
    const clientSelect = document.getElementById('client-select');
    if (clientSelect) {
        clientSelect.addEventListener('change', onClientChange);
    }
    
    // Form submission
    const invoiceForm = document.getElementById('invoice-form');
    if (invoiceForm) {
        invoiceForm.addEventListener('submit', onSubmitInvoice);
    }

    // Add item button
    const addItemBtn = document.querySelector('.add-item-btn');
    if (addItemBtn) {
        addItemBtn.addEventListener('click', addItemRow);
    }

    // Calculate amounts when inputs change
    document.addEventListener('input', function(e) {
        if (e.target.matches('input[name="s_bill_count[]"], input[name="rate[]"]')) {
            const row = e.target.closest('tr');
            if (row) calculateAmount(row);
        }
    });
}

// Populate client dropdown
function populateClientSelect() {
    const select = document.getElementById('client-select');
    if (!select) return;
    
    select.innerHTML = '<option value="">Select Client</option>' + 
        clients.map(client => 
            `<option value="${client.id}">${client.company_name}</option>`
        ).join('');
}

// Handle client selection change
function onClientChange() {
    const clientId = this.value;
    currentClient = clients.find(c => c.id == clientId);
    
    if (currentClient) {
        document.getElementById('client-gst').value = currentClient.gst_number || '';
        document.getElementById('client-address').value = currentClient.address || '';
    } else {
        document.getElementById('client-gst').value = '';
        document.getElementById('client-address').value = '';
    }
    
    // Recalculate taxes when client changes (GST might change)
    calculateTotal();
}

// Generate a default invoice number
function generateInvoiceNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    document.getElementById('invoice-number').value = `INV-${year}${month}${day}-${randomNum}`;
}

// Add a new item row to the invoice
function addItemRow() {
    const tbody = document.getElementById('invoice-items-body');
    const rowCount = tbody.querySelectorAll('tr').length;
    
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><input type="text" name="sr_no[]" value="${rowCount + 1}" readonly></td>
        <td>
            <select name="scheme[]" class="form-control" required>
                <option value="">Select Scheme</option>
                ${schemes.map(s => `<option value="${s.id}">${s.scheme_name}</option>`).join('')}
            </select>
        </td>
        <td><input type="text" name="shipping_bill_no[]" class="form-control" required></td>
        <td><input type="date" name="shipping_date[]" class="form-control" required></td>
        <td>
            <select name="port[]" class="form-control" required>
                <option value="">Select Port</option>
                ${ports.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
            </select>
        </td>
        <td><input type="number" name="s_bill_count[]" class="form-control" value="1" min="1" required></td>
        <td><input type="number" name="rate[]" class="form-control" value="0" min="0" step="0.01" required></td>
        <td class="amount-cell">0.00</td>
        <td><button type="button" class="btn btn-danger delete-btn" onclick="removeItemRow(this)"><i class="fas fa-trash"></i></button></td>
    `;
    
    tbody.appendChild(row);
    
    // Set default date to today
    row.querySelector('input[name="shipping_date[]"]').valueAsDate = new Date();
    
    // Focus on the first input field
    row.querySelector('select[name="scheme[]"]').focus();
}

// Remove an item row
function removeItemRow(button) {
    if (confirm('Are you sure you want to remove this item?')) {
        const row = button.closest('tr');
        row.remove();
        updateSerialNumbers();
        calculateTotal();
    }
}

// Update serial numbers after row removal
function updateSerialNumbers() {
    document.querySelectorAll('#invoice-items-body tr').forEach((row, index) => {
        row.querySelector('input[name="sr_no[]"]').value = index + 1;
    });
}

// Calculate amount for a single row
function calculateAmount(row) {
    const quantity = parseFloat(row.querySelector('input[name="s_bill_count[]"]').value) || 0;
    const rate = parseFloat(row.querySelector('input[name="rate[]"]').value) || 0;
    const amount = (quantity * rate).toFixed(2);
    
    row.querySelector('.amount-cell').textContent = amount;
    calculateTotal();
}

// Calculate total amounts and taxes
function calculateTotal() {
    const amounts = Array.from(document.querySelectorAll('.amount-cell'))
        .map(cell => parseFloat(cell.textContent) || 0);
    
    const subTotal = amounts.reduce((sum, amount) => sum + amount, 0);
    
    // GST Calculation - Assuming company is in Maharashtra (state code 27)
    const companyStateCode = '27';
    const clientGST = document.getElementById('client-gst').value || '';
    const clientStateCode = clientGST.substring(0, 2);
    
    let cgst = 0, sgst = 0, igst = 0;
    
    if (clientStateCode && clientStateCode === companyStateCode) {
        // Intra-state - CGST + SGST (9% each)
        cgst = subTotal * 0.09;
        sgst = subTotal * 0.09;
    } else if (clientStateCode) {
        // Inter-state - IGST (18%)
        igst = subTotal * 0.18;
    }
    
    const total = subTotal + cgst + sgst + igst;
    
    // Update UI
    document.getElementById('sub-total').textContent = subTotal.toFixed(2);
    document.getElementById('cgst-amt').textContent = cgst.toFixed(2);
    document.getElementById('sgst-amt').textContent = sgst.toFixed(2);
    document.getElementById('igst-amt').textContent = igst.toFixed(2);
    document.getElementById('total-amount').textContent = total.toFixed(2);
}

// Handle form submission
async function onSubmitInvoice(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    
    try {
        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        
        // Validate form
        if (!validateForm()) {
            throw new Error('Please fill all required fields');
        }
        
        // Prepare invoice data
        const invoiceData = prepareInvoiceData();
        
        // Generate and download PDF
        await generatePDF(invoiceData);
        
        // Optionally save to database
        await saveInvoiceToDatabase(invoiceData);
        
        // Show success message
        alert('Invoice generated successfully!');
        
    } catch (error) {
        console.error('Error creating invoice:', error);
        alert('Error: ' + error.message);
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-file-pdf"></i> Generate Invoice';
    }
}

// Validate the form
function validateForm() {
    // Check client is selected
    if (!currentClient) {
        alert('Please select a client');
        return false;
    }
    
    // Check at least one item exists
    const items = document.querySelectorAll('#invoice-items-body tr');
    if (items.length === 0) {
        alert('Please add at least one item');
        return false;
    }
    
    // Check all items have valid data
    let isValid = true;
    items.forEach(row => {
        const scheme = row.querySelector('select[name="scheme[]"]').value;
        const billNo = row.querySelector('input[name="shipping_bill_no[]"]').value;
        const port = row.querySelector('select[name="port[]"]').value;
        const rate = parseFloat(row.querySelector('input[name="rate[]"]').value);
        const shippingDate = row.querySelector('input[name="shipping_date[]"]').value;
        
        if (!scheme || !billNo || !port || isNaN(rate) || rate <= 0 || !shippingDate) {
            isValid = false;
            row.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
        } else {
            row.style.backgroundColor = '';
        }
    });
    
    if (!isValid) {
        alert('Please fill all required fields for each item');
        return false;
    }
    
    // Check HSN code is provided
    if (!document.getElementById('invoice-hsncode').value) {
        alert('Please enter HSN/SAC code');
        return false;
    }
    
    return true;
}

// Prepare invoice data from form
function prepareInvoiceData() {
    const items = Array.from(document.querySelectorAll('#invoice-items-body tr')).map(row => {
        return {
            sr_no: row.querySelector('input[name="sr_no[]"]').value,
            scheme_id: row.querySelector('select[name="scheme[]"]').value,
            scheme_name: schemes.find(s => s.id == row.querySelector('select[name="scheme[]"]').value)?.scheme_name || '',
            shipping_bill_no: row.querySelector('input[name="shipping_bill_no[]"]').value,
            shipping_date: row.querySelector('input[name="shipping_date[]"]').value,
            port_id: row.querySelector('select[name="port[]"]').value,
            port_name: ports.find(p => p.id == row.querySelector('select[name="port[]"]').value)?.name || '',
            s_bill_count: row.querySelector('input[name="s_bill_count[]"]').value,
            rate: row.querySelector('input[name="rate[]"]').value,
            amount: row.querySelector('.amount-cell').textContent
        };
    });
    
    return {
        client_id: currentClient.id,
        client_name: currentClient.company_name,
        client_gst: currentClient.gst_number,
        client_address: currentClient.address,
        invoice_number: document.getElementById('invoice-number').value,
        invoice_date: document.getElementById('invoice-date').value,
        hsn_code: document.getElementById('invoice-hsncode').value,
        items: items,
        subtotal: document.getElementById('sub-total').textContent,
        cgst: document.getElementById('cgst-amt').textContent,
        sgst: document.getElementById('sgst-amt').textContent,
        igst: document.getElementById('igst-amt').textContent,
        total: document.getElementById('total-amount').textContent,
        amount_in_words: numberToWords(parseFloat(document.getElementById('total-amount').textContent))
    };
}

// Generate PDF using browser print functionality
async function generatePDF(invoiceData) {
    return new Promise((resolve) => {
        // Create a temporary div for the invoice template
        const invoiceTemplate = document.createElement('div');
        invoiceTemplate.id = 'printable-invoice';
        invoiceTemplate.style.width = '210mm';
        invoiceTemplate.style.margin = '0 auto';
        invoiceTemplate.style.padding = '20px';
        invoiceTemplate.style.fontFamily = 'Arial, sans-serif';
        invoiceTemplate.style.color = '#333';
        
        // Populate the invoice template
        invoiceTemplate.innerHTML = `
            <style>
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #printable-invoice, #printable-invoice * {
                        visibility: visible;
                    }
                    #printable-invoice {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                }
                .invoice-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 20px;
                }
                .company-info h1 {
                    margin: 0;
                    color: #333;
                    font-size: 24px;
                }
                .invoice-info {
                    text-align: right;
                }
                .divider {
                    border-top: 1px solid #eee;
                    margin: 20px 0;
                }
                .client-info {
                    margin-bottom: 20px;
                }
                .invoice-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                }
                .invoice-table th {
                    background: #333;
                    color: white;
                    padding: 10px;
                    text-align: left;
                }
                .invoice-table td {
                    padding: 10px;
                    border-bottom: 1px solid #eee;
                }
                .text-right {
                    text-align: right;
                }
                .total-row {
                    font-weight: bold;
                }
                .footer {
                    margin-top: 50px;
                    font-size: 12px;
                    text-align: center;
                }
            </style>
            
            <div class="invoice-header">
                <div class="company-info">
                    <h1>TAX INVOICE</h1>
                    <p>KWICK EXIM SERVICES</p>
                    <p>K. K. Office No. N-2, Roy Apartment, Next To K. K. Restaurant, Near Air Cargo Complex, Sahar, Andheri (East), Mumbai 400 099.</p>
                    <p>GSTIN: 27AZIPS3388QZ7</p>
                </div>
                <div class="invoice-info">
                    <p><strong>Invoice No:</strong> ${invoiceData.invoice_number}</p>
                    <p><strong>Date:</strong> ${formatDate(invoiceData.invoice_date)}</p>
                    <p><strong>HSN/SAC:</strong> ${invoiceData.hsn_code}</p>
                </div>
            </div>
            
            <div class="divider"></div>
            
            <div class="client-info">
                <h3>Bill To:</h3>
                <p>${invoiceData.client_name}</p>
                <p>${invoiceData.client_address}</p>
                <p>GSTIN: ${invoiceData.client_gst || 'Not Provided'}</p>
            </div>
            
            <table class="invoice-table">
                <thead>
                    <tr>
                        <th>Sr No</th>
                        <th>Scheme</th>
                        <th>Shipping Bill</th>
                        <th>Date</th>
                        <th>Port</th>
                        <th class="text-right">No. of Sbills/Lic.</th>
                        <th class="text-right">Rate (₹)</th>
                        <th class="text-right">Amount (₹)</th>
                    </tr>
                </thead>
                <tbody>
                    ${invoiceData.items.map(item => `
                        <tr>
                            <td>${item.sr_no}</td>
                            <td>${item.scheme_name}</td>
                            <td>${item.shipping_bill_no}</td>
                            <td>${formatDate(item.shipping_date)}</td>
                            <td>${item.port_name}</td>
                            <td class="text-right">${item.s_bill_count}</td>
                            <td class="text-right">${parseFloat(item.rate).toFixed(2)}</td>
                            <td class="text-right">${item.amount}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <table style="width: 50%; margin-left: auto;">
                <tr>
                    <td class="text-right">Subtotal:</td>
                    <td class="text-right">₹ ${invoiceData.subtotal}</td>
                </tr>
                ${parseFloat(invoiceData.cgst) > 0 ? `
                <tr>
                    <td class="text-right">CGST (9%):</td>
                    <td class="text-right">₹ ${invoiceData.cgst}</td>
                </tr>
                ` : ''}
                ${parseFloat(invoiceData.sgst) > 0 ? `
                <tr>
                    <td class="text-right">SGST (9%):</td>
                    <td class="text-right">₹ ${invoiceData.sgst}</td>
                </tr>
                ` : ''}
                ${parseFloat(invoiceData.igst) > 0 ? `
                <tr>
                    <td class="text-right">IGST (18%):</td>
                    <td class="text-right">₹ ${invoiceData.igst}</td>
                </tr>
                ` : ''}
                <tr class="total-row">
                    <td class="text-right">Total Amount:</td>
                    <td class="text-right">₹ ${invoiceData.total}</td>
                </tr>
            </table>
            
            <p><strong>Amount in words:</strong> ${invoiceData.amount_in_words}</p>
            
            <div class="footer">
                <p> KWICK EXIM SERVICES</p>
                <p>Authorized Signatory</p>
                <p>This is a computer generated invoice. No signature required.</p>
            </div>
        `;
        
        // Append to body
        document.body.appendChild(invoiceTemplate);
        
        // Print the invoice
        window.print();
        
        // Remove the template after printing
        setTimeout(() => {
            document.body.removeChild(invoiceTemplate);
            resolve();
        }, 1000);
    });
}

// Helper function to format dates
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
}

// Save invoice data to database using invoice history endpoint
async function saveInvoiceToDatabase(data) {
    try {
        console.log('Saving invoice data:', data);
        
        const response = await fetch('/api/invoice-history', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Server error: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Invoice saved successfully:', result);
        return result;
        
    } catch (error) {
        console.error('Error saving invoice to database:', error);
        throw new Error('Failed to save invoice: ' + error.message);
    }
}

// Format date in dd-MMM-yyyy format, e.g. 27-May-2025
function formatDate(dateStr) {
    const date = new Date(dateStr);
    if (isNaN(date)) return dateStr;
    
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options).replace(/ /g, '-');
}

// Convert number to words (Indian numbering system)
function numberToWords(amount) {
    // Simple conversion for demonstration; for full version use a library or implement full logic
    
    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const scales = ['', 'Thousand', 'Lakh', 'Crore'];
    
    if (amount === 0) return 'Zero';
    
    let words = [];
    let numStr = amount.toFixed(2).toString();
    let [intPart, decimalPart] = numStr.split('.');
    let n = parseInt(intPart, 10);
    
    function getTwoDigitWords(n) {
        if (n < 10) return units[n];
        if (n >= 10 && n < 20) return teens[n - 10];
        let t = Math.floor(n / 10);
        let u = n % 10;
        return tens[t] + (u ? ' ' + units[u] : '');
    }
    
    // Break number into groups as per Indian system
    let groups = [];
    while (n > 0) {
        groups.push(n % 1000);
        n = Math.floor(n / 1000);
    }
    
    for (let i = groups.length - 1; i >= 0; i--) {
        let group = groups[i];
        if (group === 0) continue;
        
        let h = Math.floor(group / 100);
        let rem = group % 100;
        let part = '';
        if (h > 0) part += units[h] + ' Hundred ';
        if (rem > 0) part += getTwoDigitWords(rem) + ' ';
        if (scales[i]) part += scales[i] + ' ';
        
        words.push(part.trim());
    }
    
    // Decimal part (paise)
    let paiseWords = '';
    let paise = parseInt(decimalPart || '0', 10);
    if (paise > 0) {
        paiseWords = 'and ' + getTwoDigitWords(paise) + ' Paise';
    }
    
    return words.join(' ').trim() + ' ' + paiseWords;
}

// Make removeItemRow available globally
window.removeItemRow = removeItemRow;
document.addEventListener("DOMContentLoaded", () => {
    const backBtn = document.getElementById("back-to-dashboard");
    if (!backBtn) return;  // Exit if no back button found

    backBtn.addEventListener("click", () => {
        const user = JSON.parse(localStorage.getItem("user"));

        if (!user) {
            // If no user found in localStorage, redirect to login
            window.location.href = "/html/login.html";
            return;
        }

        if (user.role === "admin") {
            window.location.href = "/html/dashboard.html";
        } else {
            window.location.href = "/html/logindashboard.html";
        }
    });
});
