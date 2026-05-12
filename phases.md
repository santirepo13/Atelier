# ATELIER Implementation Phases

> Tracking document for all implementation work.
> Status: 🟢 Done | 🟡 In Progress | ⚪ Pending

---

## Phase 0: Setup & SQL Schema
- Status: 🟢 Done
- Created: `database/schema/init_schema.sql`
- Contains all 5 tables: users, products, cart_items, orders, order_items
- Includes indexes, constraints, CHECK rules per SRS.md Section 14.2
- Includes sample data (5 products) for seeding
- **Action required:** Run on PostgreSQL `87.239.135.39`:
  ```bash
  psql -h 87.239.135.39 -U <user> -d atelier -f database/schema/init_schema.sql
  ```

## Phase 1: Backend — Core Infrastructure
- Status: 🟢 Done
- Files:
  - `backend/package.json`
  - `backend/.env.example`
  - `backend/server.js`
  - `backend/src/config/db.js`
  - `backend/src/config/firebaseAdmin.js`
  - `backend/src/middleware/auth.js`
  - `backend/src/models/queries.js`

## Phase 2: Backend — Models & Controllers
- Status: 🟢 Done
- Files:
  - `backend/src/controllers/products.js`
  - `backend/src/controllers/cart.js`
  - `backend/src/controllers/orders.js`
  - `backend/src/controllers/users.js`
  - `backend/src/routes/products.js`
  - `backend/src/routes/cart.js`
  - `backend/src/routes/orders.js`
  - `backend/src/routes/users.js`

## Phase 3: Backend — Admin Queries
- Status: 🟢 Done
- Files:
  - `database/adminQueries/products_insert.sql`
  - `database/adminQueries/products_update.sql`
  - `database/adminQueries/products_delete.sql`
  - `database/adminQueries/products_list_all.sql`
  - `database/adminQueries/users_insert.sql`
  - `database/adminQueries/users_update.sql`
  - `database/adminQueries/users_delete.sql`
  - `database/adminQueries/cart_clear.sql`

## Phase 4: Frontend — MVC Layers
- Status: 🟢 Done
- Files:
  - `js/config/api.js`
  - `js/models/authModel.js`
  - `js/models/productModel.js`
  - `js/models/cartModel.js`
  - `js/models/orderModel.js`
  - `js/controllers/productController.js`
  - `js/controllers/cartController.js`
  - `js/controllers/orderController.js`

## Phase 5: Frontend — Refactor Existing JS
- Status: 🟢 Done
- Refactored files (all now use API + Firebase Auth, no Firestore for data):
  - `js/script.js` — uses productModel + cartModel (no Firestore)
  - `js/login.js` — uses authModel
  - `js/registro.js` — uses authModel
  - `js/history.js` — uses orderModel + orderController

## Phase 6: Views — Move HTML + Fix Paths
- Status: 🟢 Done
- Actions completed:
  - Created `views/` directory
  - Moved all HTML files to `views/`:
    - `views/index.html`
    - `views/login.html`
    - `views/register.html`
    - `views/history.html`
    - `views/producto.html`
    - `views/registro-exito.html`
  - Moved service pages to `views/servicios/`:
    - `views/servicios/PQR.html`
    - `views/servicios/trabajaconnosotros.html`
    - `views/servicios/vendeconnosotros.html`
    - `views/servicios/listadedeseos.html`
    - `views/servicios/comprascorporativas.html`
    - `views/servicios/servicioalcliente.html`
  - Fixed image paths:
    - `./img/` → `../img/` (in views/)
    - `./img/` → `../../img/` (in views/servicios/)
  - Fixed CSS paths:
    - `css/style.css` → `../css/style.css`
  - Updated script paths to use `../js/...`

## Phase 7: Final Verification
- Status: ⚪ Pending
- Actions required:
  - Start backend: `cd backend && npm install && node server.js`
  - Verify PostgreSQL connection
  - Test API endpoints with curl
  - Configure VS Code Live Server for `views/`
  - Full end-to-end test with Firebase Auth + PostgreSQL

---

## SRS.md Compliance Summary

| Requirement | Status | Notes |
|-------------|--------|-------|
| FR-001: Firebase Auth | ✅ Done | authModel.js handles login/register with Firebase |
| FR-002: Token verification | ✅ Done | backend/src/middleware/auth.js |
| FR-003: PostgreSQL storage | ✅ Done | All data now in PostgreSQL via API |
| FR-004: Product API | ✅ Done | GET /api/products, GET /api/products/:id |
| FR-005: Cart CRUD | ✅ Done | All 5 cart endpoints implemented |
| FR-006: Order checkout | ✅ Done | Transaction with BEGIN/COMMIT/ROLLBACK |
| FR-007: Purchase history | ✅ Done | GET /api/orders returns history |
| FR-008: User profile creation | ✅ Done | POST /api/users on registration |
| FR-009: Data ownership | ✅ Done | All queries include WHERE user_id = $1 |
| FR-010: Payment methods | ✅ Done | card, PSE, Efecty in wizard |
| FR-011: MVC architecture | ✅ Done | views/, js/controllers/, js/models/ |
| FR-012: SQL repository | ✅ Done | 23 SQL files in database/ |
| FR-013: Easiest path | ✅ Done | No ORM, minimal deps |
| FR-014: 2FA validation | ✅ Done | POST /api/users/2auth |

---

## Implementation Gaps (Remaining)

1. **No Firebase service account file** — `backend/service-account.json` not in repo
2. **No `.env` file** — Must be created from `.env.example`
3. **Backend not tested** — No Live Server configured
4. **Database not initialized on server** — Schema must be run manually