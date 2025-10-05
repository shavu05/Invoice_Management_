// Client Management 
document.addEventListener('DOMContentLoaded', () => { 
    
    setupClientEventListeners();
    
    // Load initial dashboard
    fetchDashboardData();
    fetchServices();
    
    // Load clients table
    if (document.getElementById('clients-list')) {
        loadClientsTable('clients-list', false);
    }
    
    // Lad update table
    if (document.getElementById('update-clients-list')) {
        loadClientsTable('update-clients-list', true);
    }
    
    // Load clients  delete table
    if (document.getElementById('delete-clients-list')) {
        loadClientsTable('delete-clients-list', true);
    }
});
function toggleSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section.style.display === "none" || !section.style.display) {
    section.style.display = "block";
  } else {
    section.style.display = "none";
  }
}

function showSection(sectionId) {
  // Hide all content sections
  document.querySelectorAll('.content-section').forEach(section => {
    section.classList.remove('active');
    section.style.display = 'none';
  });
  // Show the selected section
  const activeSection = document.getElementById(sectionId);
  if (activeSection) {
    activeSection.classList.add('active');
    activeSection.style.display = 'block';
  }
}

// Safe show section to avoid page reload on anchor click
function safeShowSection(sectionId) {
  event.preventDefault();
  showSection(sectionId);
}

// Setup Event Listeners

function setupClientEventListeners() {
    // Add Client Form
    const clientForm = document.getElementById('client-form');
    if (clientForm) {
        clientForm.addEventListener('submit', handleAddClient);
    }
    
    // Update Clienform
    const updateClientForm = document.getElementById('update-client-form');
    if (updateClientForm) {
        updateClientForm.addEventListener('submit', handleUpdateClient);
    }
    
   //srch 
    attachSearchListeners();
}

// Load Clients into Tables

function loadClientsTable(tableId, includeActions) {
    const tableBody = document.getElementById(tableId);
    if (!tableBody) return;

    tableBody.innerHTML = '<tr><td colspan="5" class="text-center">Loading...</td></tr>';

    fetch('/api/clients')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch clients');
            }
            return response.json();
        })
        .then(clients => {
            tableBody.innerHTML = '';

            if (clients.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="5" class="text-center">No clients found.</td></tr>`;
                return;
            }

            clients.forEach((client, index) => {
                const row = document.createElement('tr');
                
                // Add client data cells, using index + 1 to create a sequential ID
                row.innerHTML = `
                    <td>${index + 1}</td> <!-- Sequential ID -->
                    <td>${client.company_name}</td>
                    <td>${client.gst_number}</td>
                    <td>${client.address}</td>
                `;

                // Add action buttons if required
                if (includeActions) {
                    const actionCell = document.createElement('td');
                    
                    if (tableId === 'update-clients-list') {
                        const editBtn = document.createElement('button');
                        editBtn.className = 'action-btn edit-btn';
                        editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit'; // Font Awesome edit icon
                        editBtn.onclick = () => showUpdateForm(client.id);
                        actionCell.appendChild(editBtn);
                    } 
                    else if (tableId === 'delete-clients-list') {
                        const deleteBtn = document.createElement('button');
                        deleteBtn.className = 'action-btn delete-btn';
                        deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete'; // Font Awesome trash icon
                        deleteBtn.onclick = () => confirmDeleteClient(client.id);
                        actionCell.appendChild(deleteBtn);
                    }
                    
                    row.appendChild(actionCell);
                }
                
                tableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error loading clients:', error);
            tableBody.innerHTML = `<tr><td colspan="5" class="text-center">Error loading clients: ${error.message}</td></tr>`;
        });
}



// Handle Add Client

async function handleAddClient(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    try {
        const formData = new FormData(form);
        const clientData = {
            company_name: formData.get('company_name'),
            gst_number: formData.get('gst_number'),
            address: formData.get('address')
        };

        // Validate client data
        if (!clientData.company_name || !clientData.gst_number || !clientData.address) {
            throw new Error('All fields are required');
        }

        // Send API request
        const response = await fetch('/api/clients', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(clientData),
        });

        // Handle response
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Failed to add client');
        }

        // Success - Reset form & update client lists
        alert('✅ Client added successfully!');
        form.reset();
        
        // Refresh client tables and dashboard data
        fetchDashboardData();
        refreshAllClientTables();
        
    } catch (error) {
        alert(`❌ Error: ${error.message}`);
        console.error('Error adding client:', error);
    } finally {
        submitBtn.disabled = false;
    }
}

// ==============================
// Show Update Form
// ==============================
function showUpdateForm(clientId) {
    const updateFormContainer = document.getElementById('update-form-container');
    
    fetch(`/api/clients/${clientId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch client data');
            }
            return response.json();
        })
        .then(client => {
            // Populate the update form with client data
            document.getElementById('update-client-id').value = client.id;
            document.getElementById('update-company-name').value = client.company_name;
            document.getElementById('update-gst-number').value = client.gst_number;
            document.getElementById('update-client-address').value = client.address;

            // Show the update form container
            updateFormContainer.style.display = 'block';
            
            // Scroll to the form
            updateFormContainer.scrollIntoView({ behavior: 'smooth' });
        })
        .catch(error => {
            console.error('Error fetching client data:', error);
            alert(`❌ Error: ${error.message}`);
        });
}

