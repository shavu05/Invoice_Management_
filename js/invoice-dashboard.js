// DOM Elements
const clientSelect = document.getElementById('client-select');
const clientGstInput = document.getElementById('client-gst');
const clientAddressInput = document.getElementById('client-address');
const invoiceForm = document.getElementById('invoice-form');
const invoiceItemsBody = document.getElementById('invoice-items-body');
const subTotalSpan = document.getElementById('sub-total');
const cgstAmtSpan = document.getElementById('cgst-amt');
const sgstAmtSpan = document.getElementById('sgst-amt');
const igstAmtSpan = document.getElementById('igst-amt');
const totalAmountSpan = document.getElementById('total-amount');
const invoiceHistoryList = document.getElementById('invoice-history-list');
const searchInvoiceInput = document.getElementById('search-invoice');
const filterFromDate = document.getElementById('filter-from-date');
const filterToDate = document.getElementById('filter-to-date');

// API Endpoints
const API_BASE_URL = 'http://localhost:3001/api'; // Update with your backend URL
const CLIENTS_API = `${API_BASE_URL}/clients`;
const SCHEMES_API = `${API_BASE_URL}/schemes`;
const PORTS_API = `${API_BASE_URL}/ports`;
const INVOICES_API = `${API_BASE_URL}/invoices`;

// Global variables
let clients = [];
let schemes = [];
let ports = [];
let invoices = [];
let currentUser = {};

// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Load user data (you might have this from login)
        currentUser = await getCurrentUser();
        
        // Load all necessary data
        await Promise.all([
            loadClients(),
            loadSchemes(),
            loadPorts(),
            loadInvoiceHistory()
        ]);
        
        // Set current date as default for invoice date
        document.getElementById('invoice-date').valueAsDate = new Date();
        
        // Generate a random invoice number
        document.getElementById('invoice-number').value = `INV-${Math.floor(1000 + Math.random() * 9000)}`;
        
        // Add first item row
        addItemRow();
        
        // Set default HSN code
        document.getElementById('invoice-hsncode').value = '996713';
        
    } catch (error) {
        console.error('Initialization error:', error);
        showError('Failed to initialize the application. Please try again.');
    }
});

// Get current user (mock - replace with actual implementation)
async function getCurrentUser() {
    // In a real app, you might get this from session/localStorage
    return {
        id: 1,
        name: 'Admin User',
        email: 'admin@example.com',
        company: 'Export Management System'
    };
}

