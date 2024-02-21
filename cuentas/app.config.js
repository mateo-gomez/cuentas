import { config } from "dotenv"

config()

module.exports = ({ config }) => {
    return {
        ...config,
        extra: {
            apiUrl: process.env.URL_API || "https://localhost:3000",
        },
    }
}
