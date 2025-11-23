const express = require('express');
const { authenticateLawyer } = require('../utils/middleware');
const {
  getDashboardStats,
  getCases,
  createCase,
  getClients,
  getAppointments,
  getDocuments,
  getInvoices,
  getProfile
} = require('../controllers/lawyerDashboardController');

const router = express.Router();

// Temporarily disable authentication for testing
// router.use(authenticateLawyer);

// Mock user for testing
router.use((req, res, next) => {
  req.user = { id: 1, role: 'lawyer', name: 'Test Lawyer' };
  next();
});

// Dashboard routes
router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/overview', getDashboardStats); // Add alias for frontend compatibility
router.get('/cases', getCases);
router.post('/cases', createCase);
router.get('/clients', getClients);
router.get('/appointments', getAppointments);
router.get('/documents', getDocuments);
router.get('/invoices', getInvoices);
router.get('/profile', getProfile);

module.exports = router;