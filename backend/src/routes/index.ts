import { Router } from 'express';
import { login } from '../controllers/auth.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { createInvoice, invoicePdf, listInvoices } from '../controllers/invoice.controller.js';
import { createExpense, listExpenses } from '../controllers/expense.controller.js';
import { monthlyVatCsv, monthlyVatReport } from '../controllers/report.controller.js';
import { dashboardMetrics } from '../controllers/dashboard.controller.js';
import { createCustomer, createVendor, getSubscription, listCustomers, listVendors } from '../controllers/masterdata.controller.js';

const router = Router();

router.post('/auth/login', login);

router.use(authenticate);
router.get('/dashboard/metrics', dashboardMetrics);

router.get('/invoices', listInvoices);
router.post('/invoices', authorize('ADMIN', 'ACCOUNTANT'), createInvoice);
router.get('/invoices/:id/pdf', invoicePdf);

router.get('/expenses', listExpenses);
router.post('/expenses', authorize('ADMIN', 'ACCOUNTANT'), createExpense);

router.get('/reports/vat/monthly', authorize('ADMIN', 'ACCOUNTANT'), monthlyVatReport);
router.get('/reports/vat/monthly.csv', authorize('ADMIN', 'ACCOUNTANT'), monthlyVatCsv);

router.get('/customers', listCustomers);
router.post('/customers', authorize('ADMIN', 'ACCOUNTANT', 'STAFF'), createCustomer);
router.get('/vendors', listVendors);
router.post('/vendors', authorize('ADMIN', 'ACCOUNTANT', 'STAFF'), createVendor);

router.get('/subscriptions/current', getSubscription);

export default router;
