
const myAdapter = (core, config) => ({
  login: values => {
    // You can transform the form values from login here if you want
    return Promise.resolve(values);
  },

  logout: () => {
    // And perform special operations on logout
    return Promise.resolve(true);
  }
});

export default myAdapter;
