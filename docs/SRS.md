```text
SRS_REVIEW_CONTEXT
```

---

# 1. Purpose

## 1.1 System Purpose

```text
The system exists to:
Provide a Colombian e-commerce platform "ATELIER – Arte que cuenta historias"
that enables users to browse and purchase handmade artisanal products, manage
a shopping cart, process payments through multiple Colombian payment methods
(credit/debit cards, PSE, Efecty), view purchase history, and maintain user
accounts with secure authentication via Firebase, while storing all business
data in a PostgreSQL database.
```

## 1.2 Review Purpose

```text
This SRS context is intended to help an LLM review:
- Bugs and missing requirements
- Compliance with MVC separation principles
- Implementation simplicity (easiest path adherence)
- Test coverage gaps
- Security violations (SQL injection, token handling)
- Data handling and migration completeness
- API contract adherence
- Architecture implementation alignment
```

---

# 2. Scope

## 2.1 In Scope

| ID     | In-Scope Item |
| ------ | ------------- |
| SC-001 | User registration and authentication via Firebase Auth (unchanged) |
| SC-002 | Product catalog stored in PostgreSQL, accessed via REST API |
| SC-003 | Shopping cart operations via PostgreSQL (CRUD) |
| SC-004 | Order processing and history in PostgreSQL |
| SC-005 | Backend API: Node.js/Express with full layered structure |
| SC-006 | SQL query repository organized by domain responsibility |
| SC-007 | MVC architecture: Views (HTML/CSS), Controllers (JS), Model (PostgreSQL) |
| SC-008 | Fresh PostgreSQL database setup (`database/schema/init_schema.sql`) |
| SC-009 | Colombian payment simulation (card/PSE/Efecty) |
| SC-010 | Responsive UI (existing CSS preserved, views moved to views/) |
| SC-011 | Admin SQL query files for manual database operations (`database/adminQueries/`) |

## 2.2 Out of Scope

| ID      | Out-of-Scope Item | Reason |
| ------- | ----------------- | ------ |
| OOS-001 | Admin panel for product management | Academic MVP scope |
| OOS-002 | Real-time stock/inventory alerts | Simple catalog listing |
| OOS-003 | Email or SMS notifications | No email infrastructure |
| OOS-004 | Product search, filtering, or sorting | Full listing only |
| OOS-005 | User reviews or ratings system | Not in MVP |
| OOS-006 | Mobile native applications | Web-only deliverable |
| OOS-007 | Complex analytics or reporting dashboards | Simple history view |
| OOS-008 | ORM or query-builder layer | Raw SQL only (academic requirement) |
| OOS-009 | Microservices architecture | Monolithic backend |
| OOS-010 | Docker or container orchestration | Direct Node.js deployment |

---

# 3. Glossary, Definitions, Acronyms, and Domain Terms

This section is mandatory for LLM review.

| Term | Type | Definition | System Meaning |
| ---- | ---- | ---------- | -------------- |
| MVC | Pattern | Model-View-Controller | Architecture: HTML=View, JS=Controller, PostgreSQL=Model |
| PostgreSQL | Database | Relational database management system | Primary data store replacing Firestore |
| Firebase Auth | Service | Google's authentication service | Only retained Firebase component (login/registration) |
| REST API | Architecture | Representational State Transfer | HTTP+JSON endpoints between frontend and backend |
| SQL Repository | Organization | Directory of `.sql` files grouped by domain | All queries stored as separate files in `backend/sql/` |
| MVP | Principle | Minimum Viable Product | Simplest implementation that satisfies requirements |
| Easiest Path | Principle | Choose the simplest solution | No over-engineering; minimal files and abstractions |
| Model | MVC Layer | Data layer | PostgreSQL tables + SQL query files in repository |
| View | MVC Layer | Presentation layer | HTML templates in `views/`, CSS in `css/` |
| Controller | MVC Layer | Logic layer | JavaScript modules: request handling, DOM updates, API calls |
| Service | MVC Layer | Utility layer | Shared helpers: auth helpers, formatters, loader control |
| Middleware | Backend | Request processing | Express middleware for auth token verification |
| Controller (API) | Backend | Route handler | Express route file mapping endpoints to query functions |
| Repository (SQL) | Backend | Query storage | `database/` directory with subfolders: `schema/`, `products/`, `cart/`, `orders/`, `users/`, `adminQueries/` — one `.sql` file per query |
| Firebase ID Token | Security | JWT issued by Firebase | Sent in `Authorization: Bearer <token>` header |
| 2Auth | Endpoint | Second-factor security question validation | `POST /api/users/2auth` validates `clave_tipo` + `clave_respuesta` |
| Parameterized Query | Security | SQL with `$1, $2` placeholders | Prevents SQL injection; values passed as array |

---

# 4. Requirement Language Rules

Include this because the LLM needs to understand requirement force.

| Word | Meaning |
| ---- | ------------------------------------ |
| Shall | Mandatory |
| Must | Mandatory |
| Must not | Forbidden |
| Should | Recommended but not mandatory |
| May | Optional / allowed |
| Can | Capability, not necessarily required |

---

# 5. System Context

## 5.1 Product Overview

| Area | Description |
| ---- | ----------- |
| Product name | ATELIER E-Commerce Platform |
| Product type | Web application with Node.js backend API |
| Primary users | Colombian consumers purchasing artisanal products |
| Main goal | Enable online sales with Firebase authentication + PostgreSQL data storage |
| Deployment environment | Frontend: static hosting; Backend: Node.js/Express on 87.239.135.39:3000; Database: PostgreSQL `atelier` on 87.239.135.39 |
| Main external dependencies | Firebase Authentication (login only), `pg` Node.js driver for PostgreSQL |

## 5.2 Actors and External Systems

| Actor / System | Type | Interaction With System |
| -------------- | ---- | ----------------------- |
| Guest User | Human user (unauthenticated) | Browse products via `GET /api/products`, view static pages |
| User | Human user (authenticated via Firebase) | All CRUD: cart, orders, profile via authenticated API |
| Firebase Auth | External identity provider | Issues ID tokens for login/registration |
| Backend API (Express.js) | Internal HTTP server | REST endpoints on `87.239.135.39:3000` |
| PostgreSQL Database | External relational database | Stores users, products, cart_items, orders, order_items |
| Frontend (Browser) | Client application | HTML/JS making `fetch()` calls to Backend API |

