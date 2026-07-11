export default {
	MONGO_URI: process.env.MONGO_URI,
	PORT: Number(process.env.PORT),
	JWT_SECRET: process.env.JWT_SECRET,
	JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
	ACCESS_TOKEN_TTL: process.env.ACCESS_TOKEN_TTL || "15m",
	REFRESH_TOKEN_TTL: process.env.REFRESH_TOKEN_TTL || "7d",
	OPENAI_API_KEY: process.env.OPENAI_API_KEY,
};
