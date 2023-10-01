// openAIConfig.js
import { Configuration, OpenAIApi } from "openai";

const openAIConfiguration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openAIApiInstance = new OpenAIApi(openAIConfiguration);

export { openAIConfiguration, openAIApiInstance };
