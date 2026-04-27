/**
 * Migration — Backfill planName on existing payments
 *
 * Run AFTER plan-seed.ts so the plans collection is populated.
 *
 * Run from workspace root:
 *   npx ts-node --project apps/server/tsconfig.app.json apps/server/src/seeds/payment-planname-migration.ts
 */

import * as dotenv from "dotenv";
import * as path from "path";
import { MongoClient, ObjectId } from "mongodb";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const MONGODB_URI = process.env.MONGODB_URI!;
const DB_NAME = process.env.MONGO_DB_NAME!;

if (!MONGODB_URI || !DB_NAME) {
    console.error("Missing MONGODB_URI or MONGO_DB_NAME in .env");
    process.exit(1);
}

async function run() {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log(`Connected to: ${DB_NAME}`);

    const db = client.db(DB_NAME);
    const payments = db.collection("payments");
    const plans = db.collection("plans");

    // Load all plans (including soft-deleted ones) to match by amount
    const allPlans = await plans.find({}).toArray();

    // Build a lookup: amount -> planName
    // Each plan can match on usdPrice, inrPrice, or inrPrice+gst
    const amountToName = new Map<number, string>();
    for (const plan of allPlans) {
        const usd = plan.usdPrice;
        const inrBase = plan.inrPrice;
        const inrTotal = Math.round(plan.inrPrice * (1 + plan.gstPercent / 100));

        // Don't overwrite if a more specific match already exists
        if (!amountToName.has(usd)) amountToName.set(usd, plan.name);
        if (!amountToName.has(inrBase)) amountToName.set(inrBase, plan.name);
        if (!amountToName.has(inrTotal)) amountToName.set(inrTotal, plan.name);
    }

    console.log(`\nPlan amount map built (${amountToName.size} amount entries):`);
    amountToName.forEach((name, amount) => console.log(`  ${amount} → ${name}`));

    // Find all payments that don't have planName set yet
    const toMigrate = await payments
        .find({ $or: [{ planName: { $exists: false } }, { planName: null }] })
        .toArray();

    console.log(`\nPayments to migrate: ${toMigrate.length}`);

    let updated = 0;
    let unresolved = 0;

    for (const payment of toMigrate) {
        const resolvedName = amountToName.get(payment.totalAmount);

        if (resolvedName) {
            await payments.updateOne(
                { _id: payment._id as ObjectId },
                { $set: { planName: resolvedName, updatedAt: new Date() } }
            );
            updated++;
        } else {
            // Can't resolve — set a fallback so it never shows "Unknown Plan"
            const fallback = payment.threadsQuantity === 0 ? "Unlimited" : `${payment.threadsQuantity} Reports`;
            await payments.updateOne(
                { _id: payment._id as ObjectId },
                { $set: { planName: fallback, updatedAt: new Date() } }
            );
            console.warn(
                `  ⚠  Could not match amount ${payment.totalAmount} (${payment.currency}) — set to "${fallback}" [paymentId: ${payment.paymentId}]`
            );
            unresolved++;
        }
    }

    console.log(`\nDone — ${updated} updated, ${unresolved} used fallback.`);
    await client.close();
}

run().catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
});
