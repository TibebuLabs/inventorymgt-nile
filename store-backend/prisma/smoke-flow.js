/**
 * End-to-end workflow smoke test:
 * vendor → GRN → approve (stock in) → SRN → approve → SIV (stock out) → audit.
 * Run against a live backend: node prisma/smoke-flow.js
 */
const BASE = process.env.API_URL || 'http://localhost:3000';

const api = async (path, options = {}, token) => {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { status: res.status, ok: res.ok, data };
};

const log = (label, result) => {
  const status = result.ok ? 'OK  ' : 'FAIL';
  console.log(`${status} ${label} (${result.status})`);
  if (!result.ok) {
    console.log('   ->', JSON.stringify(result.data).slice(0, 700));
    throw new Error(`${label} failed`);
  }
  return result.data;
};

(async () => {
  const login = log(
    'login',
    await api('/auth/login', {
      method: 'POST',
      body: { email: 'admin@store.com', password: 'Admin@1234' },
    }),
  );
  const token = login.token;

  const items = log('GET /items', await api('/items', {}, token));
  const item = items[0];
  console.log(`   using item: ${item.name} (#${item.id}, unit ${item.unit_measurement_id})`);

  // ── 1. Vendor ────────────────────────────────────────────────────────
  const vendorName = `Smoke Vendor ${Date.now()}`;
  const vendor = log(
    'POST /vendors',
    await api('/vendors', {
      method: 'POST',
      body: {
        name: vendorName,
        contact_name: 'Test Contact',
        email: 'vendor@example.com',
        phone: '+251900000000',
      },
    }, token),
  );

  // ── 2. GRN (pending) ─────────────────────────────────────────────────
  const grn = log(
    'POST /grn',
    await api('/grn', {
      method: 'POST',
      body: {
        date: new Date().toISOString(),
        vendor_id: vendor.id,
        suppliers_inv_other_no: `INV-${Date.now()}`,
        store_location: 'Head Office Store',
        purchase_req_num: 1001,
        purchase_order_num: 2001,
        grn_items: [
          {
            description: item.id,
            unit_measurement_id: item.unit_measurement_id,
            qua_ordered: 50,
            qua_delivered: 50,
            quantity_received: 50,
            unit_price: 12.5,
            remark: 'Smoke test delivery',
          },
        ],
      },
    }, token),
  );
  console.log(`   grn #${grn.id} status=${grn.status}`);

  const before = await api('/stock', {}, token);
  const beforeQty =
    before.ok && Array.isArray(before.data)
      ? before.data.find((r) => r.itemId === item.id)?.quantity ?? 0
      : 0;

  // ── 3. Approve GRN → stock posted ────────────────────────────────────
  const approvedGrn = log(
    'PATCH /grn/:id/approve',
    await api(`/grn/${grn.id}/approve`, { method: 'PATCH', body: {} }, token),
  );
  console.log(`   grn status=${approvedGrn.status} posted_at=${approvedGrn.posted_at}`);

  // Idempotency: approving again must not double the stock.
  const again = await api(`/grn/${grn.id}/approve`, { method: 'PATCH', body: {} }, token);
  console.log(`   re-approve -> ${again.status} (idempotent guard)`);

  const afterGrn = log('GET /stock', await api('/stock', {}, token));
  const row = afterGrn.find((r) => r.itemId === item.id);
  console.log(`   stock after GRN: ${row?.quantity} @ ${row?.unitPrice} (value ${row?.totalValue})`);
  if (!row || row.quantity !== beforeQty + 50) {
    throw new Error(`Stock after GRN should be ${beforeQty + 50}, got ${row?.quantity}`);
  }

  // ── 4. SRN ───────────────────────────────────────────────────────────
  const srn = log(
    'POST /srn',
    await api('/srn', {
      method: 'POST',
      body: {
        requisition_work_unit: 'Finance Unit',
        date: new Date().toISOString(),
        srn_items: [
          {
            description: item.name,
            unit_measurement_id: item.unit_measurement_id,
            quantity: 20,
            remarks: 'Smoke test request',
          },
        ],
      },
    }, token),
  );
  console.log(`   srn #${srn.id} status=${srn.status}`);

  // Reject then re-create path is exercised separately; approve this one.
  log(
    'PATCH /srn/:id/approve',
    await api(`/srn/${srn.id}/approve`, { method: 'PATCH', body: {} }, token),
  );

  // ── 5. SIV issues stock ──────────────────────────────────────────────
  const siv = log(
    'POST /store-issue-voucher',
    await api('/store-issue-voucher', {
      method: 'POST',
      body: {
        issued_to: 'Finance Unit',
        store_req_no: srn.id,
        date: new Date().toISOString(),
        srn_id: srn.id,
        siv_items: [
          {
            description_id: item.id,
            unit_measurement_id: item.unit_measurement_id,
            requested: 20,
            issued: 20,
            out_of_stock: 0,
            remark: 'Smoke test issue',
          },
        ],
      },
    }, token),
  );
  console.log(`   siv #${siv.id} total=${siv.total?.total_price}`);

  const srnAfter = log('GET /srn/:id', await api(`/srn/${srn.id}`, {}, token));
  console.log(`   srn status after issue: ${srnAfter.status}`);
  if (srnAfter.status !== 'fulfilled') throw new Error('SRN was not marked fulfilled');

  const afterSiv = log('GET /stock', await api('/stock', {}, token));
  const rowAfter = afterSiv.find((r) => r.itemId === item.id);
  console.log(`   stock after SIV: ${rowAfter?.quantity}`);
  if (rowAfter?.quantity !== beforeQty + 30) {
    throw new Error(
      `Stock after SIV should be ${beforeQty + 30}, got ${rowAfter?.quantity}`,
    );
  }

  // ── 6. Over-issue must be rejected ───────────────────────────────────
  const srn2 = log(
    'POST /srn (over-issue test)',
    await api('/srn', {
      method: 'POST',
      body: {
        requisition_work_unit: 'ICT Unit',
        date: new Date().toISOString(),
        srn_items: [
          {
            description: item.name,
            unit_measurement_id: item.unit_measurement_id,
            quantity: 5,
          },
        ],
      },
    }, token),
  );
  await api(`/srn/${srn2.id}/approve`, { method: 'PATCH', body: {} }, token);
  const overIssue = await api('/store-issue-voucher', {
    method: 'POST',
    body: {
      issued_to: 'ICT Unit',
      store_req_no: srn2.id,
      date: new Date().toISOString(),
      srn_id: srn2.id,
      siv_items: [
        {
          description_id: item.id,
          unit_measurement_id: item.unit_measurement_id,
          requested: 5,
          issued: 999999,
          out_of_stock: 0,
        },
      ],
    },
  }, token);
  console.log(`   over-issue blocked: ${overIssue.status} -> ${JSON.stringify(overIssue.data?.message).slice(0, 120)}`);
  if (overIssue.ok) throw new Error('Over-issue was not blocked!');

  // ── 7. Movements + audit + dashboard ────────────────────────────────
  const movements = log('GET /stock/movements', await api('/stock/movements?limit=10', {}, token));
  console.log(`   movements: ${movements.length} (latest: ${movements[0]?.direction} ${movements[0]?.quantity} ${movements[0]?.item})`);

  const audit = log('GET /audit-logs', await api('/audit-logs?pageSize=12', {}, token));
  console.log(`   audit entries: ${audit.total}`);
  console.log(`   latest actions: ${audit.data.slice(0, 8).map((a) => a.action).join(', ')}`);

  const dash = log('GET /dashboard/summary', await api('/dashboard/summary', {}, token));
  console.log(`   dashboard stock: ${JSON.stringify(dash.stock)}`);

  const notifs = log('GET /notifications', await api('/notifications', {}, token));
  console.log(`   notifications: ${notifs.length}`);

  console.log('\nALL FLOW CHECKS PASSED');
})().catch((error) => {
  console.error('\nSMOKE TEST FAILED:', error.message);
  process.exit(1);
});
