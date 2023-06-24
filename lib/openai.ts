import { OpenAIApi, Configuration } from "openai";

export function createOpenAiClient(apiKey: string): OpenAIApi {
    const conf = new Configuration({
        apiKey
    })
    return new OpenAIApi(conf);
}