// ==============================
// Handle Update Client
// ==============================
async function handleUpdateClient(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    try {
        const formData = new FormData(form);
        const clientId = formData.get('client_id');
        
        const clientData = {
            company_name: formData.get('company_name'),
            gst_number: formData.get('gst_number'),
            address: formData.get('address')
        };

        // Validate client data
        if (!clientData.company_name || !clientData.gst_number || !clientData.address) {
            throw new Error('All fields are required');
        }

        // Send API request
        const response = await fetch(`/api/clients/${clientId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(clientData),
        });

        // Handle response
        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.message || 'Failed to update client');
        }

        // Success - Hide form & update client lists
        alert('✅ Client updated successfully!');
        document.getElementById('update-form-container').style.display = 'none';
        
        // Refresh all client tables
        refreshAllClientTables();
        fetchDashboardData();
        
    } catch (error) {
        alert(`❌ Error: ${error.message}`);
        console.error('Error updating client:', error);
    } finally {
        submitBtn.disabled = false;
    }
}

// ==============================
// Delete Client Flow
// ==============================
function confirmDeleteClient(clientId) {
    fetch(`/api/clients/${clientId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch client data');
            }
            return response.json();
        })
        .then(client => {
            if (confirm(`Are you sure you want to delete ${client.company_name}?`)) {
                deleteClient(clientId);
            }
        })
        .catch(error => {
            console.error('Error fetching client data:', error);
            alert(`❌ Error: ${error.message}`);
        });
}

