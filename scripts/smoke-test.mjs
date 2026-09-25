import assert from "node:assert/strict";
const base = process.env.TEST_BASE_URL || "http://localhost:3000";
async function check(path, status, pattern) {
  const r = await fetch(base + path, { redirect: "manual" });
  assert.equal(r.status, status, path);
  const text = await r.text();
  if (pattern) assert.match(text, pattern, path);
  console.log("PASS", path, status);
  return r;
}
await check("/", 200, /Something worth watching/);
await check("/search?q=mountain", 200, /Above it all/);
await check("/search?q=zzzznoresults", 200, /No results found/);
await check("/?type=image", 200, /Finding quiet/);
await check("/video/demo-1", 200, /Above it all/);
await check("/video/missing", 404, /This moment/);
const protectedPage = await check("/admin/dashboard", 307);
assert.ok(protectedPage.headers.get("location").endsWith("/admin"));
await check("/api/videos", 200, /demo-1/);
await check("/api/search?q=mountain", 200, /demo-1/);
await check("/api/videos/missing", 404);
for (const [path, method] of [
  ["/api/admin/upload", "POST"],
  ["/api/admin/videos/11111111-1111-4111-8111-111111111111", "PATCH"],
  ["/api/admin/videos/11111111-1111-4111-8111-111111111111", "DELETE"],
]) {
  const r = await fetch(base + path, {
    method,
    headers: { Origin: base, "Content-Type": "application/json" },
    body: "{}",
  });
  assert.equal(r.status, 401);
  console.log("PASS unauthorized", method, path);
}
const csrf = await fetch(base + "/api/admin/login", {
  method: "POST",
  headers: {
    Origin: "https://untrusted.example",
    "Content-Type": "application/json",
  },
  body: "{}",
});
assert.equal(csrf.status, 403);
console.log("PASS cross-origin login rejected");
