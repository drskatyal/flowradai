/**
 * Standalone plan seed — no Mongoose, no app imports.
 * Uses only the mongodb driver + dotenv (both already in package.json).
 *
 * Run from the workspace root:
 *   npx ts-node --project apps/server/tsconfig.app.json apps/server/src/seeds/plan-seed.ts
 *
 * Or compile and run:
 *   npx tsc --project apps/server/tsconfig.app.json && node dist/out-tsc/apps/server/src/seeds/plan-seed.js
 */

import * as dotenv from "dotenv";
import * as path from "path";
import { MongoClient } from "mongodb";

// Load server .env
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const MONGODB_URI = process.env.MONGODB_URI!;
const DB_NAME = process.env.MONGO_DB_NAME!;

if (!MONGODB_URI || !DB_NAME) {
    console.error("Missing MONGODB_URI or MONGO_DB_NAME in .env");
    process.exit(1);
}

const plans = [
    {
        name: "Basic Tier",
        slug: "basic-tier",
        subscriptionType: "regular",
        threadsQuantity: 50,
        usdPrice: 10,
        inrPrice: 800,
        gstPercent: 18,
        features: [
            "Ideal for getting started with AI-generated reporting.",
            "Perfect for first-time or low-volume users who want to experience our full reporting engine.",
            "One-time purchase — no subscription or lock-in.",
        ],
        highlighted: false,
        isActive: true,
        isDeleted: false,
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        name: "Standard Tier",
        slug: "standard-tier",
        subscriptionType: "regular",
        threadsQuantity: 200,
        usdPrice: 35,
        inrPrice: 2800,
        gstPercent: 18,
        features: [
            "Designed for individual radiologists with a consistent workflow.",
            "Seamless, no-friction top-up model that keeps you reporting without interruption.",
            "Brings your effective cost down as your volume grows.",
        ],
        highlighted: false,
        isActive: true,
        isDeleted: false,
        sortOrder: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        name: "Unlimited Tier",
        slug: "unlimited-tier",
        subscriptionType: "monthly",
        threadsQuantity: 0,
        usdPrice: 59,
        inrPrice: 4500,
        gstPercent: 18,
        features: [
            "For high-volume and professional radiologists who rely on FlowRad AI daily.",
            "Enjoy unrestricted reporting, priority compute allocation, and enhanced workflow optimization.",
            "No limits, no tokens — just continuous, seamless reporting.",
            "Best value for consistent daily users.",
        ],
        highlighted: true,
        isActive: true,
        isDeleted: false,
        sortOrder: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        name: "Yearly Unlimited Tier",
        slug: "yearly-unlimited-tier",
        subscriptionType: "yearly",
        threadsQuantity: 0,
        usdPrice: 600,
        inrPrice: 49000,
        gstPercent: 18,
        features: [
            "Ideal for radiologists with steady annual reporting needs",
            "Access to full AI reporting engine",
            "Priority support & smoother long-term usage",
            "Best value for consistent daily users.",
        ],
        highlighted: false,
        isActive: true,
        isDeleted: false,
        sortOrder: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

async function seed() {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log(`Connected to: ${DB_NAME}`);

    const db = client.db(DB_NAME);
    const col = db.collection("plans");

    let created = 0;
    let skipped = 0;

    for (const plan of plans) {
        const exists = await col.findOne({ slug: plan.slug });
        if (exists) {
            console.log(`  ⏭  Skipped (already exists): ${plan.name}`);
            skipped++;
        } else {
            await col.insertOne(plan);
            console.log(`  ✅ Created: ${plan.name}`);
            created++;
        }
    }

    console.log(`\nDone — ${created} created, ${skipped} skipped.`);
    await client.close();
}

seed().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
});
