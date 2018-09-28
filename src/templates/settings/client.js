
const myAdapter = (core, options) => ({
  // Create your own request here with 'values' settings
  save: values => {
    return Promise.resolve(true);
  },

  // Create your own request here and return settings
  load: () => {
    return Promise.resolve({});
  }
});

export default myAdapter;
