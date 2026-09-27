require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const slugify = require('slugify');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const CATEGORIES = [
  'Women',
  'Girls',
  'Child Girls',
  'Dresses',
  'Kurtis',
  'Tops',
  'Frocks',
  'Traditional Wear',
  'Party Wear',
  'Casual Wear',
  'Western Wear',
  'Sarees',
  'Skirts',
  'Ethnic Wear',
];

async function main() {
  console.log('Seeding categories...');
  for (const name of CATEGORIES) {
    const slug = slugify(name, { lower: true, strict: true });
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name, slug, isActive: true },
    });
  }

  console.log('Ensuring Super Admin exists...');
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;
  const mobile = process.env.SUPER_ADMIN_MOBILE || '9000000000';

  if (email && password) {
    const existing = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
    if (!existing) {
      const passwordHash = await bcrypt.hash(password, 12);
      await prisma.user.create({
        data: {
          fullName: 'Super Admin',
          email: email.toLowerCase(),
          mobileNumber: mobile,
          dateOfBirth: new Date('1990-01-01'),
          passwordHash,
          role: 'SUPER_ADMIN',
        },
      });
      console.log(`Super Admin created for ${email}`);
    } else {
      console.log('Super Admin already exists — skipping.');
    }
  } else {
    console.warn('SUPER_ADMIN_EMAIL/PASSWORD not set in .env — skipping Super Admin seed.');
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