---

# 6. User Classes and Permissions

| User Class | Description | Allowed Actions | Forbidden Actions |
| ---------- | ----------- | --------------- | ----------------- |
| Guest | Not authenticated; no Firebase UID | Browse products (`GET /api/products`), view static pages | Add to cart, checkout, view history, access profile |
| User | Authenticated via Firebase; has Firebase UID | Full cart CRUD, place orders, view own order history, manage own profile | Access other users' data, access admin functions |
| Admin | Not implemented in MVP | N/A | N/A |

---

# 7. Functional Requirements

## 7.1 Functional Requirement Format

| Field | Value |
| ---------------------- | ------------------------------- |
| Requirement ID | FR-001 |
| Requirement | The system shall... |
| Actor | |
| Trigger | |
| Input | |
| Processing Rule | |
| Output | |
| Error Behavior | |
| Acceptance Criteria | |
| Related Business Rules | |
| Related Test Cases | |

## 7.2 Functional Requirements

| ID | Requirement | Acceptance Criteria |
| ---- | ----------- | ------------------- |
| FR-001 | The system shall authenticate users via Firebase Auth (email/password + Google Sign-In). | Login and registration work; Firebase ID token returned. |
| FR-002 | The system shall verify the Firebase ID token on every protected API request. | Backend middleware extracts `req.uid`; invalid/expired tokens return HTTP 401. |
| FR-003 | The system shall store all business data in PostgreSQL (users, products, cart, orders) — Firestore is not used for any data storage after migration. | All data operations target PostgreSQL via REST API. |
| FR-004 | The system shall expose a RESTful API for product browsing. | `GET /api/products` returns JSON array; `GET /api/products/:id` returns single product. |
| FR-005 | The system shall manage a shopping cart CRUD via the API. | Users can add (`POST /api/cart/items`), update quantity (`PUT /api/cart/items/:id`), remove (`DELETE /api/cart/items/:id`), list (`GET /api/cart`), and get total (`GET /api/cart/total`). |
| FR-006 | The system shall process checkout by creating an order. | `POST /api/orders` creates order + order_items in a single transaction, then clears the cart. |
| FR-007 | The system shall provide purchase history. | `GET /api/orders` returns the authenticated user's orders with line items, totals, dates, and payment methods. |
| FR-008 | The system shall create a user profile in PostgreSQL immediately after Firebase registration. | `POST /api/users` stores `uid`, `username`, `email`, `clave_tipo`, `clave_respuesta`. |
| FR-009 | The system shall enforce data ownership: users can only access their own cart and orders. | All SQL queries include `WHERE user_id = $1` where `$1 = req.uid` from the verified token. |
| FR-010 | The system shall support simulated Colombian payment methods: credit/debit card, PSE, and Efecty. | Frontend validates payment method selection; backend stores `payment_method` field in the order. |
| FR-011 | The system shall serve as an MVC architecture with full responsibility separation. | Views = `views/*.html`; Controllers = `js/controllers/*.js`; Model = PostgreSQL + `backend/models/*.js` + `backend/sql/**/*.sql`. |
| FR-012 | The system shall organize all SQL queries in a dedicated repository with one query per file. | Every SQL statement lives in its own `.sql` file under `backend/sql/` organized by domain. |
| FR-013 | The system shall follow the "easiest path" simplicity principle in all implementation. | Minimal number of files, dependencies, and abstraction layers; no ORM, no build tools, no frameworks beyond Express and `pg`. |
| FR-014 | The system shall validate the security question answer during login via a dedicated API endpoint. | Frontend calls `POST /api/users/2auth` with `{ tipo, respuesta }` and valid Firebase token; backend returns `{ valid: true/false }`. |

---

# 8. Use Cases / User Flows

## UC-001: User Registration (Firebase + PostgreSQL)

| Field | Description |
| ----- | ----------- |
| Use Case ID | UC-001 |
| Actor | Guest User |
| Goal | Create an account via Firebase Auth and a corresponding user profile in PostgreSQL |
| Preconditions | User is on `views/register.html` and not logged in |
| Trigger | User submits the registration form |
| Postconditions | Firebase user is created; PostgreSQL `users` row is inserted; user is redirected to login |
| Related Requirements | FR-001, FR-008 |

### Main Flow

| Step | Actor Action | System Response |
| ---- | ------------ | --------------- |
| 1 | User fills registration form (username, email, password, security question/answer) | Frontend captures input |
| 2 | User clicks "Registrarse" | `authController.register()` calls Firebase `createUserWithEmailAndPassword()` |
| 3 | | Firebase creates authentication user, returns ID token |
| 4 | | Frontend calls `POST /api/users` with `{ uid, username, email, claveTipo, claveRespuesta }` and `Authorization: Bearer <token>` |
| 5 | | Backend `authMiddleware` verifies the Firebase token, extracts `req.uid` |
| 6 | | Backend `usersController.createUser()` executes `sql/users/create.sql` with parameters |
| 7 | | PostgreSQL inserts row into `users` table |
| 8 | | Backend returns `201 Created { success: true }` |
| 9 | | Frontend signs out from Firebase, redirects to `views/registro-exito.html` |

### Alternative Flows

| Flow ID | Condition | Expected Behavior |
| ------- | --------- | ----------------------- |
| AF-001 | Email already registered in Firebase | Firebase returns error; frontend shows alert "Email ya registrado" |
| AF-002 | Password and confirmation do not match | Client-side validation prevents submission; shows "Las contraseñas no coinciden" |
| AF-003 | Required field is empty | Client-side validation prevents submission; shows "Completa todos los campos" |
| AF-004 | User profile already exists in PostgreSQL (duplicate `uid`) | Backend returns `409 Conflict { error: "Perfil ya existe" }` |

### Exception Flows

| Flow ID | Error Condition | Expected System Response |
| ------- | --------------- | ------------------------ |
| EX-001 | Network error during Firebase registration | Frontend catches error, shows "Error de conexión" |
| EX-002 | Network error during `POST /api/users` | Frontend catches error, shows "Error al crear perfil" |
| EX-003 | Database error on user insert (constraint violation, connection lost) | Backend returns `500 Internal Server Error { error: "..." }` |

---

## UC-002: Login and Browse Products

