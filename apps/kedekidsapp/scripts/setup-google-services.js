import { mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';

const decoded = Buffer.from(process.env.GOOGLE_SERVICES_JSON, 'base64').toString('utf8');
const targetPath = join(__dirname, '../android/app/google-services.json');

mkdirSync(dirname(targetPath), { recursive: true });
writeFileSync(targetPath, decoded);

console.log('✅ google-services.json creado desde EAS secret');
