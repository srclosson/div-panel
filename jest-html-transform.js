// Lets tests import .html files as strings, the way webpack's asset/source rule does.
module.exports = {
  process(source) {
    return { code: `module.exports = ${JSON.stringify(source)};` };
  },
};
