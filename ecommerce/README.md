# ShopEasy — Simple MERN E-commerce (Next.js + Express + MongoDB)

## Setup
1. Backend:
```bash
cd backend
cp .env.example .env   # set MONGODB_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm install
npm run seed
npm run dev
```
2. Frontend:
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```
- Backend: http://localhost:5000, Frontend: http://localhost:3000
- Dev credentials: admin = `ADMIN_EMAIL` / `ADMIN_PASSWORD`, customers = ali/sara/usman@example.com / `Customer123!`

## Flow verified
Register → Login → Browse → Add to Cart → Checkout COD → My Orders → Admin status update. Typecheck + production builds pass.
