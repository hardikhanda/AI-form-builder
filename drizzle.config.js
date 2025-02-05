
import { defineConfig } from 'drizzle-kit';
export default defineConfig({
  out: './drizzle',
  schema: './configs/schema.js',
  dialect: 'postgresql',
  dbCredentials: {
    url:"postgresql://neondb_owner:npg_on1EQyCNO0jh@ep-orange-shape-a8knf1e8-pooler.eastus2.azure.neon.tech/neondb?sslmode=require",
  },
});