| Field | Description |
| ----- | ----------- |
| Use Case ID | UC-002 |
| Actor | Registered User |
| Goal | Authenticate via Firebase and browse the product catalog |
| Preconditions | User has an account; is on `views/login.html` |
| Trigger | User submits login form or clicks Google Sign-In |
| Postconditions | Session is established; user sees the product carousel |
| Related Requirements | FR-001, FR-002, FR-004 |

### Main Flow

| Step | Actor Action | System Response |
| ---- | ------------ | --------------- |
| 1 | User enters email/username and password | Frontend captures credentials |
| 2 | User clicks "Iniciar sesión" | `authController.login()` calls Firebase `signInWithEmailAndPassword()` |
| 3 | | Firebase validates credentials, returns ID token |
| 4 | | Frontend stores token in `sessionStorage` |
| 5 | | Firebase `onAuthStateChanged` observer fires; UI updates (user menu shows alias) |
| 6 | | `productController.init()` is called on `views/index.html` |
| 7 | | `productController` calls `productModel.getAll()` which does `GET /api/products` (no auth needed) |
| 8 | | Backend executes `sql/products/get_all.sql`, returns JSON array |
| 9 | | Frontend renders product carousel dynamically |

### Alternative Flows

| Flow ID | Condition | Expected Behavior |
| ------- | --------- | ----------------------- |
| AF-001 | User chooses Google Sign-In | Google OAuth popup opens; Firebase returns credentials |
| AF-002 | Invalid credentials | Firebase returns error; frontend shows "Contraseña incorrecta" |
| AF-003 | User is already logged in (`onAuthStateChanged` fires on page load) | Auto-redirect to `views/index.html`; load products |

### Exception Flows

| Flow ID | Error Condition | Expected System Response |
| ------- | --------------- | ------------------------ |
| EX-001 | Network error during login | Frontend shows "Error de conexión" |
| EX-002 | Product API returns error (`GET /api/products`) | Frontend shows "Error al cargar productos" |

---

## UC-003: Shopping Cart — Add, Update, Remove Items

| Field | Description |
| ----- | ----------- |
| Use Case ID | UC-003 |
| Actor | Registered User |
| Goal | Manage products in the shopping cart |
| Preconditions | User is logged in; product catalog is displayed |
| Trigger | User clicks "Agregar" on a product card |
| Postconditions | Cart is updated; cart counter reflects the change |
| Related Requirements | FR-005, FR-009 |

### Main Flow (Add Item)

| Step | Actor Action | System Response |
| ---- | ------------ | --------------- |
| 1 | User clicks "Agregar" on product card | `productController.addToCart(productId)` is triggered |
| 2 | | Frontend calls `cartModel.addItem(productId, quantity=1)` → `POST /api/cart/items` with token |
| 3 | | Backend `authMiddleware` verifies token → `req.uid` set |
| 4 | | Backend `cartController.addItem()` validates product exists (`sql/products/get_by_id.sql`) |
| 5 | | Backend executes `sql/cart/add_item.sql`: `INSERT ... ON CONFLICT (user_id, product_id) DO UPDATE SET quantity = EXCLUDED.quantity` |
| 6 | | Backend returns `201 Created { id, quantity }` |
| 7 | | Frontend calls cart total → `cartModel.getTotal()` → `GET /api/cart/total` |
| 8 | | Backend executes `sql/cart/get_total.sql`, returns `{ total: 135000 }` |
| 9 | | Frontend updates cart counter badge |

### Alternative Flows

| Flow ID | Condition | Expected Behavior |
| ------- | --------- | ----------------------- |
| AF-001 | Product already in cart | SQL `ON CONFLICT` (upsert) updates quantity |
| AF-002 | Quantity updated in cart popup | `PUT /api/cart/items/:id` with new quantity |
| AF-003 | User removes item from cart | `DELETE /api/cart/items/:id` removes item |

### Exception Flows

| Flow ID | Error Condition | Expected System Response |
| ------- | --------------- | ------------------------ |
| EX-001 | Token expired or invalid | Backend returns 401; frontend redirects to login |
| EX-002 | Product ID does not exist | Backend returns 404; frontend shows "Producto no encontrado" |
| EX-003 | Database error during insert | Backend returns 500; frontend shows "Error al agregar al carrito" |

---

## UC-004: Checkout and Order Placement

| Field | Description |
| ----- | ----------- |
| Use Case ID | UC-004 |
| Actor | Registered User |
| Goal | Complete a purchase and place an order |
| Preconditions | User is logged in; cart has at least 1 item |
| Trigger | User clicks "Finalizar compra" in cart popup |
| Postconditions | Order is created in PostgreSQL; cart is cleared; user sees success page |
| Related Requirements | FR-006, FR-009, FR-010 |

### Main Flow

| Step | Actor Action | System Response |
| ---- | ------------ | --------------- |
| 1 | User clicks cart icon → "Finalizar compra" | `orderController.showCheckout()` opens modal |
| 2 | | Frontend calls `cartModel.getTotal()` and displays the order summary |
| 3 | User selects payment method (card / PSE / Efecty) and fills details | Frontend validates form |
| 4 | User clicks "Pagar ahora" | `orderController.checkout()` is called |
| 5 | | Frontend collects cart items from `cartModel.getItems()` |
| 6 | | Frontend calls `orderModel.create(items, paymentMethod, total)` → `POST /api/orders` |
| 7 | | Backend verifies token via `authMiddleware` |
| 8 | | **Backend begins a PostgreSQL transaction** |
| 9 | | Backend executes `sql/orders/create.sql`: inserts into `orders`, returns `orderId` |
| 10 | | For each cart item: executes `sql/orders/create_item.sql`: inserts into `order_items` with denormalized `product_name` and `product_price` |
| 11 | | Backend executes `sql/cart/clear_cart.sql`: `DELETE FROM cart_items WHERE user_id = $1` |
| 12 | | **Backend commits transaction** |
| 13 | | Backend returns `201 Created { orderId, status: "pending" }` |
| 14 | | Frontend shows success modal "Compra realizada con éxito" |
| 15 | | User clicks "Finalizar"; front redirects to `views/history.html` |

### Alternative Flows

| Flow ID | Condition | Expected Behavior |
| ------- | --------- | ----------------------- |
| AF-001 | Cart is empty | Frontend blocks checkout; shows "Tu carrito está vacío" |
| AF-002 | Payment form is invalid | Submit button stays disabled until all fields are valid |

### Exception Flows

