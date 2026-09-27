const bcrypt = require('bcryptjs');
const prisma = require('./prismaClient');

/**
 * Section 18: Initial Admin Account.
 * On startup, checks whether a SUPER_ADMIN exists; if not, creates one
 * from environment variables. Credentials are never hard-coded in source.
 */
async function ensureSuperAdmin() {
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;
  const mobile = process.env.SUPER_ADMIN_MOBILE || '9000000000';

  if (!email || !password) {
    console.warn('SUPER_ADMIN_EMAIL/PASSWORD not set — skipping Super Admin bootstrap.');
    return;
  }

  const existing = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
  if (existing) return;

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      fullName: 'Super Admin',
      email: email.toLowerCase(),
      mobileNumber: mobile,
      dateOfBirth: new Date('1990-01-01'),
      passwordHash,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });

  console.log(`Super Admin account created for ${email}`);
}

module.exports = { ensureSuperAdmin };
