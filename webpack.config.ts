import type { Configuration } from 'webpack';
import { merge } from 'webpack-merge';
import grafanaConfig from './.config/webpack/webpack.config';

// Extends the scaffolded config (see .config/README.md) so the editor's example picker can import
// the files in examples/ as strings.
const config = async (env: any): Promise<Configuration> => {
  const baseConfig = await grafanaConfig(env);

  return merge(baseConfig, {
    module: {
      rules: [{ test: /\.html$/, type: 'asset/source' }],
    },
  });
};

export default config;
