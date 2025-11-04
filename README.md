# ExpenseWise

Track income & expenses with summaries and (optional) charts. Current UI focuses on transaction table and top totals summary.

## Stack
- Backend: Node.js, Express, MongoDB (Mongoose), JWT, password hashing, dotenv, CORS
- Frontend: React (Vite), Axios, React Router, Tailwind CSS
- Testing: Jest + Supertest, mongodb-memory-server

## Features
- Auth (register/login)
- CRUD transactions (income & expense) with predefined categories
- Pagination, sorting, filtering, keyword search
- Category & monthly summary endpoints
- Totals summary (income, expense, net) at top of dashboard
- Currency formatting (HUF) with adaptive decimals & negative styling
- Optional in-memory DB fallback (disabled by default)
- Combined Analytics Chart: switchable views (Category, Month, Month+Category) with stacked income/expense bars, net line, sorting & limiting controls.

Removed for now (can be re-enabled later): charts & external dashboard layout.

## Getting Started


### Prerequisites
- Node.js 18+
- MongoDB


### Run Dev
Open three terminals (or use background tasks):

1. MongoDB:
	mongod --dbpath C:\data\mongodb

2. Backend:
	cd backend
	npm run dev

3. Frontend:
	cd client
	npm run dev

Visit: http://localhost:5173


## Scripts
- `server`: `npm run dev` (nodemon), `npm start`, `npm test`
- `client`: `npm run dev`, `npm run build`, `npm run preview`
