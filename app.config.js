import { config } from "dotenv"

config()

module.exports = ({ config }) => {
    console.log(config.name) // prints 'My App'
    return {
        ...config,
        extra: {
            apiUrl: process.env.API_URL || "https://localhost:3000",
        },
    }
}