| Flow ID | Error Condition | Expected System Response |
| ------- | --------------- | ------------------------ |
| EX-001 | Transaction fails (e.g., product deleted mid-checkout) | Backend rolls back transaction; returns 500; frontend shows error |
| EX-002 | Network error during order creation | Frontend shows "Error al procesar el pedido"; user can retry |
| EX-003 | Cart cleared but order insert fails | Transaction rollback ensures cart is NOT cleared |

---

## UC-005: View Purchase History

| Field | Description |
| ----- | ----------- |
| Use Case ID | UC-005 |
| Actor | Registered User |
| Goal | View past orders with details |
| Preconditions | User is logged in and has at least one order |
| Trigger | User clicks "Historial" in sidebar or header |
| Postconditions | History page displays all past orders with items, totals, dates, and payment methods |
| Related Requirements | FR-007 |

### Main Flow

| Step | Actor Action | System Response |
| ---- | ------------ | --------------- |
| 1 | User clicks "Historial" | Navigation to `views/history.html` |
| 2 | | `orderController.init()` calls `orderModel.getOrders()` → `GET /api/orders` with token |
| 3 | | Backend verifies token, executes `sql/orders/get_orders.sql`: `SELECT * FROM orders WHERE user_id = $1` |
| 4 | | For each order: backend executes `sql/orders/get_details.sql` to get line items |
| 5 | | Backend returns JSON array of orders, each with nested `items` array (denormalized names and prices) |
| 6 | | Frontend `orderController.renderHistory(orders)` builds HTML cards |
| 7 | | Each card shows: order date, payment method, status, list of products with quantities and prices, total |

### Exception Flows

| Flow ID | Error Condition | Expected System Response |
| ------- | --------------- | ------------------------ |
| EX-001 | No orders exist | Frontend shows "No tienes compras registradas" |
| EX-002 | Network error | Frontend shows "Error al cargar historial" |

---

# 9. Business Rules

| Rule ID | Business Rule | Related Requirements |
| ------- | ------------- | -------------------- |
| BR-001 | **Firebase UID is the authoritative user identifier**. All non-auth data operations use the Firebase UID (from the verified token) as the foreign key (`user_id`) in PostgreSQL. | FR-002, FR-009 |
| BR-002 | **User profile must be created in PostgreSQL immediately after Firebase registration**. The `POST /api/users` call is made on the frontend right after `createUserWithEmailAndPassword()` succeeds. | FR-008 |
| BR-003 | **Product prices are stored as unsigned integers** representing Colombian Pesos (COP). Example: `45000` means 45,000 COP. No decimal currency handling needed (smallest unit is 1 COP). | FR-004 |
| BR-004 | **Cart items are unique per user and product**. The `cart_items` table has a `UNIQUE(user_id, product_id)` constraint. Adding the same product again updates the quantity (upsert behavior). | FR-005 |
| BR-005 | **Cart quantities must be ≥ 1**. A quantity of 0 or negative is rejected by the API and by a `CHECK` constraint in the database. | FR-005 |
| BR-006 | **Order creation is an atomic transaction**. All three steps (insert order header, insert line items, delete cart) succeed or all fail together. Partial orders are never left in the database. | FR-006 |
| BR-007 | **Order line items denormalize the product name and price at the time of purchase**. Historical orders preserve the exact price paid, even if the product price changes later. | FR-006 |
| BR-008 | **Users can only access their own data**. Every SQL query for cart, orders, and profile includes `WHERE user_id = $1` where `$1` is the Firebase UID from the verified token. | FR-009 |
| BR-009 | **Security question/answer is stored in PostgreSQL**, not in Firebase custom claims. The `users.clave_tipo` and `users.clave_respuesta` columns store this data. | FR-008 |
| BR-010 | **Payment is simulated**. No real financial transactions occur. The `orders.payment_method` column records which method the user selected, and the `orders.status` is set to `'pending'`. | FR-010 |
| BR-011 | **SQL queries are organized in a dedicated repository** (`backend/sql/`). Each `.sql` file contains exactly one SQL statement with `$1, $2` positional parameters. No string concatenation or dynamic SQL in the code. | FR-012 |
| BR-012 | **No ORM or query builder** is used. The `pg` library's raw `query(sql, params)` method is the only database interface. | FR-013 |
| BR-013 | **Security question is validated at login** as a second authentication factor. The backend endpoint `POST /api/users/2auth` verifies `clave_tipo` and `clave_respuesta` against the `users` table. | FR-014 |

---

# 10. Validation Rules

This section is mandatory for LLM review.

| Rule ID | Field / Input | Validation Rule | Expected Error |
| ------- | --------------- | --------------- | -------------- |
| VAL-001 | Firebase ID token (all protected routes) | Token is present, not expired, and successfully verified by `admin.auth().verifyIdToken()` | HTTP 401 `{ "error": "Unauthorized" }` |
| VAL-002 | Product ID in cart operations | Must reference an existing row in `products` table | HTTP 404 `{ "error": "Producto no encontrado" }` |
| VAL-003 | Cart quantity | Must be a positive integer ≥ 1 | HTTP 400 `{ "error": "La cantidad debe ser mayor o igual a 1" }` |
| VAL-004 | Order creation body | `items` array must have at least 1 element | HTTP 400 `{ "error": "El carrito está vacío" }` |
| VAL-005 | User registration input | `username` must not already exist, `email` must not already exist | HTTP 409 `{ "error": "Nombre de usuario o correo ya existe" }` |
| VAL-006 | User registration input | `username` must not already exist, `email` must not already exist | HTTP 409 `{ "error": "Nombre de usuario o correo ya existe" }` |
| VAL-007 | Cart item ownership on update/delete | The `cart_items.id` being modified must belong to `req.uid` (via `WHERE user_id = $1 AND id = $2`) | Returns empty result; treated as "not found" (silent rejection for security) |
| VAL-008 | Payment method on order | Must be one of the allowed values: `"card"`, `"PSE"`, `"Efecty"` | HTTP 400 `{ "error": "Método de pago no válido" }` |
| VAL-009 | All SQL parameters | All user-provided values must be passed as parameterized `$N` placeholders, never concatenated into the SQL string | Code review failure; throws error at runtime if violated |
| VAL-010 | Security question answer (login) | `tipo` must be 1, 2, or 3; `respuesta` must match the stored `clave_respuesta` for the user's `uid` | HTTP 401 `{ valid: false }` via `/api/users/2auth` |

