# 🔍 Routes Analysis - Used vs Unused

## 📊 Summary
- **Total Route Files**: 22
- **Total Endpoints**: 150+
- **Authentication Required**: Most endpoints
- **Public Endpoints**: Limited

---

## 🔐 **ADMIN ROUTES** (`/api/admin/*`)
**File**: `routes/admin.js`

### ✅ Defined Routes:
- `GET /stats` - Dashboard statistics
- `GET /users` - Get all users
- `DELETE /users/:id` - Delete user
- `PUT /users/:id/make-admin` - Make user admin
- `PUT /users/:id/remove-admin` - Remove admin
- `GET /lawyers` - Get all lawyers
- `PUT /verify-lawyer/:id` - Verify lawyer
- `PUT /reject-lawyer/:id` - Reject lawyer
- `DELETE /lawyers/:id` - Delete lawyer

### ⚠️ Status: 
- **Authentication DISABLED** for development
- All routes functional but bypassed security

---

## 🔑 **AUTH ROUTES** (`/api/auth/*`)
**File**: `routes/auth.js`

### ✅ Defined Routes:
- `POST /register-user` - User registration
- `POST /register-lawyer` - Lawyer registration
- `POST /register` - Unified registration (smart routing)
- `POST /login` - Login endpoint
- `POST /verify-email` - Email verification
- `POST /send-otp` - Send OTP
- `POST /verify-otp` - Verify OTP
- `POST /forgot-password-otp` - Password reset OTP
- `POST /verify-forgot-password-otp` - Verify reset OTP
- `POST /forgot-password` - Forgot password
- `POST /reset-password` - Reset password
- `GET /me` - Get profile (🔒 Auth required)
- `PUT /me` - Update profile (🔒 Auth required)
- `POST /submit-later` - Submit profile later (🔒 Auth required)
- `DELETE /me` - Delete account (🔒 Auth required)
- `POST /logout` - Logout
- `GET /debug-oauth` - OAuth debug info
- `GET /google` - Google OAuth initiation
- `GET /google/lawyer` - Lawyer-specific Google OAuth
- `GET /google/callback` - Google OAuth callback
- `GET /facebook` - Facebook OAuth
- `GET /facebook/callback` - Facebook OAuth callback

### 🟢 Status: **HEAVILY USED** - Core authentication system

---

## 📝 **BLOG ROUTES** (`/api/blogs/*`)
**File**: `routes/blogs.js`

### ✅ Defined Routes:
- `POST /` - Create blog (🔒 Lawyer only)
- `PUT /:identifier` - Update blog (🔒 Author only)
- `DELETE /:identifier` - Delete blog (🔒 Author only)
- `GET /` - Get all published blogs
- `GET /lawyer` - Get lawyer's own blogs (🔒 Lawyer only)
- `GET /categories` - Get blog categories
- `GET /top-authors` - Get top authors
- `GET /tags` - Get blog tags
- `GET /popular` - Get popular posts
- `GET /:identifier` - Get single blog (by ID or slug)

### 🟢 Status: **ACTIVE** - Blog management system

---

## 📞 **CALL ROUTES** (`/api/calls/*`)
**File**: `routes/calls.js`

### ✅ Defined Routes:
- `GET /` - Get all calls (🔒 Auth required)
- `POST /` - Create call (🔒 Auth required)
- `PUT /:id` - Update call (🔒 Auth required)
- `DELETE /:id` - Delete call (🔒 Auth required)

### 🟡 Status: **BASIC CRUD** - Simple call management

---

## ⚖️ **CASE ROUTES** (`/api/cases/*`)
**File**: `routes/cases.js`

### ✅ Defined Routes:
- `GET /` - Get all cases (🔒 Auth required)
- `GET /stats` - Get case statistics (🔒 Auth required)
- `GET /:id` - Get case by ID (🔒 Auth required)
- `GET /:id/timeline` - Get case timeline (🔒 Auth required)
- `POST /` - Create case (🔒 Auth required)
- `PUT /:id` - Update case (🔒 Auth required)
- `DELETE /:id` - Delete case (🔒 Auth required)

### 🟢 Status: **COMPREHENSIVE** - Full case management

---

## 💬 **CHAT ROUTES** (`/api/chat/*`)
**File**: `routes/chatRoutes.js`

### ✅ Defined Routes:
- `GET /conversations` - Get user conversations (🔒 Auth required)
- `GET /messages/:partnerId/:partnerType` - Get messages (🔒 Auth required)
- `PUT /messages/read/:partnerId/:partnerType` - Mark as read (🔒 Auth required)
- `GET /unread-count` - Get unread count (🔒 Auth required)
- `POST /upload` - Upload chat files (🔒 Auth required)
- `POST /send` - Send message API fallback (🔒 Auth required)
- `DELETE /conversation/:partnerId/:partnerType` - Delete conversation (🔒 Auth required)

### 🟢 Status: **FULLY FUNCTIONAL** - Real-time chat system

