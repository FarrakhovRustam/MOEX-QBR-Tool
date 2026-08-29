const required = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
for (const name of required) if (!process.env[name]) throw new Error(`${name} is required`);
const response = await fetch(`${process.env.SUPABASE_URL}/auth/v1/admin/users`, { method: "POST", headers: { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ email: "moex_test@qbr.local", password: "moex_test", email_confirm: true, user_metadata: { display_name: "Алексей Иванов" } }) });
const body = await response.json();
if (!response.ok && !String(body.msg ?? body.message).includes("already")) throw new Error(JSON.stringify(body));
console.log(body.id ? `Created test user ${body.id}` : "Test user already exists");
