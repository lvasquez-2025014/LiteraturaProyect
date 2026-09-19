const path = require('path');
const dns = require('node:dns');

// Fallback DNS para Windows con MongoDB Atlas
if (process.platform === 'win32') {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (e) {}
}

const dotenvPath = path.resolve(__dirname, '../backend/node_modules/dotenv');
try {
  require(dotenvPath).config({ path: path.resolve(__dirname, '../backend/.env') });
} catch (e) {}

const mongodbPath = path.resolve(__dirname, '../backend/node_modules/mongodb');
const { MongoClient } = require(mongodbPath);

const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'literaturaProyect';

async function main() {
  const action = process.argv[2];
  const email = process.argv[3];
  const targetRole = process.argv[4];
  const grade = process.argv[5] || '';
  const section = process.argv[6] || '';

  const client = new MongoClient(mongoUrl);
  await client.connect();
  const db = client.db(dbName);
  const usersCol = db.collection('users');

  if (action === 'list') {
    const users = await usersCol.find({}).toArray();
    console.log('\n=== ESTUDIANTES Y DOCENTES EN MONGODB (' + dbName + ') ===');
    console.table(users.map(u => ({
      ID: u._id.toString(),
      Nombre: u.name,
      Email: u.email,
      Rol: u.role,
      Grado: u.grade || 'N/A',
      Seccion: u.section || 'N/A',
      PPM: u.stats?.averageWpm || 0,
      Comprension: (u.stats?.comprehensionRate || 0) + '%'
    })));
    console.log('Total de registros:', users.length, '\n');
  } else if (action === 'promote') {
    if (!email || !targetRole) {
      console.error('Uso: node manage_user.cjs promote <email> <ROLE> [grade] [section]');
      process.exit(1);
    }

    const res = await usersCol.updateOne(
      { email: email.toLowerCase() },
      { 
        $set: { 
          role: targetRole, 
          grade, 
          section, 
          updatedAt: new Date() 
        } 
      }
    );

    if (res.matchedCount === 0) {
      console.error('ERROR: No se encontró cuenta con el correo: ' + email);
    } else {
      console.log(`EXITO: Cuenta ${email} actualizada al rol ${targetRole}`);
    }
  }

  await client.close();
}

main().catch(err => {
  console.error('Error en manage_user:', err);
  process.exit(1);
});
