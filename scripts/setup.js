#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Configurando EsporTz 2.0...');

// Create necessary directories
const directories = [
  'backend/uploads',
  'frontend/src/assets',
  'frontend/src/assets/images',
  'frontend/src/assets/icons'
];

directories.forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`✅ Criado diretório: ${dir}`);
  }
});

// Create default avatar
const defaultAvatarPath = path.join(__dirname, '..', 'frontend/src/assets/default-avatar.png');
if (!fs.existsSync(defaultAvatarPath)) {
  // Create a simple SVG placeholder
  const svgPlaceholder = `
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="50" fill="#e0e0e0"/>
  <circle cx="50" cy="35" r="15" fill="#9e9e9e"/>
  <circle cx="50" cy="75" r="25" fill="#9e9e9e"/>
</svg>`;
  fs.writeFileSync(defaultAvatarPath.replace('.png', '.svg'), svgPlaceholder);
  console.log('✅ Criado avatar padrão');
}

// Create environment template
const backendEnvPath = path.join(__dirname, '..', 'backend/.env');
if (!fs.existsSync(backendEnvPath)) {
  const envTemplate = `# Database Configuration
POSTGRES_DATABASE_URL=postgresql://username:password@localhost:5432/esportz

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Cloudinary Configuration (for media upload)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Server Configuration
PORT=3000
NODE_ENV=development

# Optional: Neo4j Configuration
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your-neo4j-password

# Optional: Redis Configuration
REDIS_URL=redis://localhost:6379

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:4200,http://localhost:3000
`;
  fs.writeFileSync(backendEnvPath, envTemplate);
  console.log('✅ Criado template de variáveis de ambiente (backend/.env)');
}

// Frontend environment
const frontendEnvPath = path.join(__dirname, '..', 'frontend/src/environments/environment.prod.ts');
if (!fs.existsSync(frontendEnvPath)) {
  const prodEnv = `export const environment = {
  production: true,
  apiUrl: 'https://your-api-domain.com/api',
  cloudinary: {
    cloudName: 'your-cloud-name',
    apiKey: 'your-api-key'
  }
};`;
  fs.writeFileSync(frontendEnvPath, prodEnv);
  console.log('✅ Criado ambiente de produção');
}

console.log('\n🎉 Setup completo!');
console.log('\n📋 Próximos passos:');
console.log('1. Configure as variáveis de ambiente em backend/.env');
console.log('2. Instale as dependências:');
console.log('   cd backend && pnpm install');
console.log('   cd frontend && pnpm install');
console.log('3. Inicie o banco de dados');
console.log('4. Execute as migrações: cd backend && pnpm run schema:sync');
console.log('5. Inicie os servidores:');
console.log('   Backend: cd backend && pnpm run dev');
console.log('   Frontend: cd frontend && ng serve');
console.log('\n🔗 Acesse a aplicação em http://localhost:4200');
console.log('📊 API em http://localhost:3000/api');