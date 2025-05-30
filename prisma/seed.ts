import { PrismaClient, RoleType } from '@prisma/client';
import { seedProvinces } from './seed-provinces';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding roles...');

  // Check all existing roles at once
  const existingRoles = await prisma.role.findMany({
    select: { role_name: true }
  });
  
  const existingRoleNames = new Set(existingRoles.map(role => role.role_name));
  
  // Define roles to create
  const rolesToCreate = Object.values(RoleType).filter(
    role => !existingRoleNames.has(role)
  );

  if (rolesToCreate.length === 0) {
    console.log('All roles already exist, skipping creation.');
    return;
  }

  console.log(`Creating ${rolesToCreate.length} roles: ${rolesToCreate.join(', ')}`);

  // Create all missing roles in one transaction
  const createdRoles = await prisma.$transaction(
    rolesToCreate.map(role =>
      prisma.role.create({
        data: { role_name: role }
      })
    )
  );

  console.log('Created roles:', createdRoles);
  console.log('Seeding completed successfully');

  seedProvinces()
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('All roles seeded successfully');
  })
  .catch(async (e) => {
    console.error('Error during seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });