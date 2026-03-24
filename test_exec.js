
import { executeCode } from './backend/utils/codeExecution.js';
import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });

async function test() {
  console.log("Testing code execution...");
  const result = await executeCode("cpp", "#include <iostream>\nint main() { std::cout << \"hello\"; return 0; }", "");
  console.log("Result:", JSON.stringify(result, null, 2));
}

test().catch(console.error);
