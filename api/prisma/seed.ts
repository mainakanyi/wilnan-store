import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.subscriptionPlan.createMany({
    data: [
      { name: 'Starter', price: 0, durationDays: 14 },
      { name: 'Standard', price: 3000, durationDays: 30 },
      { name: 'Pro', price: 7000, durationDays: 30 },
    ],
    skipDuplicates: true,
  });
}

main().finally(() => prisma.$disconnect());
