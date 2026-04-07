const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

async function main() {
  const prisma = new PrismaClient();

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  try {
    const admin = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        name: 'Admin',
        password: adminPassword,
        role: 'admin',
      },
    });
    console.log('Created admin user:', admin.email);
  } catch (e) {
    console.log('Admin user may already exist:', e.message);
  }

  // Seed activities
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
        },
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
