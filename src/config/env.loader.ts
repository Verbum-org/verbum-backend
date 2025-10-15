import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Carrega variáveis de ambiente do arquivo apropriado baseado no NODE_ENV
 */
export function loadEnvFile() {
  const env = process.env.NODE_ENV || 'development';

  // Mapeamento de ambientes para arquivos
  const envFiles: Record<string, string> = {
    development: '.env.local',
    staging: '.env.homolog',
    production: '.env.prod',
  };

  const envFile = envFiles[env] || '.env';
  const envPath = path.resolve(process.cwd(), envFile);

  // Tentar carregar o arquivo específico do ambiente
  if (fs.existsSync(envPath)) {
    console.log(`✅ Carregando variáveis de: ${envFile}`);
    dotenv.config({ path: envPath });
  } else {
    // Fallback para .env se o arquivo específico não existir
    const defaultEnvPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(defaultEnvPath)) {
      console.log(`⚠️  ${envFile} não encontrado. Usando .env como fallback`);
      dotenv.config({ path: defaultEnvPath });
    } else {
      console.warn(`⚠️  Nenhum arquivo de ambiente encontrado. Execute: npm run env:setup`);
    }
  }
}
