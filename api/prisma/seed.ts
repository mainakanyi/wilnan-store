import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding subscription plans...');

  await prisma.subscriptionPlan.updateMany({
    where: { name: 'Starter' },
    data: { maxUsers: 1, maxProducts: 50, allowReports: false },
  });

  await prisma.subscriptionPlan.updateMany({
    where: { name: 'Standard' },
    data: { maxUsers: 5, maxProducts: 500, allowReports: true },
  });

  await prisma.subscriptionPlan.updateMany({
    where: { name: 'Pro' },
    data: { maxUsers: 9999, maxProducts: 9999, allowReports: true },
  });

  console.log('✅ Subscription plans seeded');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
