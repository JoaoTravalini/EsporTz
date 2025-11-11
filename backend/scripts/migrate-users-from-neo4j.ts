import "reflect-metadata";
import { AppDataSource } from "../src/database/postgres/data-source.js";
import { driver } from "../src/database/neo4j/data-source.js";
import { createUser } from "../src/services/create-user.js";

async function migrateUsersFromNeo4j() {
  try {
    await AppDataSource.initialize();
    console.log("✅ Connected to PostgreSQL");

    await driver.getServerInfo();
    console.log("✅ Connected to Neo4j");

    // Buscar todos os usuários do Neo4j
    const result = await driver.executeQuery(
      `MATCH (u:User)
       RETURN u.id as id, u.name as name, u.email as email, u.password as password, u.imgURL as imgURL
       ORDER BY u.name`
    );

    const neo4jUsers = result.records.map(record => ({
      id: record.get('id'),
      name: record.get('name'),
      email: record.get('email'),
      password: record.get('password'),
      imgURL: record.get('imgURL')
    }));

    console.log(`\n📊 Found ${neo4jUsers.length} users in Neo4j\n`);

    if (neo4jUsers.length === 0) {
      console.log("⚠️  No users found in Neo4j to migrate");
      await AppDataSource.destroy();
      return;
    }

    let migrated = 0;
    let skipped = 0;

    for (const neo4jUser of neo4jUsers) {
      console.log(`Processing: ${neo4jUser.name} (${neo4jUser.email})`);
      console.log(`  Neo4j ID: ${neo4jUser.id} (type: ${typeof neo4jUser.id})`);

      if (!neo4jUser.email || !neo4jUser.name) {
        console.log(`  ⏭️  Skipping - missing email or name\n`);
        skipped++;
        continue;
      }

      try {
        // Criar usuário no PostgreSQL
        // Nota: Se não tiver senha no Neo4j, usamos uma senha padrão
        const defaultPassword = neo4jUser.password || 'changeme123';
        
        const newUser = await createUser({
          email: neo4jUser.email,
          password: defaultPassword,
          name: neo4jUser.name,
          imgURL: neo4jUser.imgURL || null
        });

        if (newUser) {
          console.log(`  ✅ Migrated to PostgreSQL with ID: ${newUser.id}`);
          console.log(`  🔄 Updating Neo4j to use new UUID: ${newUser.id}\n`);

          // Atualizar o ID no Neo4j para o novo UUID do PostgreSQL
          await driver.executeQuery(
            `MATCH (u:User {email: $email})
             SET u.id = $newId
             RETURN u.id as updatedId`,
            { email: neo4jUser.email, newId: newUser.id }
          );

          migrated++;
        } else {
          console.log(`  ❌ Failed to create user in PostgreSQL\n`);
          skipped++;
        }
      } catch (error: any) {
        if (error.message?.includes('Email already in use')) {
          console.log(`  ⏭️  Already exists in PostgreSQL\n`);
          skipped++;
        } else {
          console.error(`  ❌ Error:`, error.message, '\n');
          skipped++;
        }
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✅ Migration complete!`);
    console.log(`   Migrated: ${migrated} users`);
    console.log(`   Skipped: ${skipped} users`);
    console.log('='.repeat(50) + '\n');

    if (migrated > 0) {
      console.log('💡 Users have been migrated with new UUIDs.');
      console.log('⚠️  Users will need to log out and log in again to update their tokens.');
    }

    await AppDataSource.destroy();
  } catch (error) {
    console.error("❌ Migration error:", error);
    process.exit(1);
  }
}

migrateUsersFromNeo4j();
