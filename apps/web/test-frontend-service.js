#!/usr/bin/env node

/**
 * 前端服務層測試腳本
 * 
 * 這個腳本用於測試前端服務層是否能正確訪問後端 API
 * 測試包括：健康檢查、註冊、登入、獲取用戶信息、登出
 */

// 設置為 ES 模块
// @ts-check

// 導入所需模組
import chalk from 'chalk';
// 使用原生 fetch API

// 配置
const BASE_URL = 'https://codewithdanko.tidepeng.workers.dev';
const TEST_USER = {
  email: `test-${Date.now()}@example.com`,
  password: 'Test123456!'
};

// 存儲測試過程中的數據
let authToken = null;
let userId = null;

/**
 * 執行測試並格式化輸出
 */
async function runTest(name, testFn) {
  try {
    console.log(chalk.blue(`\n🧪 開始測試: ${name}`));
    const result = await testFn();
    console.log(chalk.green(`✅ 測試通過: ${name}`));
    return result;
  } catch (error) {
    console.log(chalk.red(`❌ 測試失敗: ${name}`));
    console.log(chalk.red(`   錯誤信息: ${error.message}`));
    if (error.response) {
      console.log(chalk.red(`   狀態碼: ${error.response.status}`));
      try {
        const errorBody = await error.response.text();
        console.log(chalk.red(`   響應內容: ${errorBody}`));
      } catch (e) {
        console.log(chalk.red(`   無法讀取響應內容`));
      }
    }
    throw error;
  }
}

/**
 * 發送 API 請求
 */
async function apiRequest(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  // 如果有認證令牌，添加到請求頭
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    // 使用自定義錯誤類型，包含 response 屬性
    const error = new Error(`API 請求失敗: ${response.status}`);
    // @ts-ignore - 動態添加 response 屬性
    error.response = response;
    throw error;
  }

  // 檢查內容類型
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }

  return await response.text();
}

/**
 * 發送 API 請求（原始版本，返回 Response 便於檢查非 2xx 情況）
 */
async function apiRequestRaw(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  return response;
}

/**
 * 測試健康檢查 API
 */
async function testHealthCheck() {
  const result = await apiRequest('/api/health');
  console.log(chalk.cyan('健康檢查結果:'), result);
  
  // 根據實際回應格式進行檢查
  if (!result.ok) {
    throw new Error('健康檢查返回非 ok 狀態');
  }
  
  return result;
}

/**
 * 測試在無令牌時獲取用戶信息應返回 { user: null }
 */
async function testGetUserInfoWithoutToken() {
  const prev = authToken;
  authToken = null;
  const result = await apiRequest('/api/auth/me');
  console.log(chalk.cyan('無令牌用戶信息:'), result);
  if (!result || typeof result !== 'object' || result.user !== null) {
    throw new Error('無令牌時 /api/auth/me 應返回 { user: null }');
  }
  authToken = prev;
  return result;
}

/**
 * 測試使用錯誤密碼登入，應返回 401
 */
async function testLoginWrongPassword() {
  const res = await apiRequestRaw('/api/auth/login', {
    method: 'POST',
    body: {
      email: TEST_USER.email,
      password: 'WrongPassword!'
    }
  });
  const text = await res.text();
  console.log(chalk.cyan('錯誤密碼登入響應狀態/內容:'), res.status, text);
  if (res.status !== 401) {
    throw new Error('錯誤密碼登入應返回 401');
  }
  return { status: res.status, body: text };
}

/**
 * 測試重複註冊同一 email，應返回 409
 */
async function testDuplicateSignup() {
  const res = await apiRequestRaw('/api/auth/signup', {
    method: 'POST',
    body: TEST_USER
  });
  const text = await res.text();
  console.log(chalk.cyan('重複註冊響應狀態/內容:'), res.status, text);
  if (res.status !== 409) {
    throw new Error('重複註冊應返回 409');
  }
  return { status: res.status, body: text };
}

/**
 * 測試攜帶無效令牌請求 /api/auth/me，應返回 { user: null }
 */
