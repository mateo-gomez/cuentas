import { config } from "dotenv"

config()

module.exports = ({ config }) => {
    return {
        ...config,
        extra: {
            apiUrl: process.env.API_URL || "https://localhost:3000",
        },
    }
}
