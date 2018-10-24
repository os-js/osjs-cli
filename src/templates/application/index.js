import {name as applicationName} from './metadata.json';

// Our launcher
const register = (core, args, options, metadata) => {
  // Create a new Application instance
  const proc = core.make('osjs/application', {args, options, metadata});

  // Create  a new Window instance
  proc.createWindow({
    id: '___NAME___Window',
    title: metadata.title.en_EN,
    dimension: {width: 400, height: 400},
    position: {left: 700, top: 200}
  })
    .on('destroy', () => proc.destroy())
    .render();

  // Creates a new WebSocket (see server.js)
  //proc.socket('/socket');

  // Creates a HTTP call (see server.js)
  //proc.request('/test')
  //.then(response => console.log(response));

  return proc;
};

// Creates the internal callback function when OS.js launches an application
window.OSjs.register(applicationName, register);