---

## 👥 **CLIENT ROUTES** (`/api/clients/*`)
**File**: `routes/clients.js`

### ✅ Defined Routes:
- `GET /` - Get all clients (🔒 Auth required)
- `GET /:id` - Get client by ID (🔒 Auth required)
- `GET /:id/cases` - Get client cases (🔒 Auth required)
- `GET /:id/invoices` - Get client invoices (🔒 Auth required)
- `POST /` - Create client (🔒 Auth required)
- `PUT /:id` - Update client (🔒 Auth required)
- `DELETE /:id` - Delete client (🔒 Auth required)

### 🟢 Status: **COMPREHENSIVE** - Full client management

---

## 📇 **CONTACT ROUTES** (`/api/contacts/*`)
**File**: `routes/contacts.js`

### ✅ Defined Routes:
- `GET /` - Get all contacts (🔒 Auth required)
- `POST /` - Create contact (🔒 Auth required)
- `PUT /:id` - Update contact (🔒 Auth required)
- `DELETE /:id` - Delete contact (🔒 Auth required)

### 🟡 Status: **BASIC CRUD** - Simple contact management

---

## 📊 **DASHBOARD ROUTES** (`/api/dashboard/*`)
**File**: `routes/dashboard.js`

### ✅ Defined Routes:
- `GET /overview` - Dashboard overview (🔒 Auth required)
- `GET /recent-activity` - Recent activity (🔒 Auth required)
- `GET /revenue` - Revenue data (🔒 Auth required)
- `GET /cases-chart` - Cases chart data (🔒 Auth required)

### 🟢 Status: **ANALYTICS FOCUSED** - Dashboard data endpoints

---

## 📄 **DOCUMENT ROUTES** (`/api/documents/*`)
**File**: `routes/documents.js`

### ✅ Defined Routes:
- `GET /` - Get all documents (🔒 Auth required)
- `GET /:id` - Get document by ID (🔒 Auth required)
- `GET /:id/download` - Download document (🔒 Auth required)
- `POST /` - Upload document (🔒 Auth required)
- `PUT /:id` - Update document (🔒 Auth required)
- `DELETE /:id` - Delete document (🔒 Auth required)

### 🟢 Status: **FILE MANAGEMENT** - Complete document system

---

## 📅 **EVENT ROUTES** (`/api/events/*`)
**File**: `routes/events.js`

### ✅ Defined Routes:
- `GET /` - Get all events (🔒 Auth required)
- `GET /upcoming` - Get upcoming events (🔒 Auth required)
- `GET /calendar` - Get calendar events (🔒 Auth required)
- `POST /` - Create event (🔒 Auth required)
- `PUT /:id` - Update event (🔒 Auth required)
- `DELETE /:id` - Delete event (🔒 Auth required)

### 🟢 Status: **CALENDAR SYSTEM** - Event scheduling

---

## 💰 **EXPENSE ROUTES** (`/api/expenses/*`)
**File**: `routes/expenses.js`

### ✅ Defined Routes:
- `GET /` - Get all expenses (🔒 Auth required)
- `POST /` - Create expense (🔒 Auth required)
- `PUT /:id` - Update expense (🔒 Auth required)
- `PUT /:id/receipt` - Upload receipt (🔒 Auth required)
- `DELETE /:id` - Delete expense (🔒 Auth required)

### 🟢 Status: **EXPENSE TRACKING** - Financial management

---

## 📋 **INTAKE ROUTES** (`/api/intakes/*`)
**File**: `routes/intakes.js`

### ✅ Defined Routes:
- `GET /` - Get all intakes (🔒 Auth required)
- `POST /` - Create intake (🔒 Auth required)
- `PUT /:id` - Update intake (🔒 Auth required)
- `PUT /:id/convert` - Convert to case (🔒 Auth required)

### 🟡 Status: **CLIENT ONBOARDING** - Intake process

---

## 🧾 **INVOICE ROUTES** (`/api/invoices/*`)
**File**: `routes/invoices.js`

### ✅ Defined Routes:
- `GET /` - Get all invoices (🔒 Auth required)
- `GET /stats` - Get invoice statistics (🔒 Auth required)
- `GET /:id/pdf` - Generate PDF (🔒 Auth required)
- `POST /` - Create invoice (🔒 Auth required)
- `PUT /:id` - Update invoice (🔒 Auth required)
- `PUT /:id/send` - Send invoice (🔒 Auth required)
- `PUT /:id/mark-paid` - Mark as paid (🔒 Auth required)
- `DELETE /:id` - Delete invoice (🔒 Auth required)

### 🟢 Status: **BILLING SYSTEM** - Complete invoicing

---

## ⚖️ **LAWYER DASHBOARD** (`/api/lawyer/*`)
**File**: `routes/lawyerDashboard.js`

