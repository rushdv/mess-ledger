const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
try {
  let schema = fs.readFileSync(schemaPath, 'utf8');

  // Check if we are in Vercel environment (production/preview)
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    if (schema.includes('provider = "sqlite"')) {
      schema = schema.replace('provider = "sqlite"', 'provider = "postgresql"');
      fs.writeFileSync(schemaPath, schema);
      console.log('🔄 Switched Prisma provider to postgresql for Vercel production build.');
    }
  } else {
    // If running locally, make sure it is sqlite
    if (schema.includes('provider = "postgresql"')) {
      schema = schema.replace('provider = "postgresql"', 'provider = "sqlite"');
      fs.writeFileSync(schemaPath, schema);
      console.log('🔄 Switched Prisma provider back to sqlite for local development.');
    }
  }
} catch (error) {
  console.error('Failed to run prisma-provider-switch:', error);
}
