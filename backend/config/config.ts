const envvars = Deno.env.toObject();

export default {
  MONGO_URI: envvars.MONGO_URI,
  PORT: (envvars.PORT || 8000) as unknown as number,
};
