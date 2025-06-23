const withGoogleServices = require('./plugins/withGoogleServices');

module.exports = ({ config }) => {
  config = withGoogleServices(config);
  return config;
};
