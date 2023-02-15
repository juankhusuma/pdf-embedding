import { OpenAIApi, Configuration } from "openai";

const conf = new Configuration({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_KEY
})
export const openai = new OpenAIApi(conf);