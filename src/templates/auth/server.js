
module.exports = (core, config) => ({
  login: (req, res) => {
    const {username} = req.body;

    return Promise.resolve({
      id: 1,
      username,
      groups: ['admin']
    });
  },

  logout: (req, res) => {
    return Promise.resolve(true);
  }
});