// Load clients for dropdown
async function loadClients() {
    try {
        const response = await fetch(CLIENTS_API, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        clients = await response.json();
        
        // Populate client dropdown
        clientSelect.innerHTML = '<option value="">Select Client</option>';
        clients.forEach(client => {
            const option = document.createElement('option');
            option.value = client.id;
            option.textContent = `${client.company_name} (${client.gst_number})`;
            option.dataset.gst = client.gst_number;
            option.dataset.address = client.address;
            clientSelect.appendChild(option);
        });
        
    } catch (error) {
        console.error('Error loading clients:', error);
        showError('Failed to load clients. Please try again.');
    }
}

// Load schemes for dropdown
async function loadSchemes() {
    try {
        const response = await fetch(SCHEMES_API, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        schemes = await response.json();
        
    } catch (error) {
        console.error('Error loading schemes:', error);
        showError('Failed to load schemes. Please try again.');
    }
}

// Load ports for dropdown
async function loadPorts() {
    try {
        const response = await fetch(PORTS_API, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        ports = await response.json();
        
    } catch (error) {
        console.error('Error loading ports:', error);
        showError('Failed to load ports. Please try again.');
    }
}

// Load invoice history
async function loadInvoiceHistory() {
    try {
        const response = await fetch(INVOICES_API, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        invoices = await response.json();
        renderInvoiceHistory();
        
    } catch (error) {
        console.error('Error loading invoice history:', error);
        showError('Failed to load invoice history. Please try again.');
    }
}

// Render invoice history table
function renderInvoiceHistory() {
    invoiceHistoryList.innerHTML = '';
    
    invoices.forEach(invoice => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${invoice.invoice_number}</td>
            <td>${invoice.client_name}</td>
            <td>${formatDate(invoice.invoice_date)}</td>
            <td>₹${invoice.total_amount.toFixed(2)}</td>
            <td>
                <button class="action-btn view-btn" data-id="${invoice.id}">View</button>
                <button class="action-btn download-btn" data-id="${invoice.id}">Download</button>
            </td>
        `;
        invoiceHistoryList.appendChild(row);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => viewInvoice(btn.dataset.id));
    });
    
    document.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', () => downloadInvoice(btn.dataset.id));
    });
}

// View invoice details
async function viewInvoice(invoiceId) {
    try {
        const response = await fetch(`${INVOICES_API}/${invoiceId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const invoice = await response.json();
        
        // Show invoice details in a modal or new page
        showInvoiceModal(invoice);
        
    } catch (error) {
        console.error('Error viewing invoice:', error);
        showError('Failed to view invoice details. Please try again.');
    }
}

// Download invoice as PDF
async function downloadInvoice(invoiceId) {
    try {
        const response = await fetch(`${INVOICES_API}/${invoiceId}/download`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice_${invoiceId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
    } catch (error) {
        console.error('Error downloading invoice:', error);
        showError('Failed to download invoice. Please try again.');
    }
}

// Client selection change handler
clientSelect.addEventListener('change', () => {
    const selectedOption = clientSelect.options[clientSelect.selectedIndex];
    
    if (selectedOption.value) {
        clientGstInput.value = selectedOption.dataset.gst || '';
        clientAddressInput.value = selectedOption.dataset.address || '';
    } else {
        clientGstInput.value = '';
        clientAddressInput.value = '';
    }
});

// Add new item row to invoice
function addItemRow() {
    const rowCount = invoiceItemsBody.querySelectorAll('tr').length;
    const rowId = `item-${rowCount + 1}`;
    
    const row = document.createElement('tr');
    row.id = rowId;
    row.innerHTML = `
        <td>${rowCount + 1}</td>
        <td>
            <select name="scheme" required class="scheme-select">
                <option value="">Select Scheme</option>
                ${schemes.map(scheme => `
                    <option value="${scheme.id}" 
                            data-code="${scheme.code}">
                        ${scheme.scheme_name} (${scheme.code})
                    </option>
                `).join('')}
            </select>
        </td>
        <td><input type="text" name="sb_no" placeholder="Shipping Bill No" required></td>
        <td><input type="date" name="date" required></td>
        <td>
            <select name="port" required class="port-select">
                <option value="">Select Port</option>
                ${ports.map(port => `
                    <option value="${port.id}" 
                            data-code="${port.code}">
                        ${port.port_name} (${port.code})
                    </option>
                `).join('')}
            </select>
        </td>
        <td><input type="number" name="quantity" min="1" value="1" required></td>
        <td><input type="number" name="rate" min="0" step="0.01" placeholder="0.00" required></td>
        <td class="amount">0.00</td>
        <td><button type="button" class="remove-btn" onclick="removeItemRow('${rowId}')">×</button></td>
    `;
    
    invoiceItemsBody.appendChild(row);
    
    // Set current date as default for item date
    row.querySelector('input[name="date"]').valueAsDate = new Date();
    
    // Add event listeners for calculations
    const quantityInput = row.querySelector('input[name="quantity"]');
    const rateInput = row.querySelector('input[name="rate"]');
    
    quantityInput.addEventListener('input', calculateRowAmount);
    rateInput.addEventListener('input', calculateRowAmount);
    
    // Initialize calculation for this row
    calculateRowAmount({ target: quantityInput });
}

// Remove item row from invoice
function removeItemRow(rowId) {
    const row = document.getElementById(rowId);
    if (row) {
        row.remove();
        updateRowNumbers();
        calculateInvoiceTotal();
    }
}

// Update row numbers after deletion
function updateRowNumbers() {
    const rows = invoiceItemsBody.querySelectorAll('tr');
    rows.forEach((row, index) => {
        row.cells[0].textContent = index + 1;
    });
}

// Calculate amount for a single row
function calculateRowAmount(event) {
    const row = event.target.closest('tr');
    if (!row) return;
    
    const quantity = parseFloat(row.querySelector('input[name="quantity"]').value) || 0;
    const rate = parseFloat(row.querySelector('input[name="rate"]').value) || 0;
    const amount = quantity * rate;
    
    row.querySelector('.amount').textContent = amount.toFixed(2);
    calculateInvoiceTotal();
}

// Calculate invoice totals (subtotal, taxes, grand total)
function calculateInvoiceTotal() {
    const rows = invoiceItemsBody.querySelectorAll('tr');
    let subtotal = 0;
    
    rows.forEach(row => {
        const amountText = row.querySelector('.amount').textContent;
        subtotal += parseFloat(amountText) || 0;
    });
    
    const cgst = subtotal * 0.09;
    const sgst = subtotal * 0.09;
   // const igst = subtotal * 0.18;
    const total = subtotal + cgst + sgst ;
    
    subTotalSpan.textContent = subtotal.toFixed(2);
    cgstAmtSpan.textContent = cgst.toFixed(2);
    sgstAmtSpan.textContent = sgst.toFixed(2);
    //igstAmtSpan.textContent = igst.toFixed(2);
    totalAmountSpan.textContent = total.toFixed(2);
}

// Submit invoice form
invoiceForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!validateInvoiceForm()) return;
    
    try {
        const formData = new FormData(invoiceForm);
        const selectedClient = clients.find(c => c.id == formData.get('client_id'));
        
        // Prepare invoice data
        const invoiceData = {
            invoice_number: formData.get('invoice_number'),
            client_id: formData.get('client_id'),
            invoice_date: formData.get('invoice_date'),
            hsn_sac_code: formData.get('invoice_hsncode'),
            items: []
        };
        
        // Collect items data
        const rows = invoiceItemsBody.querySelectorAll('tr');
        rows.forEach((row, index) => {
            invoiceData.items.push({
                sr_no: index + 1,
                scheme: row.querySelector('select[name="scheme"]').value,
                shipping_bill_no: row.querySelector('input[name="sb_no"]').value,
                shipping_date: row.querySelector('input[name="date"]').value,
                port: row.querySelector('select[name="port"]').value,
                s_bill_count: parseFloat(row.querySelector('input[name="quantity"]').value),
                rate: parseFloat(row.querySelector('input[name="rate"]').value)
            });
        });
        
        // Calculate totals
        const subtotal = parseFloat(subTotalSpan.textContent);
        const cgst_amt = parseFloat(cgstAmtSpan.textContent);
        const sgst_amt = parseFloat(sgstAmtSpan.textContent);
       // const igst_amt = parseFloat(igstAmtSpan.textContent);
        const total_amount = parseFloat(totalAmountSpan.textContent);
        
        // Add totals to invoice data
        invoiceData.sub_total = subtotal;
        invoiceData.cgst_amt = cgst_amt;
        invoiceData.sgst_amt = sgst_amt;
       // invoiceData.igst_amt = igst_amt;
        invoiceData.total_amount = total_amount;
        
        // Submit to backend
        const response = await fetch(INVOICES_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(invoiceData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Show success message
        showSuccess('Invoice created successfully!');
        
        // Reset form for new invoice
        resetInvoiceForm();
        
        // Reload invoice history
        await loadInvoiceHistory();
        
        // Download the PDF
        await downloadInvoice(result.invoice_id);
        
    } catch (error) {
        console.error('Error saving invoice:', error);
        showError('Failed to save invoice. Please try again.');
    }
});

// Validate invoice form before submission
function validateInvoiceForm() {
    if (!clientSelect.value) {
        showError('Please select a client');
        return false;
    }
    
    const rows = invoiceItemsBody.querySelectorAll('tr');
    if (rows.length === 0) {
        showError('Please add at least one item to the invoice');
        return false;
    }
    
    let isValid = true;
    rows.forEach(row => {
        if (!row.querySelector('select[name="scheme"]').value || 
            !row.querySelector('input[name="sb_no"]').value ||
            !row.querySelector('input[name="date"]').value ||
            !row.querySelector('select[name="port"]').value ||
            !row.querySelector('input[name="quantity"]').value ||
            !row.querySelector('input[name="rate"]').value) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        showError('Please fill all fields for all items');
        return false;
    }
    
    return true;
}

// Reset invoice form
function resetInvoiceForm() {
    invoiceForm.reset();
    invoiceItemsBody.innerHTML = '';
    addItemRow();
    document.getElementById('invoice-number').value = `INV-${Math.floor(1000 + Math.random() * 9000)}`;
    document.getElementById('invoice-date').valueAsDate = new Date();
    document.getElementById('invoice-hsncode').value = '996713';
}

// Show invoice modal (simplified version)
function showInvoiceModal(invoice) {
    // In a real app, you would create a detailed modal
    const modalContent = `
        <h3>Invoice Details: ${invoice.invoice_number}</h3>
        <p><strong>Client:</strong> ${invoice.client_name}</p>
        <p><strong>Date:</strong> ${formatDate(invoice.invoice_date)}</p>
        <p><strong>Total Amount:</strong> ₹${invoice.total_amount.toFixed(2)}</p>
        <h4>Items:</h4>
        <ul>
            ${invoice.items.map(item => `
                <li>
                    ${item.scheme} - ${item.shipping_bill_no} (${item.port}): 
                    ${item.s_bill_count} x ₹${item.rate} = ₹${(item.s_bill_count * item.rate).toFixed(2)}
                </li>
            `).join('')}
        </ul>
    `;
    
    alert(modalContent); // Replace with actual modal implementation
}

// Helper function to format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Show error message
function showError(message) {
    
    alert(`Error: ${message}`);
}

// Show success message
function showSuccess(message) {
 
    alert(`Success: ${message}`);
}
/*
// Filter invoice history
searchInvoiceInput.addEventListener('input', filterInvoices);
filterFromDate.addEventListener('change', filterInvoices);
filterToDate.addEventListener('change', filterInvoices);

function filterInvoices() {
    const searchTerm = searchInvoiceInput.value.toLowerCase();
    const fromDate = filterFromDate.value;
    const toDate = filterToDate.value;
    
    const filtered = invoices.filter(invoice => {
        const matchesSearch = invoice.invoice_number.toLowerCase().includes(searchTerm) || 
                            invoice.client_name.toLowerCase().includes(searchTerm);
        
        let matchesDate = true;
        if (fromDate && invoice.invoice_date < fromDate) matchesDate = false;
        if (toDate && invoice.invoice_date > toDate) matchesDate = false;
        
        return matchesSearch && matchesDate;
    });
    
    renderFilteredInvoiceHistory(filtered);
}

// Render filtered invoice history
function renderFilteredInvoiceHistory(filteredInvoices) {
    invoiceHistoryList.innerHTML = '';
    
    filteredInvoices.forEach(invoice => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${invoice.invoice_number}</td>
            <td>${invoice.client_name}</td>
            <td>${formatDate(invoice.invoice_date)}</td>
            <td>₹${invoice.total_amount.toFixed(2)}</td>
            <td>
                <button class="action-btn view-btn" data-id="${invoice.id}">View</button>
                <button class="action-btn download-btn" data-id="${invoice.id}">Download</button>
            </td>
        `;
        invoiceHistoryList.appendChild(row);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => viewInvoice(btn.dataset.id));
    });
    
    document.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', () => downloadInvoice(btn.dataset.id));
    });
}*/

