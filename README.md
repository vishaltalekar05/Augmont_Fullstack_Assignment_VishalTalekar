# Augmont Fullstack Assignment

A Full Stack Product Management Application developed using **Angular**, **Node.js**, **Express.js**, **MySQL**, and **Sequelize**.

---

# Features

## Authentication

- User Registration
- User Login
- JWT Authentication

## Category Management

- Add Category
- Update Category
- Delete Category
- View Categories

## Product Management

- Add Product
- Update Product
- Delete Product
- View Products
- Product Image Upload

## Bulk Upload

- Upload Products using CSV
- Background Processing
- Bulk Upload Status Tracking

## Reports

- Download Product Report in CSV
- Download Product Report in Excel (.xlsx)

## Other Features

- Pagination
- Search
- Sorting
- MySQL Database Integration

---

# Tech Stack

## Frontend

- Angular 22
- TypeScript
- HTML
- CSS

## Backend

- Node.js
- Express.js
- Sequelize ORM
- JWT
- Multer
- CSV Parser
- ExcelJS

## Database

- MySQL

---

# Folder Structure

```
Augmont_Fullstack_Assignment_VishalTalekar

│

├── backend

│   ├── config

│   ├── controllers

│   ├── middleware

│   ├── models

│   ├── routes

│   ├── uploads

│   ├── reports

│   ├── package.json

│   └── server.js

│

├── frontend

│   ├── src

│   ├── public

│   ├── angular.json

│   └── package.json

│

└── README.md
```

---

# Installation

## Backend

```bash
cd backend

npm install

npm start
```

Backend runs on:

```
http://localhost:5000
```

---

## Frontend

```bash
cd frontend

npm install

ng serve
```

Frontend runs on:

```
http://localhost:4200
```

---

# API Endpoints

## User

```
POST /api/users/register

POST /api/users/login
```

## Categories

```
GET /api/categories

POST /api/categories

PUT /api/categories/:id

DELETE /api/categories/:id
```

## Products

```
GET /api/products

POST /api/products

PUT /api/products/:id

DELETE /api/products/:id
```

## Bulk Upload

```
POST /api/products/bulk-upload

GET /api/products/bulk-upload/status/:jobId
```

## Reports

```
GET /api/products/report?format=csv

GET /api/products/report?format=xlsx
```

---

# Default Login

```
Email

admin@gmail.com

Password

admin123
```

---

# Assignment Features Completed

✅ Authentication

✅ JWT Login

✅ Category CRUD

✅ Product CRUD

✅ Image Upload

✅ Bulk CSV Upload

✅ Bulk Upload Status

✅ CSV Report Download

✅ Excel Report Download

✅ Pagination

✅ MySQL Integration

✅ Angular Frontend

✅ Express Backend

---

# Developed By 
vishal talekar.

**Vishal Talekar**

B.Sc. Information Technology