async function deleteClient(clientId) {
    try {
        const response = await fetch(`/api/clients/${clientId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.message || 'Failed to delete client');
        }

        alert('✅ Client deleted successfully!');
        
        // Refresh all client tables
        refreshAllClientTables();
        fetchDashboardData();
        
    } catch (error) {
        alert(`❌ Error: ${error.message}`);
        console.error('Error deleting client:', error);
    }
}

// ==============================
// Search Functionality
// ==============================
function attachSearchListeners() {
    // Attach search event to the client view table
    const viewSearchInput = document.getElementById('search-client');
    if (viewSearchInput) {
        viewSearchInput.addEventListener('input', () => {
            filterClientTable('search-client', 'clients-list');
        });
    }
    
    // Attach search event to the client update table
    const updateSearchInput = document.getElementById('search-update-client');
    if (updateSearchInput) {
        updateSearchInput.addEventListener('input', () => {
            filterClientTable('search-update-client', 'update-clients-list');
        });
    }
    
    // Attach search event to the client delete table
    const deleteSearchInput = document.getElementById('search-delete-client');
    if (deleteSearchInput) {
        deleteSearchInput.addEventListener('input', () => {
            filterClientTable('search-delete-client', 'delete-clients-list');
        });
    }
}

function filterClientTable(searchInputId, tableBodyId) {
    const searchQuery = document.getElementById(searchInputId).value.toLowerCase();
    const tableBody = document.getElementById(tableBodyId);
    
    if (!tableBody) return;
    
    const rows = tableBody.getElementsByTagName('tr');

    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');
        if (cells.length < 3) continue; // Skip if not a data row
        
        const companyName = cells[1].textContent.toLowerCase();
        const gstNumber = cells[2].textContent.toLowerCase();
        const address = cells[3].textContent.toLowerCase();

        const matchFound = 
            companyName.includes(searchQuery) || 
            gstNumber.includes(searchQuery) ||
            address.includes(searchQuery);
            
        rows[i].style.display = matchFound ? '' : 'none';
    }
}

/*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/

// ==============================
// Dashboard Data
// ==============================
function fetchDashboardData() {
    // Get client count
    fetch('/api/clients/count')
        .then(response => response.json())
        .then(data => {
            const totalClientsElem = document.getElementById('total-clients');
            if (totalClientsElem) {
                totalClientsElem.textContent = data.count;
            }
        })
        .catch(error => console.error('Error fetching client count:', error));

    // Get invoice summary
    if (document.getElementById('total-invoices')) {
        fetch('/api/invoices/summary')
            .then(response => response.json())
            .then(data => {
                document.getElementById('total-invoices').textContent = data.count;
                document.getElementById('revenue-summary').textContent = 
                    data.revenue.toLocaleString('en-IN');
            })
            .catch(error => console.error('Error fetching invoice data:', error));
    }


    fetch('/api/schemes/count')
    .then(response => {
        console.log('Scheme count response:', response);
        return response.json();
    })
    .then(data => {
        console.log('Scheme count data:', data);
        const totalSchemesElem = document.getElementById('total-schemes');
        if (totalSchemesElem) {
            totalSchemesElem.textContent = data.count;
        }
    })
    .catch(error => console.error('Error fetching scheme count:', error));


    // Get port count
    fetch('/api/ports/count')
        .then(response => response.json())
        .then(data => {
            const totalPortsElem = document.getElementById('total-ports');
            if (totalPortsElem) {
                totalPortsElem.textContent = data.count;
            }
        })
        .catch(error => console.error('Error fetching port count:', error));
}


// ==============================
// Services Data
// ==============================
/*function fetchServices() {
    const servicesList = document.getElementById('services-list');
    if (!servicesList) return;
    
    fetch('/api/services')
        .then(response => response.json())
        .then(services => {
            servicesList.innerHTML = '';

            if (services.length === 0) {
                servicesList.innerHTML = '<tr><td colspan="2" class="text-center">Advance Licence Registration</td></tr>';
                return;
            }

            services.forEach(service => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${service.name}</td>
                    <td>${service.description}</td>
                `;
                servicesList.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error fetching services:', error);
            servicesList.innerHTML = '<tr><td colspan="2" class="text-center">Advance Licence Registration</td></tr>';
        });
}*/

// ==============================
// Show Content Section
// ==============================
function showSection(sectionId) {
    // Hide all content sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show the selected section
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
    }
    
    // Update active status in sidebar navigation
    const navItems = document.querySelectorAll('.sidebar .nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // Find nav item with matching href and set it as active
    const activeNavItem = document.querySelector(`.sidebar .nav-item[href="#${sectionId.replace('-section', '')}"]`);
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }
    
    // Load data specific to the section
    if (sectionId === 'view-clients-section') {
        loadClientsTable('clients-list', false);
    } else if (sectionId === 'update-client-section') {
        loadClientsTable('update-clients-list', true);
    } else if (sectionId === 'delete-client-section') {
        loadClientsTable('delete-clients-list', true);
    }
}

// ==============================
// Helper Methods
// ==============================
function refreshAllClientTables() {
    if (document.getElementById('clients-list')) {
        loadClientsTable('clients-list', false);
    }
    if (document.getElementById('update-clients-list')) {
        loadClientsTable('update-clients-list', true);
    }
    if (document.getElementById('delete-clients-list')) {
        loadClientsTable('delete-clients-list', true);
    }
    
    // If we're updating a client, hide the form
    const updateFormContainer = document.getElementById('update-form-container');
    if (updateFormContainer) {
        updateFormContainer.style.display = 'none';
    }
}