### ✅ Defined Routes:
- `GET /dashboard/stats` - Dashboard statistics
- `GET /dashboard/overview` - Dashboard overview
- `GET /cases` - Get lawyer cases
- `POST /cases` - Create case
- `GET /clients` - Get lawyer clients
- `GET /appointments` - Get appointments
- `GET /documents` - Get documents
- `GET /invoices` - Get invoices
- `GET /profile` - Get lawyer profile

### ⚠️ Status: **AUTH DISABLED** - Mock user for testing

---

## 👨‍⚖️ **LAWYERS DIRECTORY** (`/api/lawyers/*`)
**File**: `routes/lawyers.js`

### ✅ Defined Routes:
- `GET /` - Get lawyers directory (Public)
- `GET /:id` - Get lawyer by ID (Public)
- `POST /:id/message` - Send message to lawyer (Public)

### 🟢 Status: **PUBLIC DIRECTORY** - Lawyer discovery

---

## 💌 **MESSAGE ROUTES** (`/api/messages/*`)
**File**: `routes/messages.js`

### ✅ Defined Routes:
- `GET /` - Get all messages (🔒 Auth required)
- `POST /` - Create message (🔒 Auth required)
- `PUT /:id/send` - Send message (🔒 Auth required)
- `DELETE /:id` - Delete message (🔒 Auth required)

### 🟡 Status: **BASIC MESSAGING** - Internal messages

---

## 📝 **NOTE ROUTES** (`/api/notes/*`)
**File**: `routes/notes.js`

### ✅ Defined Routes:
- `GET /` - Get all notes (🔒 Auth required)
- `POST /` - Create note (🔒 Auth required)
- `PUT /:id` - Update note (🔒 Auth required)
- `DELETE /:id` - Delete note (🔒 Auth required)

### 🟡 Status: **BASIC CRUD** - Note-taking

---

## 💳 **PAYMENT ROUTES** (`/api/payments/*`)
**File**: `routes/payments.js`

### ✅ Defined Routes:
- `GET /` - Get all payments (🔒 Auth required)
- `POST /` - Create payment (🔒 Auth required)
- `PUT /:id` - Update payment (🔒 Auth required)
- `DELETE /:id` - Delete payment (🔒 Auth required)

### 🟡 Status: **BASIC CRUD** - Payment tracking

---

## ✅ **TASK ROUTES** (`/api/tasks/*`)
**File**: `routes/tasks.js`

### ✅ Defined Routes:
- `GET /` - Get all tasks (🔒 Auth required)
- `GET /my-tasks` - Get user's tasks (🔒 Auth required)
- `POST /` - Create task (🔒 Auth required)
- `PUT /:id` - Update task (🔒 Auth required)
- `PUT /:id/status` - Update task status (🔒 Auth required)
- `DELETE /:id` - Delete task (🔒 Auth required)

### 🟢 Status: **TASK MANAGEMENT** - Complete task system

---

## ⏱️ **TIME ENTRY ROUTES** (`/api/time-entries/*`)
**File**: `routes/timeEntries.js`

### ✅ Defined Routes:
- `GET /` - Get all time entries (🔒 Auth required)
- `POST /` - Create time entry (🔒 Auth required)
- `POST /start-timer` - Start timer (🔒 Auth required)
- `PUT /:id` - Update time entry (🔒 Auth required)
- `PUT /:id/stop-timer` - Stop timer (🔒 Auth required)
- `DELETE /:id` - Delete time entry (🔒 Auth required)

### 🟢 Status: **TIME TRACKING** - Billing time management

---

## 📤 **UPLOAD ROUTES** (`/api/upload/*`)
**File**: `routes/upload.js`

### ✅ Defined Routes:
- `POST /image` - Upload image (🔒 Auth required)

### 🟡 Status: **BASIC UPLOAD** - Secure file upload

---

## 🚨 **SECURITY NOTES:**

### ⚠️ **Development Mode Issues:**
1. **Admin routes** - Authentication disabled
2. **Lawyer dashboard** - Mock user authentication
3. **Blog routes** - Mock user for testing

### 🔒 **Authentication Status:**
- **Most routes**: Require `authenticateToken` middleware
- **Public routes**: Lawyer directory, blog reading
- **Admin routes**: Should require `authenticateAdmin` (currently disabled)

### 📊 **Usage Classification:**

#### 🟢 **Heavily Used (Core Features):**
- Auth routes
- Chat routes
- Case management
- Client management
- Document management
- Invoice system
- Time tracking

#### 🟡 **Moderately Used (Supporting Features):**
- Task management
- Event management
- Expense tracking
- Blog system

#### 🔴 **Lightly Used (Basic CRUD):**
- Contact management
- Note-taking
- Payment tracking
- Message system

#### ⚠️ **Development/Testing:**
- Admin routes (auth disabled)
- Lawyer dashboard (mock auth)

---

## 🎯 **Recommendations:**

1. **Enable authentication** on admin and lawyer dashboard routes
2. **Remove mock users** from production
3. **Audit unused endpoints** for removal
4. **Implement proper role-based access control**
5. **Add API rate limiting** to public endpoints