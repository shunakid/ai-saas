import { Configuration, OpenAIApi } from "openai";

/**
 * OpenAI APIの設定オブジェクトを作成します。
 * 環境変数から OPENAI_API_KEY を取得し、
 * apiKey プロパティとして設定します。
 *
 * @typedef {Object} openAIConfiguration
 * @property {string} apiKey - OpenAI APIのAPIキー。
 */
const openAIConfiguration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, // 環境変数からAPIキーを取得します。
});

/**
 * OpenAIApi インスタンスを作成します。
 * 上で作成した openAIConfiguration オブジェクトを使用します。
 *
 * @typedef {Object} openAIApiInstance
 * @example
 * import { openAIApiInstance } from 'このモジュールのパス';
 * const response = await openAIApiInstance.createCompletion({ ... });
 */
const openAIApiInstance = new OpenAIApi(openAIConfiguration);

export { openAIConfiguration, openAIApiInstance };