/*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/

// ==============================
// Sidebar Toggle
// ==============================
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const content = document.getElementById('main-content');
    
    if (sidebar.classList.contains('collapsed')) {
        sidebar.classList.remove('collapsed');
        sidebar.style.left = '0';
        content.style.marginLeft = '260px';
    } else {
        sidebar.classList.add('collapsed');
        sidebar.style.left = '-260px';
        content.style.marginLeft = '0';
    }
}

// ==============================
// Toggle Dropdown Sections
// ==============================
function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    // Toggle section visibility
    if (section.style.display === 'none' || !section.style.display) {
        section.style.display = 'block';
    } else {
        section.style.display = 'none';
    }
    
    // Find and toggle dropdown arrow for this section
    const parentNavItem = section.previousElementSibling;
    if (parentNavItem) {
        const arrow = parentNavItem.querySelector('.dropdown-arrow');
        if (arrow) {
            arrow.textContent = section.style.display === 'block' ? '▲' : '▼';
        }
    }
}

/*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
/*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/

// Scheme Management 
const API_BASE_URL = 'http://localhost:3000/api';


// DOM Elements
const schemeForm = document.getElementById('scheme-form');
const schemesListElement = document.getElementById('schemes-list');
const updateSchemesListElement = document.getElementById('update-schemes-list');
const deleteSchemesListElement = document.getElementById('delete-schemes-list');
const searchSchemeInput = document.getElementById('search-scheme');
const searchUpdateSchemeInput = document.getElementById('search-update-scheme');
const searchDeleteSchemeInput = document.getElementById('search-delete-scheme');
const updateSchemeForm = document.getElementById('update-scheme-form');
const updateFormContainer = document.getElementById('update-form-container');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Load all schemes when the page loads
    fetchSchemes();
    
    // Set up form submission handlers
    if (schemeForm) {
        schemeForm.addEventListener('submit', handleAddScheme);
    }
    
    if (updateSchemeForm) {
        updateSchemeForm.addEventListener('submit', handleUpdateScheme);
    }
    
    // Set up search functionality
    if (searchUpdateSchemeInput) {
        searchUpdateSchemeInput.addEventListener('keyup', () => filterSchemes(updateSchemesListElement, searchUpdateSchemeInput.value));
    }
    
    if (searchDeleteSchemeInput) {
        searchDeleteSchemeInput.addEventListener('keyup', () => filterSchemes(deleteSchemesListElement, searchDeleteSchemeInput.value));
    }
});

// Fetch all schemes from the API
async function fetchSchemes() {
    try {
        const response = await fetch(`${API_BASE_URL}/schemes`);
        if (!response.ok) {
            throw new Error('Failed to fetch schemes');
        }
        
        const schemes = await response.json();
        
        // Update all scheme lists
        populateSchemesList(schemes);
        populateUpdateSchemesList(schemes);
        populateDeleteSchemesList(schemes);
        
        return schemes;
    } catch (error) {
        showNotification(error.message, 'error');
        console.error('Error fetching schemes:', error);
        return [];
    }
}

// Populate the schemes list table with sequential numbering
function populateSchemesList(schemes) {
    if (!schemesListElement) return;
    
    schemesListElement.innerHTML = '';
    
    if (schemes.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="2">No schemes found</td>';
        schemesListElement.appendChild(emptyRow);
        return;
    }
    
    schemes.forEach((scheme, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${scheme.scheme_name}</td>
        `;
        // Store the actual ID as a data attribute for reference if needed
        row.dataset.schemeId = scheme.id;
        schemesListElement.appendChild(row);
    });
}

// Populate the update schemes list table with sequential numbering
function populateUpdateSchemesList(schemes) {
    if (!updateSchemesListElement) return;
    
    updateSchemesListElement.innerHTML = '';
    
    if (schemes.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="3">No schemes found</td>';
        updateSchemesListElement.appendChild(emptyRow);
        return;
    }
    
    schemes.forEach((scheme, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${scheme.scheme_name}</td>
            <td>
                <button class="edit-btn" onclick="openUpdateForm(${scheme.id}, '${scheme.scheme_name}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
            </td>
        `;
        // Store the actual ID as a data attribute for reference
        row.dataset.schemeId = scheme.id;
        updateSchemesListElement.appendChild(row);
    });
}

// Populate the delete schemes list table with sequential numbering
function populateDeleteSchemesList(schemes) {
    if (!deleteSchemesListElement) return;
    
    deleteSchemesListElement.innerHTML = '';
    
    if (schemes.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="3">No schemes found</td>';
        deleteSchemesListElement.appendChild(emptyRow);
        return;
    }
    
    schemes.forEach((scheme, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${scheme.scheme_name}</td>
            <td>
                <button class="delete-btn" onclick="deleteScheme(${scheme.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        `;
        // Store the actual ID as a data attribute for reference
        row.dataset.schemeId = scheme.id;
        deleteSchemesListElement.appendChild(row);
    });
}

// Add a new scheme
async function handleAddScheme(event) {
    event.preventDefault();
    
    const schemeName = document.getElementById('scheme-name').value.trim();
    
    if (!schemeName) {
        showNotification('Scheme name is required', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/schemes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ scheme_name: schemeName }),
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Failed to add scheme');
        }
        
        alert('Scheme added successfully');
        schemeForm.reset();
        fetchSchemes(); 
    } catch (error) {
        showNotification(error.message, 'error');
        console.error('Error adding scheme:', error);
    }
}

// Open update form with scheme data
function openUpdateForm(id, name) {
    console.log('Opening update form for scheme:', id, name);
    
    const idField = document.getElementById('update-scheme-id');
    const nameField = document.getElementById('update-scheme-name');
    
    console.log('Form elements found:', !!idField, !!nameField, !!updateFormContainer);
    
    if (idField) idField.value = id;
    if (nameField) nameField.value = name;
    
    if (updateFormContainer) {
        updateFormContainer.style.display = 'block';
        console.log('Form display style set to block');
        updateFormContainer.scrollIntoView({ behavior: 'smooth' });
    } else {
        console.error('Update form container not found!');
    }
}
document.getElementById('update-form-container').style.display = 'block';


// Update a scheme
async function handleUpdateScheme(event) {
    event.preventDefault();
    
    const schemeId = document.getElementById('update-scheme-id').value;
    const schemeName = document.getElementById('update-scheme-name').value.trim();
    
    if (!schemeName) {
        showNotification('Scheme name is required', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/schemes/${schemeId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ scheme_name: schemeName }),
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Failed to update scheme');
        }
        alert('Scheme updated successfully');
        
        updateSchemeForm.reset();
        updateFormContainer.style.display = 'none';
        fetchSchemes(); // Refresh the lists
    } catch (error) {
        showNotification(error.message, 'error');
        console.error('Error updating scheme:', error);
    }
}
setTimeout(() => {
    updateFormContainer.style.display = 'block';
}, 100);


// Delete a scheme
async function deleteScheme(id) {
    if (!confirm('Are you sure you want to delete this scheme?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/schemes/${id}`, {
            method: 'DELETE',
        });
        
        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.error || 'Failed to delete scheme');
        }
        
        showNotification('Scheme deleted successfully', 'success');
        fetchSchemes(); // Refresh the lists
    } catch (error) {
        showNotification(error.message, 'error');
        console.error('Error deleting scheme:', error);
    }
}

// Filter schemes based on search input
function filterSchemes(targetElement = schemesListElement, searchValue = searchSchemeInput?.value || '') {
    if (!targetElement) return;
    
    const rows = targetElement.getElementsByTagName('tr');
    const search = searchValue.toLowerCase();
    let visibleCount = 0;
    
    for (let i = 0; i < rows.length; i++) {
        const name = rows[i].getElementsByTagName('td')[1]?.textContent || '';
        const shouldShow = name.toLowerCase().includes(search);
        
        if (shouldShow) {
            rows[i].style.display = '';
            visibleCount++;
            // Update the sequence number to be sequential for visible rows only
            rows[i].getElementsByTagName('td')[0].textContent = visibleCount;
        } else {
            rows[i].style.display = 'none';
        }
    }
}

// Show notification to the user (used only for error cases now)
function showNotification(message, type = 'info') {
    // Only show this for errors (no success message pop-up)
    if (type === 'error') {
        alert(message); // Pop-up alert for error
    }
}


/*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
/*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/

// Port Management 

// DOM Elements
const portForm = document.getElementById('port-form');
const portsListElement = document.getElementById('ports-list');
const updatePortsListElement = document.getElementById('update-ports-list');
const deletePortsListElement = document.getElementById('delete-ports-list');
const searchPortInput = document.getElementById('search-port');
const searchUpdatePortInput = document.getElementById('search-update-port');
const searchDeletePortInput = document.getElementById('search-delete-port');
const updatePortForm = document.getElementById('update-port-form');
const updatePortFormContainer = document.getElementById('update-port-form-container');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Load all ports when the page loads
    fetchPorts();
    
    // Set up form submission handlers
    if (portForm) {
        portForm.addEventListener('submit', handleAddPort);
    }
    
    if (updatePortForm) {
        updatePortForm.addEventListener('submit', handleUpdatePort);
    }
    
    // Set up search functionality
    if (searchPortInput) {
        searchPortInput.addEventListener('keyup', () => {
            const searchValue = searchPortInput.value;
            fetchPorts(searchValue);
        });
    }
    
    if (searchUpdatePortInput) {
        searchUpdatePortInput.addEventListener('keyup', () => {
            const searchValue = searchUpdatePortInput.value;
            fetchPorts(searchValue, 'update');
        });
    }
    
    if (searchDeletePortInput) {
        searchDeletePortInput.addEventListener('keyup', () => {
            const searchValue = searchDeletePortInput.value;
            fetchPorts(searchValue, 'delete');
        });
    }
});

// Fetch ports from the API with optional search parameter
async function fetchPorts(searchQuery = '', target = 'all') {
    try {
        const url = new URL('http://localhost:3000/api/ports'); // Direct API URL
        if (searchQuery) {
            url.searchParams.append('search', searchQuery);
        }
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch ports');
        }
        
        const ports = await response.json();
        
        // Update port lists based on target
        if (target === 'all' || target === 'view') {
            populatePortsList(ports);
        }
        if (target === 'all' || target === 'update') {
            populateUpdatePortsList(ports);
        }
        if (target === 'all' || target === 'delete') {
            populateDeletePortsList(ports);
        }
        
        return ports;
    } catch (error) {
        showNotification(error.message, 'error');
        console.error('Error fetching ports:', error);
        return [];
    }
}

// Populate the ports list table with sequential numbering
function populatePortsList(ports) {
    if (!portsListElement) return;
    
    portsListElement.innerHTML = '';
    
    if (ports.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="2">No ports found</td>';
        portsListElement.appendChild(emptyRow);
        return;
    }
    
    ports.forEach((port, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${port.name}</td>
        `;
        // Store the actual ID as a data attribute for reference if needed
        row.dataset.portId = port.id;
        portsListElement.appendChild(row);
    });
}

// Populate the update ports list table with sequential numbering
function populateUpdatePortsList(ports) {
    if (!updatePortsListElement) return;
    
    updatePortsListElement.innerHTML = '';
    
    if (ports.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="3">No ports found</td>';
        updatePortsListElement.appendChild(emptyRow);
        return;
    }
    
    ports.forEach((port, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${port.name}</td>
            <td>
                <button class="edit-btn" onclick="openUpdatePortForm(${port.id}, '${port.name}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
            </td>
        `;
        // Store the actual ID as a data attribute for reference
        row.dataset.portId = port.id;
        updatePortsListElement.appendChild(row);
    });
}

// Populate the delete ports list table with sequential numbering
function populateDeletePortsList(ports) {
    if (!deletePortsListElement) return;
    
    deletePortsListElement.innerHTML = '';
    
    if (ports.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="3">No ports found</td>';
        deletePortsListElement.appendChild(emptyRow);
        return;
    }
    
    ports.forEach((port, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${port.name}</td>
            <td>
                <button class="delete-btn" onclick="deletePort(${port.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        `;
        // Store the actual ID as a data attribute for reference
        row.dataset.portId = port.id;
        deletePortsListElement.appendChild(row);
    });
}

// Add a new port
async function handleAddPort(event) {
    event.preventDefault();
    
    const portName = document.getElementById('port-name').value.trim();
    
    if (!portName) {
        showNotification('Port name is required', 'error');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:3000/api/ports', { // Direct API URL
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: portName }),
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Failed to add port');
        }
        
        alert('Port added successfully');
        portForm.reset();
        fetchPorts(); // Refresh the lists
    } catch (error) {
        showNotification(error.message, 'error');
        console.error('Error adding port:', error);
    }
}

// Open update form with port data
function openUpdatePortForm(id, name) {
    document.getElementById('update-port-id').value = id;
    document.getElementById('update-port-name').value = name;
    updatePortFormContainer.style.display = 'block';
    
    // Scroll to the form
    updatePortFormContainer.scrollIntoView({ behavior: 'smooth' });
}

// Update a port
async function handleUpdatePort(event) {
    event.preventDefault();
    
    const portId = document.getElementById('update-port-id').value;
    const portName = document.getElementById('update-port-name').value.trim();
    
    if (!portName) {
        showNotification('Port name is required', 'error');
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:3000/api/ports/${portId}`, { // Direct API URL
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: portName }),
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Failed to update port');
        }
        
        alert('Port updated successfully');
        updatePortForm.reset();
        updatePortFormContainer.style.display = 'none';
        fetchPorts(); // Refresh the lists
    } catch (error) {
        showNotification(error.message, 'error');
        console.error('Error updating port:', error);
    }
}

// Delete a port
async function deletePort(id) {
    if (!confirm('Are you sure you want to delete this port?')) {
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:3000/api/ports/${id}`, { // Direct API URL
            method: 'DELETE',
        });
        
        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.message || 'Failed to delete port');
        }
        
        alert('Port deleted successfully');
        fetchPorts(); // Refresh the lists
    } catch (error) {
        showNotification(error.message, 'error');
        console.error('Error deleting port:', error);
    }
}

/*--------------------------------------------------------------------------------------------------------------------------------------------------------*/
/*--------------------------------------------------------------------------------------------------------------------------------------------------------*/
/*
//INVOICE-MANAGEMENT

//INVOICE-MANAGEMENT

// ==== GLOBAL VARIABLES ====
let clients = [];
let schemes = [];
let ports = [];

// ==== INITIALIZE APPLICATION ====
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Load all reference data
        await loadReferenceData();
        
        // Set up event listeners
        setupEventListeners();
        
        // Add first empty item row
        addItemRow();
        
        // Set today's date as default invoice date
        document.getElementById('invoice-date').value = new Date().toISOString().split('T')[0];
        
    } catch (error) {
        console.error('Initialization error:', error);
        alert('Failed to initialize application');
    }
});

// ==== LOAD REFERENCE DATA ====
async function loadReferenceData() {
    try {
        const [clientsRes, schemesRes, portsRes] = await Promise.all([
            fetch('/api/clients'),
            fetch('/api/schemes'),
            fetch('/api/ports')
        ]);
        
        clients = await clientsRes.json();
        schemes = await schemesRes.json();
        ports = await portsRes.json();
        
        populateClientSelect();
        
    } catch (error) {
        console.error('Error loading reference data:', error);
        throw error;
    }
}

// ==== SETUP EVENT LISTENERS ====
function setupEventListeners() {
    // Client selection
    const clientSelect = document.getElementById('client-select');
    if (clientSelect) {
        clientSelect.addEventListener('change', onClientChange);
    }
    
    // Add item button
    const addItemBtn = document.getElementById('add-item-btn');
    if (addItemBtn) {
        addItemBtn.addEventListener('click', addItemRow);
    }
    
    // Form submission
    const invoiceForm = document.getElementById('invoice-form');
    if (invoiceForm) {
        invoiceForm.addEventListener('submit', onSubmitInvoice);
    }
}

// ==== POPULATE CLIENT DROPDOWN ====
function populateClientSelect() {
    const select = document.getElementById('client-select');
    if (!select) return;
    
    select.innerHTML = '<option value="">Select Client</option>' + 
        clients.map(client => 
            `<option value="${client.id}">${client.company_name}</option>`
        ).join('');
}

// ==== CLIENT SELECTION HANDLER ====

 
function onClientChange() {
    const sel = this;
    const chosen = clients.find(c => c.id == sel.value);
    
    if (!chosen) {
        document.querySelector('input#client-gst').value = '';
        document.querySelector('input#client-address').value = '';
        return;
    }

   
    document.querySelector('input#client-gst').value = chosen.gst_number || '';

    
    const addressInput = document.querySelector('input#client-address');
    if (addressInput) {
        addressInput.value = chosen.address || '';
        console.log(" FORCE-SET address to:", addressInput.value);
    
    }
     else {
        console.error(" Address input element not found!");
    }
} 

// ==== ADD ITEM ROW ====
function addItemRow() {
    const tbody = document.getElementById('invoice-items-body');
    const rowCount = tbody.querySelectorAll('tr').length;
    
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><input name="sr_no[]" value="${rowCount + 1}" readonly></td>
        <td>
            <select name="scheme[]" required>
                <option value="">Select Scheme</option>
                ${schemes.map(s => `<option value="${s.scheme_name}">${s.scheme_name}</option>`).join('')}
            </select>
        </td>
        <td><input type="text" name="shipping_bill_no[]" required></td>
        <td><input type="date" name="shipping_date[]" required></td>
        <td>
            <select name="port[]" required>
                <option value="">Select Port</option>
                ${ports.map(p => `<option value="${p.name}">${p.name}</option>`).join('')}
            </select>
        </td>
        <td><input type="number" name="s_bill_count[]" value="1" min="1" required></td>
        <td><input type="number" name="rate[]" value="0" min="0" step="0.01" required></td>
        <td class="amount-cell">0.00</td>
        <td><button type="button" class="delete-btn" onclick="removeItemRow(this)">Remove</button></td>
    `;
    
    tbody.appendChild(row);
    
    // Add event listeners for calculations
    const qtyInput = row.querySelector('input[name="s_bill_count[]"]');
    const rateInput = row.querySelector('input[name="rate[]"]');
    
    qtyInput.addEventListener('input', () => calculateAmount(row));
    rateInput.addEventListener('input', () => calculateAmount(row));
}

// ==== REMOVE ITEM ROW ====
function removeItemRow(button) {
    const row = button.closest('tr');
    row.remove();
    updateSerialNumbers();
    calculateTotal();
}

// ==== UPDATE SERIAL NUMBERS ====
function updateSerialNumbers() {
    document.querySelectorAll('#invoice-items-body tr').forEach((row, index) => {
        row.querySelector('input[name="sr_no[]"]').value = index + 1;
    });
}

// ==== CALCULATE ROW AMOUNT ====
function calculateAmount(row) {
    const quantity = parseFloat(row.querySelector('input[name="s_bill_count[]"]').value) || 0;
    const rate = parseFloat(row.querySelector('input[name="rate[]"]').value) || 0;
    const amount = (quantity * rate).toFixed(2);
    
    row.querySelector('.amount-cell').textContent = amount;
    calculateTotal();
}

// ==== CALCULATE TOTALS & TAXES ====
function calculateTotal() {
    const amounts = Array.from(document.querySelectorAll('.amount-cell'))
        .map(cell => parseFloat(cell.textContent) || 0);
    
    const subTotal = amounts.reduce((sum, amount) => sum + amount, 0);
    
    // GST Calculation
    const companyStateCode = '27'; // Your company's state code
    const clientGST = document.getElementById('client-gst').value || '';
    const clientStateCode = clientGST.substring(0, 2);
    
    let cgst = 0, sgst = 0, igst = 0;
    
    if (clientStateCode && clientStateCode === companyStateCode) {
        // Intra-state - CGST + SGST
        cgst = subTotal * 0.09;
        sgst = subTotal * 0.09;
    } else if (clientStateCode) {
        // Inter-state - IGST
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

// ==== FORM SUBMISSION ====
// ==== SETUP EVENT LISTENERS ====
function setupEventListeners() {
    // ... (other event listeners) ...

    // Form submission
    const invoiceForm = document.getElementById('invoice-form');
    if (invoiceForm) {
        invoiceForm.addEventListener('submit', onSubmitInvoice);
    }
}

// ==== FORM SUBMISSION ====
async function onSubmitInvoice(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
        const res = await fetch('/api/invoices/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const blob = await res.blob(); // assuming backend returns a PDF
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'invoice.pdf';
        a.click();
        window.URL.revokeObjectURL(url);

    } catch (error) {
        console.error('Error creating invoice PDF:', error);
        alert('Failed to create invoice PDF');
    }
}
form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // If `scheme`, `rate`, and `s_bill_count` are arrays
    data.scheme = [...document.querySelectorAll('[name="scheme[]"]')].map(e => e.value);
    data.rate = [...document.querySelectorAll('[name="rate[]"]')].map(e => parseFloat(e.value));
    data.s_bill_count = [...document.querySelectorAll('[name="s_bill_count[]"]')].map(e => parseFloat(e.value));

    try {
        const res = await fetch('/create-invoice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'invoice.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    } catch (err) {
        console.error('Invoice PDF error:', err);
        alert('Failed to download invoice PDF');
    }
});




const clientData = {
    clients: [], // This will hold all client objects
    currentClient: null, // Currently selected client
    
    // Method to load clients
    async loadClients() {
      try {
        const response = await fetch('/api/clients');
        if (!response.ok) throw new Error('Failed to fetch clients');
        this.clients = await response.json();
      } catch (error) {
        console.error('Error loading clients:', error);
        alert('Failed to load clients');
      }
    },
    
    // Method to get client by ID
    getClientById(id) {
      return this.clients.find(client => client.id == id);
    }
  };
  
  // Initialize when DOM loads
  document.addEventListener('DOMContentLoaded', async () => {
    await clientData.loadClients();
    // Rest of your initialization code...
  });*/
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //setting
  function redirectToHomepage() {
  window.location.href = "/html/homepage.html"; // or adjust the path as needed
}
