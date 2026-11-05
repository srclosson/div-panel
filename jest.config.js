// force timezone to UTC to allow tests to work regardless of local timezone
// generally used by snapshots, but can affect specific tests
process.env.TZ = 'UTC';

const grafanaConfig = require('./.config/jest.config');

module.exports = {
  // Jest configuration provided by Grafana scaffolding
  ...grafanaConfig,
  transform: {
    ...grafanaConfig.transform,
    // Matches webpack's asset/source rule: .html files import as strings.
    '\\.html$': '<rootDir>/jest-html-transform.js',
  },
};
