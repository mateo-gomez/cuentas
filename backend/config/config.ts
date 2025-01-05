export default {
  MONGO_URI: Deno.env.get("MONGO_URI"),
  PORT: Number(Deno.env.get("PORT")),
  JWT_SECRET: Deno.env.get("JWT_SECRET"),
};