---

# 11. Error Handling Requirements

This section is mandatory for LLM review.

| Error ID | Condition | Expected System Behavior | Related Requirement |
| -------- | --------- | ------------------------ | ------------------- |
| ERR-001 | Token is missing or malformed in API request | Return `401 Unauthorized` with `{ "error": "Token no proporcionado" }` | FR-002 |
| ERR-002 | Token is expired or Firebase verification fails | Return `401 Unauthorized` with `{ "error": "Token inválido o expirado" }` | FR-002 |
| ERR-003 | Product ID does not exist when adding to cart | Return `404 Not Found` with `{ "error": "Producto no encontrado" }` | FR-005 |
| ERR-004 | Cart is empty when attempting checkout | Return `400 Bad Request` with `{ "error": "El carrito está vacío" }` | FR-006 |
| ERR-005 | Database connection failure | Return `503 Service Unavailable` with `{ "error": "Servicio no disponible" }` | All |
| ERR-006 | Generic internal error (uncaught exception) | Log the full error server-side; return `500 Internal Server Error` with `{ "error": "Error interno" }` | All |
| ERR-007 | User attempts to modify another user's cart item | SQL `WHERE user_id = $1` filter returns no rows; return `403 Forbidden` or silent 404 (silent is preferred for security) | FR-009 |
| ERR-008 | Firebase registration fails (e.g., email already in use) | Frontend catches the error and displays the Firebase error message | FR-001 |
| ERR-009 | Transaction deadlock or serialization failure during checkout | Retry logic (max 3 attempts) or return `500` with retry suggestion | FR-006 |

---

# 12. UI Requirements

Use only if the system has a user interface.

| ID     | Requirement | Screen / Component | Acceptance Criteria |
| ------ | ----------- | ------------------ | ------------------- |
| UI-001 | The system shall display a global loading overlay during async operations. | All pages (`global-loader` div) | Overlay with spinning animation appears while `fetch()` requests are in-flight. |
| UI-002 | The system shall dynamically render the product carousel from API data. | `views/index.html`, `views/producto.html` | Carousel items are populated via JavaScript from `GET /api/products`. |
| UI-003 | The system shall update the cart item counter in real-time. | Header `.contador` span | Counter reflects the number of unique items in the cart (not total quantity). |
| UI-004 | The system shall display a slide-out cart popup. | Header `.carrito-popup` | Popup toggles open/closed; shows product name, price, quantity, and delete button per item. |
| UI-005 | The system shall validate payment form fields before submission. | Checkout modal | "Pagar ahora" / "Generar pago" button remains disabled until required fields are filled and valid. |
| UI-006 | The system shall render order history cards. | `views/history.html` | Each order card shows date, payment method, status, list of products with thumbnails, and total value in COP. |
| UI-007 | The system shall display error messages to the user. | Various (via `alert()`) | Error messages are in Spanish and are user-friendly (no raw exception details). |
| UI-008 | The system shall adapt to mobile screens (≤1050px). | All pages | Sidebar hamburger menu appears; desktop navigation hides. |

## 12.1 Screen Definitions

| Screen ID | Screen Name | Purpose | Visible Data | Allowed Actions |
| --------- | ----------- | ------- | ------------ | --------------- |
| SCR-001 | Home | Product catalog browsing | Product carousel, category menu, cart icon | Browse products, add to cart, navigate to other pages |
| SCR-002 | Login | User authentication | Email/username, password fields, Google button | Log in with email/password or Google, navigate to registration |
| SCR-003 | Register | New user registration | Username, email, password, security question form | Create account |
| SCR-004 | Product Detail | Single product showcase | Artisan photo, description, "Add to cart" button | View artisan info, add product to cart |
| SCR-005 | Cart (popup) | Quick cart view | Cart items list, total, checkout button | Update quantities, remove items, proceed to checkout |
| SCR-006 | Checkout | Payment wizard modal | Payment method selection, form fields per method | Select payment method, enter details, confirm purchase |
| SCR-007 | History | Purchase history | List of past order cards with details | View order details |
| SCR-008 | Success page | Registration confirmation | Success message, auto-redirect timer | Wait and auto-redirect to login |
| SCR-009 | Static services pages | Informational content | Service descriptions with images | View only (no interaction) |

---

# 13. API Requirements

Use only if the system exposes or consumes APIs.

## 13.1 Endpoint Format

| Field | Value |
| ----- | ----- |
| Base URL | `http://87.239.135.39:3000/api` |
| Protocol | HTTP (HTTPS in production via reverse proxy) |
| Response format | `application/json` |
| Auth header | `Authorization: Bearer <firebase_id_token>` |
| Auth-required | All endpoints **except** `GET /api/products` (public) |

## 13.2 API Endpoints

| Endpoint ID | Method | Route | Description | Auth? | Body | Success Response | Error Responses |
| ----------- | ------ | ----- | ------------ | ---- | ---- | ----------------- | ---------------- |
| API-001 | GET | `/api/products` | List all products (public) | No | — | `200 OK` `[{ id, nombre, precio, imagen, descripcion }]` | `500` on DB error |
| API-002 | GET | `/api/products/:id` | Get a single product by ID | No | — | `200 OK` `{ id, nombre, precio, imagen, descripcion }` | `404` if not found |
| API-003 | GET | `/api/cart` | List all cart items for the authenticated user | Yes | — | `200 OK` `[{ id, nombre, precio, imagen, quantity }]` | `401` if unauthorized |
| API-004 | POST | `/api/cart/items` | Add or update a cart item (upsert) | Yes | `{ productId: number, quantity: number }` | `201 Created` `{ id, quantity }` | `400` if missing fields; `404` if product not found |
| API-005 | PUT | `/api/cart/items/:itemId` | Update cart item quantity | Yes | `{ quantity: number }` | `200 OK` `{ id, quantity }` | `404` if item not found or unauthorized; `400` if quantity < 1 |
| API-006 | DELETE | `/api/cart/items/:itemId` | Remove a cart item | Yes | — | `200 OK` `{ success: true }` | `404` if item not found or unauthorized |
| API-007 | GET | `/api/cart/total` | Calculate total cart value | Yes | — | `200 OK` `{ total: number }` | `401` if unauthorized |
| API-008 | POST | `/api/orders` | Create a new order from cart, clear cart (transaction) | Yes | `{ items: [{ productId, quantity, price }], paymentMethod, total }` | `201 Created` `{ orderId, status }` | `400` if cart empty; `401` if unauthorized |
| API-009 | GET | `/api/orders` | List all orders for the authenticated user | Yes | — | `200 OK` `[{ id, total, payment_method, status, fecha, items: [...] }]` | `401` if unauthorized |
| API-010 | GET | `/api/orders/:id` | Get a single order with its items | Yes | — | `200 OK` `{ id, total, payment_method, status, fecha, items: [...] }` | `401` if unauthorized; `404` if order not found |
| API-011 | GET | `/api/users/profile` | Get the current user's profile | Yes | — | `200 OK` `{ uid, username, email, clave_tipo }` | `401` if unauthorized; `404` if profile not found |
| API-012 | POST | `/api/users` | Create user profile after Firebase registration | Yes | `{ uid, username, email, claveTipo, claveRespuesta }` | `201 Created` `{ success: true }` | `400` if missing fields; `409` if uid already exists |
| API-013 | POST | `/api/users/2auth` | Validate security question answer (2FA) | Yes | `{ tipo, respuesta }` | `200 OK` `{ valid: true }` | `400` if missing params; `401` if invalid answer |

