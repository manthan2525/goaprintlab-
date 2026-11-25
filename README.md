# GoaPrintLab — 3D Printing E-Commerce Web Application

Full-stack MERN (MongoDB, Express.js, React.js, Node.js) application implementing the **GoaPrintLab** project specification.

## Features

- **Customer Storefront**: Browse curated 3D-printed products, search & filter by category or filament material, customize material/colour/size/quantity, manage shopping cart, place orders, and track real-time order statuses.
- **Custom 3D Printing Requests**: Authenticated customers can upload `.stl`, `.obj`, or `.3mf` 3D model files with print specifications and notes.
- **Admin Dashboard**: Role-protected dashboard for product CRUD (with image uploads), reviewing/downloading custom 3D model files, updating order statuses, and viewing customers.
- **Zero-Config Database Fallback**: Connects to `MONGO_URI` (`mongodb://127.0.0.1:27017/goaprintlab`) if running locally, or automatically starts an embedded `MongoMemoryServer` with seeded sample data.

## Quick Start

```bash
npm run install:all
```

Start the backend API (`http://localhost:5000`):

```bash
npm run dev:server
```

Start the React frontend (`http://localhost:5173`) in a second terminal:

```bash
npm run dev:client
```

## Seeded Demo Accounts

- **Admin**: `admin@goaprintlab.in` / `Admin@123`
- **Customer**: `customer@goaprintlab.in` / `Customer@123`

## Publishing Online on Render (Single Web Service)

1. Create a free **MongoDB Atlas** cluster (`M0`), allow network access (`0.0.0.0/0`), and copy your `mongodb+srv://...` connection string.
2. Push this project (`C:\Users\Manthan\GoaPrintLab`) to a GitHub repository.
3. On [Render](https://render.com), click **New + -> Blueprint** (uses `render.yaml`) or **New + -> Web Service** connected to your GitHub repo:
   - **Build Command**: `npm run render-build`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     - `NODE_ENV` = `production`
     - `MONGO_URI` = your MongoDB Atlas `mongodb+srv://...` URI
     - `JWT_SECRET` = a strong random secret string
     - `UPLOAD_DIR` = `./uploads`
     - `CLIENT_URL` = your Render app URL (e.g., `https://goaprintlab.onrender.com`)
4. Deploy — Express serves both the `/api/*` endpoints and the compiled React SPA from `client/dist`.

