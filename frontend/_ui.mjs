// The website customer flow in a real browser: enquire as a guest, sign
// up, find that enquiry already there, sign out and back in, see an order
// and ask for it again. Self-cleaning.
import { chromium } from "playwright";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "c:/Users/HP/Desktop/Needy/KN_AGRO/BACKEND/backend/.env" });

const BASE = process.env.BASE || "http://localhost:4199";
const SC = "C:/Users/HP/AppData/Local/Temp/claude/c--Users-HP-Desktop-Needy-KN-AGRO/2f65ec02-433a-446f-ab62-7ce3f9cd95d2/scratchpad";

const results = [];
const errs = [];
const check = (l, c, x = "") => {
  results.push({ l, pass: !!c });
  console.log(c ? "OK  " : "FAIL", l, x ? `-- ${x}` : "");
};

const stamp = Date.now().toString().slice(-8);
const PHONE = `8${stamp.slice(0, 9).padEnd(9, "0")}`;
const EMAIL = `uishopper-${stamp}@verify.local`;
const PASSWORD = "Shop@12345";
const NAME = "UI Shopper";
const DISTRICT = `UiDistrict${stamp}`;

// ---- An order already on file for this buyer, as if staff had raised it ----
await mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection.db;
const product = await db.collection("products").findOne({});
const adminUser = await db.collection("users").findOne({ email: "admin@example.com" });
const { insertedId: customerId } = await db.collection("customers").insertOne({
  customerCode: `UIV${stamp}`,
  name: NAME,
  email: EMAIL,
  phone: PHONE,
  createdBy: adminUser._id,
  createdAt: new Date(),
  updatedAt: new Date(),
});
const { insertedId: orderId } = await db.collection("orders").insertOne({
  orderNumber: `ORD-UI-${stamp}`,
  customer: customerId,
  lead: null,
  items: [
    {
      product: product._id,
      productCode: product.productCode || "P1",
      productName: product.name || "Product",
      unit: product.unit || "KG",
      quantity: 2,
      rate: 50000,
      discountAmount: 0,
      taxRate: 0,
      taxAmount: 0,
      lineSubtotal: 100000,
      lineTotal: 100000,
    },
  ],
  subtotal: 100000,
  discountTotal: 0,
  taxTotal: 0,
  shippingCharge: 0,
  otherCharges: 0,
  grandTotal: 100000,
  currency: "INR",
  orderStatus: "DELIVERED",
  paymentStatus: "PAID",
  orderDate: new Date(),
  createdBy: adminUser._id,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1400, height: 1000 } });
const page = await context.newPage();
page.on("pageerror", (e) => errs.push(e.message));

const fill = async (id, value) => page.fill(`#${id}`, value);

