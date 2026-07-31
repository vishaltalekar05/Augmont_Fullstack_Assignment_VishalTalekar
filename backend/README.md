# Augmont Fullstack Developer Assessment — Backend

Node.js + Express + Sequelize (MySQL/PostgreSQL) backend implementing User, Category, and
Product CRUD, bulk upload, and report generation.

## Tech Stack
- **Node.js + Express** — REST API server
- **Sequelize ORM** — works with MySQL by default (switch `dialect` in `config/db.js` to `postgres` for PostgreSQL, and update `DB_PORT` to 5432)
- **bcryptjs** — password encryption
- **multer** — file uploads (product images + bulk CSV)
- **csv-parser** — streaming CSV parsing for bulk upload
- **exceljs** — streaming XLSX report generation
- **jsonwebtoken** — login token issuance

## Setup
```bash
npm install
# create a MySQL database matching DB_NAME in .env, e.g.:
# mysql -u root -p -e "CREATE DATABASE augmont_assignment;"
npm start
```
Server runs on `http://localhost:5000`. Tables are auto-created/updated via `sequelize.sync({ alter: true })`.

## Design Decisions & Logic (for the tech interview walkthrough)

### 1. Data model
- `User`: email + bcrypt-hashed password. Passwords are never stored or returned in plain text.
- `Category`: `name` + an auto-generated `uniqueId` (UUID v4), separate from the internal
  auto-increment `id` used for foreign keys. This keeps external-facing IDs opaque while keeping
  joins fast internally.
- `Product`: belongs to exactly one `Category` (`categoryId` foreign key, `onDelete: CASCADE`),
  has its own `uniqueId`, and an `image` field storing the uploaded file's relative path.
- Indexes are added on `Product.price`, `Product.name`, and `Product.categoryId` since those are
  exactly the columns used for sorting, searching, and filtering — this keeps the list API fast
  even as the product table grows.

### 2. Product List API (pagination, sorting, search)
`GET /api/products?page=&limit=&sortBy=price&order=asc|desc&search=&category=`
- Pagination is done at the SQL level (`LIMIT`/`OFFSET` via Sequelize), never by fetching all rows
  and slicing in memory — that would not scale.
- `limit` is capped at 100 to prevent accidentally huge/slow responses.
- Search uses a `LIKE` match on product name; category filter uses a `LIKE` match on the joined
  Category's name.
- `findAndCountAll` with `distinct: true` is used so the pagination `total` count is correct even
  though a join (`include`) is involved.

### 3. Bulk Upload — avoiding 504 Gateway Timeout
A naive implementation (read whole file → loop → insert one row at a time → then respond) is
exactly what causes 504s on large files, because the client/load-balancer times out waiting for
the HTTP response.

Instead:
1. The endpoint responds **immediately** (`202 Accepted`) with a `jobId`, before processing starts.
2. The CSV is parsed via a **stream** (`csv-parser`), so the whole file is never loaded into memory.
3. Rows are inserted in **batches of 500** using `bulkCreate` instead of one insert per row —
   drastically fewer DB round-trips.
4. Category lookups are cached in memory per request so the same category isn't queried repeatedly.
5. The client polls `GET /api/products/bulk-upload/status/:jobId` to check progress/completion.

In a production system this job state would live in Redis/DB (not an in-memory object) and the
actual processing would run in a background worker/queue (e.g. BullMQ) — noted as a next step.

### 4. Report Generation — avoiding 504 Gateway Timeout
`GET /api/products/report?format=csv|xlsx`
- Data is read from the DB in **batches of 1000** (`limit`/`offset` loop), not one giant `SELECT *`.
- The response is **streamed** as rows are generated:
  - CSV: `res.write()` per batch, so bytes start flowing to the client immediately.
  - XLSX: `ExcelJS.stream.xlsx.WorkbookWriter` streams rows directly into the HTTP response instead
    of building the whole workbook in memory first.
- This means the connection stays "alive" (bytes are flowing) throughout, and memory usage stays
  flat regardless of how many products exist.

### 5. Security
- Passwords hashed with bcrypt (salt rounds: 10) — never stored/returned in plain text.
- Login issues a JWT (1-day expiry) for authenticated requests.
- File upload validation: image mimetype/extension check + 5MB limit on product images, 25MB
  limit on bulk CSV files, to prevent abuse.

## API Summary
| Method | Endpoint | Purpose |
|---|---|---|
| POST | /api/users | Create user (signup) |
| POST | /api/users/login | Login, returns JWT |
| PUT | /api/users/:id | Update user |
| GET | /api/users | List users |
| POST/GET/PUT/DELETE | /api/categories(/:id) | Category CRUD |
| POST/GET/PUT/DELETE | /api/products(/:id) | Product CRUD |
| GET | /api/products | List with pagination, sort, search, category filter |
| POST | /api/products/bulk-upload | Bulk upload CSV (async, returns jobId) |
| GET | /api/products/bulk-upload/status/:jobId | Check bulk upload progress |
| GET | /api/products/report?format=csv\|xlsx | Download product report |

## Testing
All endpoints were verified locally (via curl) against an in-memory SQLite instance:
user signup/login, category CRUD, product CRUD, pagination/sorting/search/filtering, bulk CSV
upload (job created → processed → status completed), and both CSV and XLSX report downloads
(XLSX confirmed as a valid `Microsoft Excel 2007+` file). Swap back to MySQL/PostgreSQL via
`config/db.js` + `.env` for the real submission environment.

Postman collection: `Augmont_Assignment.postman_collection.json` (includes all endpoints above,
with a `baseUrl` variable defaulting to `http://localhost:5000/api`).
