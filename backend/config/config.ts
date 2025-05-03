export default {
	MONGO_URI: process.env.MONGO_URI,
	PORT: Number(process.env.PORT),
	JWT_SECRET: process.env.JWT_SECRET,
	OPENAI_API_KEY: process.env.OPENAI_API_KEY,
};
