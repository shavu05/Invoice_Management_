

require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const puppeteer = require('puppeteer');
const open = require('open');
const app = express();

// Port selection with fallback mechanism
const findAvailablePort = async (startPort) => {
  const net = require('net');
  const isPortAvailable = (port) => {
    return new Promise((resolve) => {
      const server = net.createServer();
      server.once('error', () => resolve(false));
      server.once('listening', () => {
        server.close();
        resolve(true);
      });
      server.listen(port);
    });
  };
  
  let port = startPort;
  while (!(await isPortAvailable(port))) {
    console.log(`Port ${port} is in use, trying next port...`);
    port++;
  }
  return port;
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Connection test endpoint
app.get('/api/test-connection', (req, res) => {
  res.json({ status: 'success', message: 'API connection successful!' });
});

// Import DBs
const { authDB, clientDB, schemeDB, portDB } = require('./backend/config/database');
const invoiceHistoryDB = require('./backend/config/databases/invoiceHistoryDB'); 

// Import routes
const authRoutes = require('./backend/routes/authRoutes');
const clientRoutes = require('./backend/routes/clientRoutes');
const schemeRoutes = require('./backend/routes/schemeRoutes');
const portRoutes = require('./backend/routes/portRoutes');
const invoiceRoutes = require('./backend/routes/invoiceRoutes');
const invoiceHistoryRoutes = require('./backend/routes/invoiceHistoryRoutes'); // ✅ NEW

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/ports', portRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/invoice-history', invoiceHistoryRoutes); // ✅ NEW

// Static homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html/homepage.html'));
});

// === PDF Invoice Route ===
app.post('/create-invoice', async (req, res) => {
  const data = req.body;
  try {
    const html = `
    <html>
    <head>
    <style>
    body { font-family: Arial; padding: 20px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #ddd; padding: 8px; }
    </style>
    </head>
    <body>
    <h1>Invoice #${data.invoice_number}</h1>
    <p><strong>Client:</strong> ${data.client_name}</p>
    <p><strong>Address:</strong> ${data.client_address}</p>
    <p><strong>Date:</strong> ${data.invoice_date}</p>
    <table>
    <thead>
    <tr>
    <th>Scheme</th>
    <th>Rate</th>
    <th>Amount</th>
    </tr>
    </thead>
    <tbody>
    ${data.scheme.map((scheme, i) => `
    <tr>
    <td>${scheme}</td>
    <td>${data.rate[i]}</td>
    <td>${(data.rate[i] * data.s_bill_count[i]).toFixed(2)}</td>
    </tr>
    `).join('')}
    </tbody>
    </table>
    </body>
    </html>`;
    
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=invoice.pdf',
      'Content-Length': pdfBuffer.length,
    });
    res.send(pdfBuffer);
  } catch (err) {
    console.error('PDF Error:', err);
    res.status(500).send('Failed to generate invoice PDF');
  }
});

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// DB sync and server start
(async () => {
  try {
    // Connect and sync databases
    console.log('Connecting to databases...');
    try {
      await authDB.authenticate();
      console.log('✅ auth_db connected');
    } catch (err) {
      console.error('❌ auth_db connection failed:', err);
      process.exit(1);
    }
    
    try {
      await clientDB.authenticate();
      console.log('✅ client_db connected');
    } catch (err) {
      console.error('❌ client_db connection failed:', err);
      process.exit(1);
    }
    
    try {
      await schemeDB.authenticate();
      console.log('✅ scheme_db connected');
    } catch (err) {
      console.error('❌ scheme_db connection failed:', err);
      process.exit(1);
    }
    
    try {
      await portDB.authenticate();
      console.log('✅ port_db connected');
    } catch (err) {
      console.error('❌ port_db connection failed:', err);
      process.exit(1);
    }

    // ✅ Connect invoice history DB
    try {
      await invoiceHistoryDB.authenticate();
      console.log('✅ invoice_history_db connected');
    } catch (err) {
      console.error('❌ invoice_history_db connection failed:', err);
      process.exit(1);
    }

    // Sync all DBs
    await authDB.sync({ alter: true });
    console.log('✅ auth_db synced');
    await clientDB.sync({ alter: true });
    console.log('✅ client_db synced');
    await schemeDB.sync({ alter: true });
    console.log('✅ scheme_db synced');
    await portDB.sync({ alter: true });
    console.log('✅ port_db synced');
    await invoiceHistoryDB.sync({ alter: true }); // ✅ NEW
    console.log('✅ invoice_history_db synced');

    // Start server
    const preferredPort = process.env.PORT || 3000;
    const PORT = await findAvailablePort(preferredPort);

    app.listen(PORT, () => {
      const serverUrl = `http://localhost:${PORT}`;
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Dashboard available at: ${serverUrl}`);
      console.log(`🧪 API test endpoint: ${serverUrl}/api/test-connection`);
      
      try {
        if (typeof open === 'function') {
          open(serverUrl).catch(err => {
            console.log('Note: Could not open browser automatically. Please open manually.', err.message);
          });
        } else {
          const { exec } = require('child_process');
          const platform = process.platform;
          let command = platform === 'win32' ? `start ${serverUrl}` : platform === 'darwin' ? `open ${serverUrl}` : `xdg-open ${serverUrl}`;
          exec(command, (err) => {
            if (err) console.log('Note: Could not open browser automatically. Please open manually.');
          });
        }
      } catch (browserError) {
        console.log('Note: Could not open browser automatically. Please open manually.');
        console.error('Browser opening error details:', browserError);
      }
    });
  } catch (err) {
    console.error('❌ Server startup error:', err);
    process.exit(1);
  }
})();