## 13.3 Authentication Flow

```
Frontend                                Backend                          Firebase
    │                                      │                                │
    │── 1. User submits credentials ──────►│                                │
    │                                      │── 2. signInWithEmailAndPassword() │
    │                                      │◄─── 3. Returns ID token ────────│
    │◄─── 4. Store token in memory ───────│                                │
    │                                      │                                │
    │── 5. API request + Bearer token ────►│                                │
    │                                      │── 6. verifyIdToken() ──────────►│
    │                                      │◄─── 7. Token valid, decoded ────│
    │                                      │── 8. Process request with uid ─►│
    │◄─── 9. JSON response ───────────────│                                │
```

---

# 14. Data Requirements

## 14.1 Data Entities

| Entity | Purpose | Storage Location |
| ------ | ------- | ---------------- |
| User Profile | Firebase UID, username, email, security question/answer | PostgreSQL `users` |
| Product | Product catalog (name, price, image, description) | PostgreSQL `products` |
| Cart Item | User's active shopping cart entries | PostgreSQL `cart_items` |
| Order | Purchase history headers | PostgreSQL `orders` |
| Order Item | Line items for each order (denormalized) | PostgreSQL `order_items` |
| Firebase User | Authentication credentials | Firebase Authentication (managed by Google) |

## 14.2 Data Dictionary

### Table: `users`

| Field | Type | Required | Meaning | Validation Rule |
| ----- | ---- | -------- | ------- | --------------- |
| uid | VARCHAR(128) | Yes | Firebase User ID (unique identifier) | PK, exists in Firebase Auth |
| username | VARCHAR(50) | Yes | Unique public display name | Unique, not null |
| email | VARCHAR(255) | Yes | User email address | Unique, not null |
| clave_tipo | INTEGER | Yes | Security question type: 1=Madre, 2=Mascota, 3=Color | Not null, CHECK (1,2,3) |
| clave_respuesta | VARCHAR(255) | Yes | Security question answer (lowercase) | Not null |
| created_at | TIMESTAMP | Yes | Account creation timestamp | Auto-set on insert |
| updated_at | TIMESTAMP | No | Last profile update | Auto-set on update |

### Table: `products`

| Field | Type | Required | Meaning | Validation Rule |
| ----- | ---- | -------- | ------- | --------------- |
| id | SERIAL | Yes | Auto-increment product ID | PK |
| nombre | VARCHAR(200) | Yes | Product name | Not null |
| precio | INTEGER | Yes | Price in Colombian Pesos | Not null, CHECK(>= 0) |
| imagen | VARCHAR(500) | Yes | Relative image path (e.g., "img/cojin1.jpg") | Not null |
| descripcion | TEXT | No | Product description | — |
| categoria | VARCHAR(100) | No | Product category (e.g., "Decoración", "Cosmética") | — |
| stock | INTEGER | No | Available stock quantity | CHECK(>= 0) |
| created_at | TIMESTAMP | Yes | Product creation timestamp | Auto-set on insert |

### Table: `cart_items`

| Field | Type | Required | Meaning | Validation Rule |
| ----- | ---- | -------- | ------- | --------------- |
| id | SERIAL | Yes | Cart item ID | PK |
| user_id | VARCHAR(128) | Yes | Firebase UID (FK → users.uid) | Not null, REFERENCES users(uid) ON DELETE CASCADE |
| product_id | INTEGER | Yes | Product ID (FK → products.id) | Not null, REFERENCES products(id) ON DELETE CASCADE |
| quantity | INTEGER | Yes | Quantity in cart | Not null, CHECK(>= 1), UNIQUE(user_id, product_id) |
| added_at | TIMESTAMP | Yes | When item was added | Auto-set on insert |

### Table: `orders`

| Field | Type | Required | Meaning | Validation Rule |
| ----- | ---- | -------- | ------- | --------------- |
| id | SERIAL | Yes | Order ID | PK |
| user_id | VARCHAR(128) | Yes | Firebase UID (FK → users.uid) | Not null, REFERENCES users(uid) |
| total | INTEGER | Yes | Order total in COP | Not null, CHECK(>= 0) |
| payment_method | VARCHAR(50) | Yes | Payment method used: "card", "PSE", or "Efecty" | Not null |
| status | VARCHAR(50) | Yes | Order status | Default: "pending" |
| fecha | DATE | Yes | Order date | Default: CURRENT_DATE |
| created_at | TIMESTAMP | Yes | Order creation timestamp | Auto-set on insert |

### Table: `order_items`

| Field | Type | Required | Meaning | Validation Rule |
| ----- | ---- | -------- | ------- | --------------- |
| id | SERIAL | Yes | Order item ID | PK |
| order_id | INTEGER | Yes | Order ID (FK → orders.id) | Not null, REFERENCES orders(id) ON DELETE CASCADE |
| product_id | INTEGER | Yes | Product ID (FK → products.id) | Not null |
| product_name | VARCHAR(200) | Yes | Product name snapshot at purchase | Not null (denormalized) |
| product_price | INTEGER | Yes | Product price snapshot at purchase | Not null (denormalized) |
| quantity | INTEGER | Yes | Quantity purchased | Not null, CHECK(>= 1) |

## 14.3 Data Storage Rules