try {
  // ---------------- Guest enquiry ----------------
  await page.goto(`${BASE}/enquiry`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#enquiry-name", { timeout: 30000 });
  await page.waitForTimeout(1500);

  check("The enquiry form asks for a structured address",
    (await page.locator("#enquiry-district").count()) > 0 &&
      (await page.locator("#enquiry-state").count()) > 0 &&
      (await page.locator("#enquiry-pincode").count()) > 0);
  check("A guest is invited to sign in, not forced to",
    (await page.locator('text=/Sign in to track this enquiry/i').count()) > 0 &&
      (await page.locator("#enquiry-name").isEnabled()));

  await fill("enquiry-name", NAME);
  await fill("enquiry-phone", PHONE);
  await fill("enquiry-email", EMAIL);
  await fill("enquiry-location", "Near the old market");
  await fill("enquiry-district", DISTRICT);
  await fill("enquiry-state", "Uttar Pradesh");
  await fill("enquiry-pincode", "226001");
  await page.selectOption("#enquiry-product", { index: 1 });
  await page.screenshot({ path: `${SC}/shop_01_enquiry.png`, fullPage: true });
  await page.click('button[type="submit"]');
  await page.waitForSelector("text=/Thank you/i", { timeout: 30000 });
  check("A guest enquiry goes through without an account", true);

  // ---------------- Sign up ----------------
  await page.goto(`${BASE}/account/register`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#register-phone", { timeout: 30000 });
  await fill("register-name", NAME);
  await fill("register-phone", PHONE);
  await fill("register-email", EMAIL);
  await fill("register-password", PASSWORD);
  await fill("register-district", DISTRICT);
  await fill("register-state", "Uttar Pradesh");
  await fill("register-pincode", "226001");
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/account$/, { timeout: 30000 });
  check("Sign-up lands on My Account", /\/account$/.test(page.url()), page.url());

  // ---------------- The guest enquiry is already there ----------------
  await page.waitForSelector("text=/LEAD/", { timeout: 30000 });
  const enquiriesText = await page.locator("main").innerText();
  check("The enquiry made before signing up is already in the account",
    /LEAD\d+/.test(enquiriesText), enquiriesText.replace(/\s+/g, " ").slice(0, 120));

  // ---------------- Orders + re-order ----------------
  await page.click('button:has-text("My Orders")');
  await page.waitForSelector(`text=ORD-UI-${stamp}`, { timeout: 30000 });
  const ordersText = await page.locator("main").innerText();
  check("The order raised by staff against their phone is visible", ordersText.includes(`ORD-UI-${stamp}`));
  check("...with the amount in rupees", /₹1,000/.test(ordersText), ordersText.match(/₹[\d,]+/g)?.join(" ") || "");
  await page.screenshot({ path: `${SC}/shop_02_orders.png`, fullPage: true });

  await page.click('button:has-text("Order this again")');
  await page.waitForSelector("text=/Repeat request sent/i", { timeout: 30000 });
  check("Re-order sends a repeat request", true);
  await page.waitForTimeout(2500);
  const afterReorder = await page.locator("main").innerText();
  check("...and it appears as a new enquiry, not a new order",
    /Repeat order request based on order ORD-UI-/.test(afterReorder));
  await page.screenshot({ path: `${SC}/shop_03_reorder.png`, fullPage: true });

  // ---------------- Sign out, sign back in ----------------
  await page.click('button:has-text("Sign Out")');
  await page.waitForURL(`${BASE}/`, { timeout: 30000 });
  await page.goto(`${BASE}/account`, { waitUntil: "domcontentloaded" });
  await page.waitForURL(/\/account\/login$/, { timeout: 30000 });
  check("Signed out, My Account redirects to sign in", /\/account\/login$/.test(page.url()));

  await fill("account-identifier", PHONE);
  await fill("account-password", PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/account$/, { timeout: 30000 });
  check("Signing in with the phone number works", /\/account$/.test(page.url()));

  // ---------------- A reload keeps the session ----------------
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  check("The session survives a page reload", /\/account$/.test(page.url()), page.url());

  // ---------------- Signed in, the form knows them ----------------
  await page.goto(`${BASE}/enquiry`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#enquiry-name", { timeout: 30000 });
  await page.waitForTimeout(2000);
  check("The enquiry form is prefilled for a signed-in customer",
    (await page.inputValue("#enquiry-phone")) === PHONE &&
      (await page.inputValue("#enquiry-district")) === DISTRICT,
    `${await page.inputValue("#enquiry-phone")} / ${await page.inputValue("#enquiry-district")}`);
  check("...and the sign-in invitation is gone",
    (await page.locator('text=/Sign in to track this enquiry/i').count()) === 0);

  check("No uncaught page errors", errs.length === 0, errs.slice(0, 3).join(" | "));
} finally {
  await browser.close();

  const leadIds = (await db.collection("leads").find({ phone: PHONE }).toArray()).map((l) => l._id);
  const cleaned = await Promise.all([
    db.collection("orders").deleteOne({ _id: orderId }),
    db.collection("customers").deleteOne({ _id: customerId }),
    db.collection("leadactivities").deleteMany({ lead: { $in: leadIds } }),
    db.collection("leads").deleteMany({ _id: { $in: leadIds } }),
    db.collection("customeraccounts").deleteMany({ phone: PHONE }),
  ]);
  console.log(`\ncleaned up: ${cleaned.map((r) => r.deletedCount).join("/")} (order/customer/activities/leads/account)`);
  await mongoose.disconnect();
}

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) console.log("FAILED:\n" + failed.map((f) => " - " + f.l).join("\n"));
