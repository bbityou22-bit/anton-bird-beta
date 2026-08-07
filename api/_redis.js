async function redis(command) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("Online database is not configured");
  const r = await fetch(url, { method:"POST", headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"}, body:JSON.stringify(command) });
  const j = await r.json();
  if (!r.ok || j.error) throw new Error(j.error || "Database request failed");
  return j.result;
}
module.exports = { redis };