async function testGetUserInfoWithInvalidToken() {
  const prev = authToken;
  authToken = 'invalid.token.value';
  const result = await apiRequest('/api/auth/me');
  console.log(chalk.cyan('無效令牌用戶信息:'), result);
  if (!result || typeof result !== 'object' || result.user !== null) {
    throw new Error('無效令牌時 /api/auth/me 應返回 { user: null }');
  }
  authToken = prev;
  return result;
}

/**
 * 測試註冊 API
 */
async function testSignup() {
  const result = await apiRequest('/api/auth/signup', {
    method: 'POST',
    body: TEST_USER
  });
  
  console.log(chalk.cyan('註冊結果:'), {
    id: result.id,
    email: result.email,
    tokenReceived: !!result.token
  });
  
  if (!result.token || !result.id) {
    throw new Error('註冊未返回有效的令牌或用戶 ID');
  }
  
  // 保存令牌和用戶 ID 供後續測試使用
  authToken = result.token;
  userId = result.id;
  
  return result;
}

/**
 * 測試登入 API
 */
async function testLogin() {
  // 先清除之前的令牌，模擬新的登入
  authToken = null;
  
  const result = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: {
      email: TEST_USER.email,
      password: TEST_USER.password
    }
  });
  
  console.log(chalk.cyan('登入結果:'), {
    id: result.id,
    email: result.email,
    tokenReceived: !!result.token
  });
  
  if (!result.token || !result.id) {
    throw new Error('登入未返回有效的令牌或用戶 ID');
  }
  
  // 更新令牌供後續測試使用
  authToken = result.token;
  
  return result;
}

/**
 * 測試獲取用戶信息 API
 */
async function testGetUserInfo() {
  const result = await apiRequest('/api/auth/me');
  
  // API 返回格式為 { user: { id, email } }
  console.log(chalk.cyan('用戶信息:'), result);
  
  if (!result.user) {
    throw new Error('獲取用戶信息失敗，無 user 屬性');
  }
  
  console.log(chalk.cyan('用戶詳細信息:'), {
    id: result.user.id,
    email: result.user.email
  });
  
  // 注意：API 返回的 ID 可能是字符串類型
  if (result.user.id.toString() !== userId.toString() || 
      result.user.email !== TEST_USER.email) {
    throw new Error('獲取的用戶信息與預期不符');
  }
  
  return result;
}

/**
 * 測試登出 API
 */
async function testLogout() {
  const result = await apiRequest('/api/auth/logout', {
    method: 'POST'
  });
  
  console.log(chalk.cyan('登出結果:'), result);
  
  // 清除令牌
  authToken = null;
  
  return result;
}

/**
 * 執行所有測試
 */
async function runAllTests() {
  console.log(chalk.yellow('🚀 開始測試前端服務層'));
  console.log(chalk.yellow(`📡 基礎 URL: ${BASE_URL}`));
  console.log(chalk.yellow(`👤 測試用戶: ${TEST_USER.email}`));
  
  try {
    // 測試健康檢查
    await runTest('健康檢查 API', testHealthCheck);
    
    // 測試註冊
    await runTest('註冊 API', testSignup);
    
    // 測試重複註冊（應 409）
    await runTest('重複註冊返回 409', testDuplicateSignup);
    
    // 測試獲取用戶信息
    await runTest('獲取用戶信息 API', testGetUserInfo);

    // 測試登出
    await runTest('登出 API', testLogout);
    
    // 登出後，無令牌獲取用戶應為 null
    await runTest('無令牌獲取用戶信息返回 null', testGetUserInfoWithoutToken);
    
    // 無效令牌請求 me 應為 null
    await runTest('無效令牌獲取用戶信息返回 null', testGetUserInfoWithInvalidToken);

    // 測試登入
    await runTest('登入 API', testLogin);
    
    // 錯誤密碼登入應 401
    await runTest('錯誤密碼登入返回 401', testLoginWrongPassword);
    
    // 再次測試獲取用戶信息
    await runTest('再次獲取用戶信息 API', testGetUserInfo);
    
    console.log(chalk.green('\n🎉 所有測試通過!'));
  } catch (error) {
    console.log(chalk.red('\n💥 測試過程中出現錯誤，中止測試'));
    process.exit(1);
  }
}

// 執行測試
runAllTests();
