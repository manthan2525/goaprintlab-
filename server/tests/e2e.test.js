const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

process.env.PORT = '5055';
process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/goaprintlab_test';

const { startServer } = require('../server');
const { disconnectDB } = require('../config/db');
const { getUploadBaseDir } = require('../middleware/uploadMiddleware');

let server;
let baseUrl;
const createdModelFiles = [];

test.before(async () => {
  server = await startServer();
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

test.after(async () => {
  for (const fileUrl of createdModelFiles) {
    const rel = fileUrl.replace(/^\/uploads\//, '');
    const fullPath = path.join(getUploadBaseDir(), rel);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await disconnectDB();
});

test('TC01-TC10: Complete GoaPrintLab Customer & Admin End-to-End Flow', async () => {
  // Health check
  const healthRes = await fetch(`${baseUrl}/api/health`);
  assert.equal(healthRes.status, 200);
  const health = await healthRes.json();
  assert.equal(health.status, 'ok');

  // TC01: User Registration
  const uniqueEmail = `student_${Date.now()}@goaprintlab.in`;
  const regRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Neha Kamat',
      email: uniqueEmail,
      password: 'Password@123',
      phone: '9822011223',
      address: { street: 'MG Road', city: 'Panaji', state: 'Goa', pincode: '403001' },
    }),
  });
  assert.equal(regRes.status, 201);
  const regData = await regRes.json();
  assert.equal(regData.user.role, 'customer');
  assert.ok(regData.token);

  // TC02: User Login
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: uniqueEmail, password: 'Password@123' }),
  });
  assert.equal(loginRes.status, 200);
  const { token: customerToken } = await loginRes.json();
  assert.ok(customerToken);

  const customerHeaders = {
    Authorization: `Bearer ${customerToken}`,
    'Content-Type': 'application/json',
  };

  // TC03: Profile Management
  const profUpdateRes = await fetch(`${baseUrl}/api/users/profile`, {
    method: 'PUT',
    headers: customerHeaders,
    body: JSON.stringify({
      phone: '9822999888',
      address: { street: '18 Altinho', city: 'Panaji', state: 'Goa', pincode: '403001' },
    }),
  });
  assert.equal(profUpdateRes.status, 200);
  const profUpdated = await profUpdateRes.json();
  assert.equal(profUpdated.user.phone, '9822999888');
  assert.equal(profUpdated.user.address.street, '18 Altinho');

  // TC04: Catalogue Search & Filter
  const searchRes = await fetch(
    `${baseUrl}/api/products?search=Planetary&category=Prototypes`
  );
  assert.equal(searchRes.status, 200);
  const products = await searchRes.json();
  assert.ok(products.length >= 1);
  const targetProduct = products[0];

  // TC05: Customization & Shopping Cart
  const addCartRes = await fetch(`${baseUrl}/api/cart`, {
    method: 'POST',
    headers: customerHeaders,
    body: JSON.stringify({
      productId: targetProduct._id,
      material: 'PETG',
      color: 'Ocean Blue',
      size: 'Medium',
      quantity: 2,
    }),
  });
  assert.equal(addCartRes.status, 200);
  const cartData = await addCartRes.json();
  assert.equal(cartData.items.length, 1);
  assert.equal(cartData.items[0].quantity, 2);

  // TC06: Order Placement
  const orderRes = await fetch(`${baseUrl}/api/orders`, {
    method: 'POST',
    headers: customerHeaders,
    body: JSON.stringify({
      shippingAddress: {
        fullName: 'Neha Kamat',
        phone: '9822999888',
        street: '18 Altinho',
        city: 'Panaji',
        state: 'Goa',
        pincode: '403001',
      },
    }),
  });
  assert.equal(orderRes.status, 201);
  const createdOrder = await orderRes.json();
  assert.equal(createdOrder.orderStatus, 'Pending');
  assert.ok(createdOrder.totalAmount > 0);

  // Confirm cart was cleared after order placement
  const emptyCartRes = await fetch(`${baseUrl}/api/cart`, {
    headers: { Authorization: `Bearer ${customerToken}` },
  });
  const emptyCart = await emptyCartRes.json();
  assert.equal(emptyCart.items.length, 0);

  // TC07: Custom 3D File Upload (.stl)
  const stlPayload = new Blob(['solid cube\nendsolid cube\n'], {
    type: 'application/octet-stream',
  });
  const formData = new FormData();
  formData.append('modelFile', stlPayload, 'robot_bracket.stl');
  formData.append('material', 'PETG');
  formData.append('color', 'Matte Black');
  formData.append('size', '100% Scale');
  formData.append('quantity', '3');
  formData.append('notes', '25% infill, 0.2mm layer height');

  const customRes = await fetch(`${baseUrl}/api/custom-requests`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${customerToken}` },
    body: formData,
  });
  assert.equal(customRes.status, 201);
  const createdCustom = await customRes.json();
  assert.equal(createdCustom.modelFileName, 'robot_bracket.stl');
  assert.equal(createdCustom.status, 'Pending Review');
  createdModelFiles.push(createdCustom.modelFileUrl);

  // Verify uploaded STL file is served statically
  const stlDownloadRes = await fetch(`${baseUrl}${createdCustom.modelFileUrl}`);
  assert.equal(stlDownloadRes.status, 200);

  // Verify customer cannot access Admin routes
  const forbiddenRes = await fetch(`${baseUrl}/api/admin/orders`, {
    headers: { Authorization: `Bearer ${customerToken}` },
  });
  assert.equal(forbiddenRes.status, 403);

  // Admin Login
  const adminLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@goaprintlab.in',
      password: 'Admin@123',
    }),
  });
  assert.equal(adminLoginRes.status, 200);
  const { token: adminToken } = await adminLoginRes.json();
  const adminHeaders = {
    Authorization: `Bearer ${adminToken}`,
    'Content-Type': 'application/json',
  };

  // TC09: Admin Product CRUD
  const createProdRes = await fetch(`${baseUrl}/api/products`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      title: 'Drone Camera Gimbal Mount',
      category: 'Prototypes',
      description: 'Lightweight shock-absorbing 3D printed camera mount.',
      basePrice: 499,
      materials: ['PETG', 'TPU'],
      colors: ['Matte Black'],
      sizes: ['Small', 'Medium'],
    }),
  });
  assert.equal(createProdRes.status, 201);
  const createdProd = await createProdRes.json();

  const updateProdRes = await fetch(`${baseUrl}/api/products/${createdProd._id}`, {
    method: 'PUT',
    headers: adminHeaders,
    body: JSON.stringify({ basePrice: 529 }),
  });
  assert.equal(updateProdRes.status, 200);
  const updatedProd = await updateProdRes.json();
  assert.equal(updatedProd.basePrice, 529);

  const deleteProdRes = await fetch(`${baseUrl}/api/products/${createdProd._id}`, {
    method: 'DELETE',
    headers: adminHeaders,
  });
  assert.equal(deleteProdRes.status, 200);

  // TC10: Admin Order & Custom Request Status Control
  const ordStatusRes = await fetch(
    `${baseUrl}/api/admin/orders/${createdOrder._id}`,
    {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({ orderStatus: 'Printing' }),
    }
  );
  assert.equal(ordStatusRes.status, 200);

  const customStatusRes = await fetch(
    `${baseUrl}/api/admin/custom-requests/${createdCustom._id}`,
    {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({ status: 'Approved' }),
    }
  );
  assert.equal(customStatusRes.status, 200);

  // TC08: Customer sees updated statuses
  const myOrdersRes = await fetch(`${baseUrl}/api/orders`, {
    headers: { Authorization: `Bearer ${customerToken}` },
  });
  const myOrders = await myOrdersRes.json();
  const matchedOrder = myOrders.find((o) => o._id === createdOrder._id);
  assert.equal(matchedOrder.orderStatus, 'Printing');

  const myCustomRes = await fetch(`${baseUrl}/api/custom-requests`, {
    headers: { Authorization: `Bearer ${customerToken}` },
  });
  const myCustomList = await myCustomRes.json();
  const matchedCustom = myCustomList.find((r) => r._id === createdCustom._id);
  assert.equal(matchedCustom.status, 'Approved');

  // Production SPA fallback & 404 API guard
  const missingApiRes = await fetch(`${baseUrl}/api/does-not-exist`);
  assert.equal(missingApiRes.status, 404);

  const clientDistIndex = path.resolve(__dirname, '../../client/dist/index.html');
  if (fs.existsSync(clientDistIndex)) {
    const spaRes = await fetch(`${baseUrl}/catalogue`);
    assert.equal(spaRes.status, 200);
    const spaHtml = await spaRes.text();
    assert.match(spaHtml, /GoaPrintLab/);
  }
});