| ID | Requirement |
| ---- | ----------- |
| DR-001 | All user profile data must reside in PostgreSQL `users` table, linked to Firebase UID |
| DR-002 | Product data must reside in PostgreSQL `products` table |
| DR-003 | Active cart items must reside in PostgreSQL `cart_items` table, one row per (user, product) pair |
| DR-004 | Completed orders must reside in PostgreSQL `orders` + `order_items` tables with denormalized prices |
| DR-005 | No business data shall be stored in Firestore after migration |
| DR-006 | Foreign key constraints must be enforced at the database level (CASCADE on delete) |
| DR-007 | Monetary values must be stored as INTEGER (COP smallest unit, no decimals) |
| DR-008 | SQL query files must use parameterized queries (`$1`, `$2`) exclusively — no string concatenation |

## 14.4 Data Integrity Rules

| ID | Rule |
| ---- | ---- |
| DI-001 | `cart_items.user_id` must reference a valid `users.uid` row |
| DI-002 | `cart_items.product_id` must reference a valid `products.id` row |
| DI-003 | `order_items.order_id` must reference a valid `orders.id` row |
| DI-004 | `order_items.product_id` must reference a valid `products.id` row |
| DI-005 | `orders.total` must equal the sum of `(order_items.product_price × order_items.quantity)` for all items in that order |
| DI-006 | `users.uid` must exist in Firebase Auth before a `users` row is created |
| DI-007 | Duplicate `(user_id, product_id)` pairs in `cart_items` trigger an upsert (quantity update, not insert error) |
| DI-008 | Cart must be cleared atomically within the order creation transaction |

---

# 15. Security Requirements

| ID | Requirement | Implementation |
| ---- | ----------- | ------------- |
| SEC-001 | All non-public API endpoints must reject unauthenticated requests. | `authMiddleware` verifies Firebase ID token; returns 401 on failure. |
| SEC-002 | Firebase ID tokens must be verified using Firebase Admin SDK. | `admin.auth().verifyIdToken(token)` is called in every protected route. |
| SEC-003 | All SQL queries must use parameterized statements (`$1`, `$2`). | Raw `db.query(sql, params)` with array parameters; **never** string interpolation. |
| SEC-004 | Database credentials and Firebase service account must never be hard-coded. | Stored in `.env` file, loaded by `dotenv`. `.env` is in `.gitignore`. |
| SEC-005 | The API must be accessible over HTTPS in production. | TLS termination handled by nginx reverse proxy on the server. |
| SEC-006 | Cross-Origin Resource Sharing (CORS) must restrict the API to known frontend origins. | `cors({ origin: process.env.FRONTEND_URL })` middleware applied globally. |
| SEC-007 | Users must never access another user's cart or orders. | Every SQL query includes `WHERE user_id = $1` with the verified UID. |
| SEC-008 | The Firebase service account JSON must be stored securely on the server. | Kept outside the web root; permissions restricted to the Node.js process user. |
| SEC-009 | Order total must be calculated server-side from the database, never from client-supplied values. | Backend re-calculates `SUM(precio × quantity)` before inserting the order. |
| SEC-010 | Rate limiting should be applied to authentication-related endpoints. | Recommended: `express-rate-limit` on `/api/users` routes. |

---

# 16. Compliance Requirements

Use only when checking legal, institutional, rubric, security, privacy, or technical compliance.

| ID | Compliance Rule | Required System Behavior | Evidence Needed |
| ---- | --------------- | ------------------------ | --------------- |
| COMP-001 | SQL Injection Prevention (OWASP Top 10 A03) | All queries are parameterized; no dynamic SQL built from user input. | Code review confirms `db.query(sql, [params])` usage throughout. |
| COMP-002 | Data Isolation (Multi-tenant security) | Users cannot access or modify another user's data (enforced at DB query level). | Integration tests confirming cross-user isolation. |
| COMP-003 | Firebase Token Validation | Every protected API request is authenticated server-side. | Unit tests showing 401 responses for missing/invalid tokens. |
| COMP-004 | Colombian Data Protection (Law 1581) | Users can request deletion of their personal data. | `DELETE /api/users/:uid` endpoint available (or planned). |
| COMP-005 | PCI DSS Scope Reduction | No real credit card numbers are stored or processed. | Payment simulation only; payment method stored as string ("card", "PSE", "Efecty"). |

---

# 17. Non-Functional Requirements

## 17.1 Performance

| ID | Requirement | Measurement |
| ---- | ----------- | ----------- |
| PERF-001 | API response time must be < 300ms for simple queries (`GET /api/products`, `GET /api/cart`). | Measured with Postman or `curl -w "%{time_total}"`; `EXPLAIN ANALYZE` for slow queries. |
| PERF-002 | Order creation transaction must complete in < 1 second. | Includes 3 SQL operations within a single transaction. |
| PERF-003 | Database queries must use indexes on foreign keys (`user_id`, `order_id`, `product_id`). | Verified with `EXPLAIN ANALYZE`; indexes defined in schema. |

## 17.2 Reliability

| ID | Requirement | Implementation |
| ---- | ----------- | ------------- |
| REL-001 | Database connection failures must be handled gracefully. | `pg` Pool auto-reconnects; API returns 503 with retry-able error message. |
| REL-002 | Order creation must be atomic. | PostgreSQL transaction (`BEGIN`/`COMMIT`/`ROLLBACK`). |
| REL-003 | Backend process must auto-restart on crash. | Managed by PM2 or systemd service unit. |
| REL-004 | Daily database backups must be performed. | Cron job with `pg_dump` or use hosting provider backup. |

## 17.3 Maintainability (Simplicity Principle)

