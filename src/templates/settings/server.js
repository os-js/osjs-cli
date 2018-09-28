
module.exports = (core, options) => ({
  // req.body has all settings from client
  save: (req, res) => {
    return Promise.resolve(true);
  },

  // return all settings for user here
  load: (req, res) => {
    return Promise.resolve({});
  }
});
