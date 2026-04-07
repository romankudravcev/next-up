import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

import fs from 'fs';
import path from 'path';
import { PrismaClient } from "@prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const raw = fs.readFileSync(path.join(process.cwd(), 'data', 'activities.json'), 'utf-8');
  const arr = JSON.parse(raw);
  for (const a of arr) {
    try {
      await prisma.activity.upsert({
        where: { id: a.id },
        update: {
          name: a.name,
          location: a.location,
          weather: a.weather,
          duration: a.duration,
          type: a.type || [],
          hidden: Boolean(a.hidden || false),
        },
        create: {
          id: a.id,
          name: a.name,
          location: a.location,
          weather: a.weather,
          duration: a.duration,
          type: a.type || [],
          hidden: Boolean(a.hidden || false),
        }
      });
    } catch (e) {
      console.error('failed item', a.id, e.message);
    }
  }
  console.log('Seeded activities');
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
