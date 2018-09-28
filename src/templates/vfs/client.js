
const myAdapter = (core) => ({
  readdir: (path, options) => Promise.resolve([])
});

export default myAdapter;
