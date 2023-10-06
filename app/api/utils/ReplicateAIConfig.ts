import Replicate from "replicate";

/**
 * Replicate インスタンスを作成します。
 * 環境変数から REPLICATE_API_TOKEN を取得し、
 * auth プロパティとして設定します。
 *
 * @typedef {Object} replicateAIConfiguration
 * @property {string} auth - Replicate APIの認証トークン。
 *
 * @example
 * import { replicateAIConfiguration } from 'このモジュールのパス';
 * const response = await replicateAIConfiguration.run('モデルのID', { input: '入力データ' });
 */
const replicateAIConfiguration = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!, // 環境変数から認証トークンを取得します。
});

export { replicateAIConfiguration };