| ID | Requirement | Verification |
| ---- | ----------- | ------------ |
| MNT-001 | Backend code must be organized in a fully layered controller/model/service structure. | Code review confirms separation: `controllers/`, `models/`, `services/`, `middleware/`, `routes/`. |
| MNT-002 | SQL queries must be stored as individual `.sql` files in `backend/sql/` organized by domain. | File system shows `backend/sql/products/*.sql`, `backend/sql/cart/*.sql`, etc. |
| MNT-003 | No ORM or query builder may be used. | `package.json` contains only `pg` as a DB dependency; no `sequelize`, `prisma`, `knex`, etc. |
| MNT-004 | Express route handlers must delegate to model files, not contain raw SQL. | Route files contain only auth check + parameter extraction + model method call. |
| MNT-005 | Model files must contain only SQL execution logic (thin wrappers over `db.query()`). | Each model method is a single `db.query(sql, params)` call. |
| MNT-006 | Frontend JavaScript must follow MVC: controllers handle events, models call API, services provide utilities. | JS files are in `js/controllers/`, `js/models/`, `js/services/`. |
| MNT-007 | HTML views must not contain inline JavaScript or business logic. | HTML files contain only markup; JS is in external `.js` modules. |
| MNT-008 | Dependency count must be minimal. | Only 5 npm dependencies: `express`, `pg`, `firebase-admin`, `cors`, `dotenv`. |
| MNT-009 | Controller layers inside the backend must follow responsibility separation. | Each domain (products, cart, orders, users, auth) has its own controller file. |
| MNT-010 | SQL queries must be organized in the `/database/` folder by domain. | File system shows `database/schema/`, `database/products/`, `database/cart/`, `database/orders/`, `database/users/`, `database/adminQueries/`. |

## 17.4 Availability

| ID | Requirement | Measurement |
| ---- | ----------- | ----------- |
| AVL-001 | Backend API must have 99.5% monthly uptime. | Monitored via uptime checker; PM2 auto-restarts. |
| AVL-002 | PostgreSQL must be accessible from backend server at all times. | Connection pool health check every 30 seconds. |

---

# 18. LLM-Specific Requirements

Use only if the software uses an LLM.

*Not applicable — this is a traditional web application, not an LLM-based system.*

---

# 19. Test Requirements

## 19.1 Test Case Format

| Field | Value |
| ----- | ----- |
| Test Case ID | TC-001 |
| Related Requirement | |
| Test Type | Functional / API / UI / Security / Regression / Compliance |
| Preconditions | |
| Test Data | |
| Steps | |
| Expected Result | |
| Pass / Fail Rule | |

## 19.2 Required Test Coverage

| Requirement ID | Required Test Type | Test Case ID |
| -------------- | ------------------ | ------------ |
| FR-001 | Functional | TC-AUTH-001 |
| FR-002 | Security | TC-SEC-001 |
| FR-003 | Functional | TC-DB-001 |
| FR-004 | API | TC-API-001 |
| FR-005 | API | TC-API-002 |
| FR-006 | API | TC-API-003 |
| FR-009 | Security | TC-SEC-002 |
| SEC-001 | Security | TC-SEC-003 |
| SEC-003 | Security | TC-SEC-004 |
| FR-014 | Security | TC-SEC-005 |

---

# 20. Traceability Matrix

| Requirement ID | Business Rule | API / UI / Data Element | Test Case | Status |
| -------------- | ------------- | ----------------------- | --------- | ------ |
| FR-001 | BR-001 | Frontend: `authController.login()`, `register()` | TC-AUTH-001 | |
| FR-002 | BR-008 | Backend: `authMiddleware` | TC-SEC-001 | |
| FR-003 | — | Backend: All route handlers query PostgreSQL | TC-DB-001 | |
| FR-004 | BR-003 | API: `GET /api/products`, DB: `products` table | TC-API-001 | |
| FR-005 | BR-004, BR-005 | API: Cart endpoints, DB: `cart_items` table | TC-API-002 | |
| FR-006 | BR-006, BR-007 | API: `POST /api/orders`, DB: `orders` + `order_items` | TC-API-003 | |
| FR-007 | — | API: `GET /api/orders`, DB: `orders` + `order_items` | TC-API-004 | |
| FR-008 | BR-002 | API: `POST /api/users`, DB: `users` table | TC-AUTH-002 | |
| FR-009 | BR-008 | Backend: `WHERE user_id = req.uid` in all queries | TC-SEC-002 | |
| FR-014 | BR-013 | Backend: `POST /api/users/2auth` validates clave | TC-SEC-005 | |
| SEC-001 | — | Backend: `authMiddleware` | TC-SEC-003 | |
| SEC-003 | — | Backend: All SQL uses parameterized queries | TC-SEC-004 | |

---

# 21. Acceptance Criteria

| ID | Acceptance Criterion |
| ---- | -------------------- |
| ACC-001 | Every mandatory functional requirement shall have at least one related test case. |
| ACC-002 | Every security requirement shall have verification evidence (unit test, code review, or penetration test). |
| ACC-003 | Every validation rule shall have positive and negative test coverage. |
| ACC-004 | Every API requirement shall define success and error behavior. |
| ACC-005 | Every SQL query file shall use parameterized placeholders (`$1`, `$2`) exclusively — no string concatenation. |
| ACC-006 | Every backend route handler shall verify the Firebase ID token before accessing database resources. |
| ACC-007 | The order creation endpoint (`POST /api/orders`) shall execute within a single database transaction (atomicity). |
| ACC-008 | The frontend MVC structure shall separate concerns: HTML views contain no business logic, JS controllers handle events, JS models call the API. |
| ACC-009 | The SQL repository shall contain exactly one `.sql` file per query, organized into subdirectories by domain. |
| ACC-010 | The SQL repository shall contain exactly one `.sql` file per query, organized into subdirectories by domain under `database/`. |

---

# 22. Excluded From LLM Review Context

These sections should not be sent to the LLM when the task is bug review, compliance review, test coverage, or implementation checking.

| Excluded Data              | Reason                                                    |
| -------------------------- | --------------------------------------------------------- |
| Document title             | Does not define system behavior                           |
| Document version           | Administrative metadata                                   |
| Revision history           | Administrative metadata                                   |
| Author                     | Ownership metadata                                        |
| Owner                      | Ownership metadata                                        |
| Reviewed by                | Approval metadata                                         |
| Approved by                | Approval metadata                                         |
| Signature table            | Approval metadata                                         |
| Project sponsor            | Administrative metadata                                   |
| Approval dates             | Administrative metadata                                   |
| Change authors             | Administrative metadata                                   |
| Document status            | Administrative metadata unless checking governance        |
| Full release checklist     | Not needed unless checking deployment readiness           |
| Hardware interface section | Exclude unless the software interacts with hardware       |
| Backup section             | Exclude unless stored data recovery is part of the review |
| Migration section          | Exclude unless reviewing database migration behavior      |

```

Rule:
Only include SRS data that defines behavior, terminology, validation, security, data handling, interface behavior, error handling, constraints, tests, compliance, or pass/fail criteria.
```