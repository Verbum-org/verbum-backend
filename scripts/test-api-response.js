/**
 * Script para testar a estrutura de resposta da API
 * e verificar se não há duplo wrapping
 */

const http = require('http');
const https = require('https');

const BASE_URL = process.env.API_URL || 'http://localhost:4000';
const EMAIL = process.env.TEST_EMAIL || 'davijesus999994@gmail.com';
const PASSWORD = process.env.TEST_PASSWORD || 'your-password-here';

/**
 * Faz uma requisição HTTP
 */
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const protocol = options.protocol === 'https:' ? https : http;
    
    const req = protocol.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: jsonBody,
          });
        } catch (error) {
          reject(new Error(`Failed to parse JSON: ${body}`));
        }
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

/**
 * Verifica se há duplo wrapping na resposta
 */
function checkDoubleWrapping(response, path) {
  console.log(`\n📋 Verificando endpoint: ${path}`);
  console.log(`Status: ${response.statusCode}`);
  
  if (response.statusCode >= 400) {
    console.log('❌ Erro na requisição');
    console.log(JSON.stringify(response.body, null, 2));
    return false;
  }
  
  const { body } = response;
  
  // Verificar estrutura esperada
  if (!body.hasOwnProperty('success')) {
    console.log('❌ ERRO: Resposta não possui propriedade "success"');
    return false;
  }
  
  if (!body.hasOwnProperty('data')) {
    console.log('❌ ERRO: Resposta não possui propriedade "data"');
    return false;
  }
  
  if (!body.hasOwnProperty('timestamp')) {
    console.log('❌ ERRO: Resposta não possui propriedade "timestamp"');
    return false;
  }
  
  if (!body.hasOwnProperty('path')) {
    console.log('❌ ERRO: Resposta não possui propriedade "path"');
    return false;
  }
  
  // Verificar duplo wrapping
  const data = body.data;
  
  if (data && typeof data === 'object') {
    // Se data tem "success" e "data", pode ser duplo wrapping
    if (data.hasOwnProperty('success') && data.hasOwnProperty('data')) {
      console.log('⚠️  AVISO: Detectado possível duplo wrapping!');
      console.log('Estrutura da resposta:');
      console.log(JSON.stringify(body, null, 2));
      return false;
    }
  }
  
  console.log('✅ Estrutura correta! Não há duplo wrapping.');
  console.log(`Nível 1: { success: ${body.success}, data: {...}, timestamp: "${body.timestamp}", path: "${body.path}" }`);
  console.log(`Nível 2 (data): ${Array.isArray(data) ? `Array com ${data.length} itens` : typeof data === 'object' ? Object.keys(data).join(', ') : data}`);
  
  return true;
}

/**
 * Testa o login e profile
 */
async function testAuth() {
  console.log('🚀 Iniciando testes de API...\n');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Email: ${EMAIL}\n`);
  
  try {
    // 1. Fazer login
    console.log('🔐 Fazendo login...');
    const url = new URL(`${BASE_URL}/api/v1/auth/login`);
    
    const loginResponse = await makeRequest({
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }, {
      email: EMAIL,
      password: PASSWORD,
    });
    
    const loginValid = checkDoubleWrapping(loginResponse, '/api/v1/auth/login');
    
    if (!loginValid || loginResponse.statusCode !== 200) {
      console.log('\n❌ Falha no login. Verifique as credenciais.');
      return;
    }
    
    const accessToken = loginResponse.body.data.accessToken;
    console.log(`\n🎫 Token obtido: ${accessToken.substring(0, 20)}...`);
    
    // 2. Testar profile
    console.log('\n👤 Buscando perfil...');
    const profileUrl = new URL(`${BASE_URL}/api/v1/auth/profile`);
    
    const profileResponse = await makeRequest({
      protocol: profileUrl.protocol,
      hostname: profileUrl.hostname,
      port: profileUrl.port || (profileUrl.protocol === 'https:' ? 443 : 80),
      path: profileUrl.pathname,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    const profileValid = checkDoubleWrapping(profileResponse, '/api/v1/auth/profile');
    
    if (profileValid) {
      console.log('\n✅ Todos os testes passaram! A API está retornando respostas corretas.');
    } else {
      console.log('\n❌ Alguns testes falharam. Verifique a estrutura das respostas acima.');
    }
    
  } catch (error) {
    console.error('\n❌ Erro ao executar testes:', error.message);
  }
}

// Executar testes
testAuth();

