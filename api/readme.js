/**
 * 🈶 Hanzi API Usage Examples
 *
 * This file demonstrates how to call every Hanzi API endpoint from a client app.
 * Works both in browser and Node (if using node-fetch or global fetch).
 *
 * Base URL defaults to same-origin. Change `BASE_URL` if testing from Node.
 */

const BASE_URL = typeof window === "undefined"
  ? process.env.HANZI_API_BASE || "https://214-hsk.vercel.app"
  : ""; // same origin when deployed on Vercel

/**
 * Generic helper
 */
async function callApi(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  const data = await res.json();
  console.log(`\n🔹 ${path}`);
  console.log(data);
  return data;
}

/**
 * 1️⃣ Decompose a single character
 * --------------------------------
 * Example: /api/decompose?ch=爱&level=2
 */
export async function exampleDecompose() {
  return callApi(`/api/decompose?ch=${encodeURIComponent("爱")}&level=2`);
}

/**
 * 2️⃣ Decompose multiple characters
 * --------------------------------
 * Example: /api/decompose-many?text=爱橄黃&level=2
 */
export async function exampleDecomposeMany() {
  return callApi(`/api/decompose-many?text=${encodeURIComponent("爱橄黃")}&level=2`);
}

/**
 * 3️⃣ Check if a component exists
 * --------------------------------
 * Example: /api/component-exists?component=乂
 */
export async function exampleComponentExists() {
  return callApi(`/api/component-exists?component=${encodeURIComponent("乂")}`);
}

/**
 * 4️⃣ Lookup dictionary definition (single character)
 * --------------------------------
 * Example: /api/define?char=雪&variant=s
 */
export async function exampleDefine() {
  return callApi(`/api/define?char=${encodeURIComponent("雪")}&variant=s`);
}

/**
 * 4️⃣ Lookup dictionary definition (multiple characters)
 * --------------------------------
 * Example: /api/define-many?text=爱橄黃&variant=s
 */
export async function exampleDefineMany() {
  return callApi(`/api/define-many?text=${encodeURIComponent("爱橄黃")}&variant=s`);
}

/**
 * 5️⃣ Search dictionary by word
 * --------------------------------
 * Example: /api/search?q=雪&mode=only
 */
export async function exampleSearch() {
  return callApi(`/api/search?q=${encodeURIComponent("雪")}&mode=only`);
}

/**
 * 6️⃣ Get character examples/vocabulary
 * --------------------------------
 * Example: /api/examples?char=橄
 */
export async function exampleExamples() {
  return callApi(`/api/examples?char=${encodeURIComponent("橄")}`);
}

/**
 * 7️⃣ Get characters containing a component
 * --------------------------------
 * Example: /api/characters-from-component?component=囗
 */
export async function exampleCharactersFromComponent() {
  return callApi(`/api/characters-from-component?component=${encodeURIComponent("囗")}`);
}

/**
 * 8️⃣ Pinyin ↔ Hanzi conversion
 * --------------------------------
 * Example 1: /api/pinyin?mode=toPinyin&text=我爱你
 * Example 2: /api/pinyin?mode=toHanzi&pinyin=ai4
 */
export async function examplePinyin() {
  await callApi(`/api/pinyin?mode=toPinyin&text=${encodeURIComponent("我爱你")}`);
  await callApi(`/api/pinyin?mode=toHanzi&pinyin=ai4`);
}

/**
 * 9️⃣ Dictionary search
 * --------------------
 * Example 1: /api/dictionary-search?text=雪&mode=all
 * Example 2: /api/dictionary-search?text=心的小孩真&mode=only
 */
export async function exampleDictionarySearch() {
  await callApi(`/api/dictionary-search?text=${encodeURIComponent("雪")}&mode=all`);
  await callApi(`/api/dictionary-search?text=${encodeURIComponent("心的小孩真")}&mode=only`);
}

/**
 * 🔟 Run all examples sequentially
 */
export async function runAllExamples() {
  console.log("=== 🈶 Hanzi API Usage Examples ===");
  await exampleDecompose();
  await exampleDecomposeMany();
  await exampleComponentExists();
  await exampleDefine();
  await exampleDefineMany();
  await exampleSearch();
  await exampleExamples();
  await exampleCharactersFromComponent();
  await examplePinyin();
  await exampleDictionarySearch();
  console.log("\n✅ All API calls completed.\n");
}

// Run automatically if executed directly in Node
if (typeof process !== "undefined" && process.argv[1].includes("api-usage-examples.js")) {
  runAllExamples().catch(err => console.error("❌ Error:", err));
}

/**
 * 🧠 Notes:
 * - Requires your API deployed or running locally (vercel start).
 * - To test locally:
 *   1. `vercel build && vercel start` (runs on :3000)
 *   2. Set BASE_URL = "http://localhost:3000"
 *   3. Run: `node api-usage-examples.js`
 *
 * Each function prints response JSON for quick verification.
 */
