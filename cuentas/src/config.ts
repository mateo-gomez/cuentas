import Constants from "expo-constants"

interface Config {
    apiUrl: string
}

const config = Constants.expoConfig?.extra || ({ apiUrl: "" } as Config)

export default config
