import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import postcss from "rollup-plugin-postcss";
import livereload from 'rollup-plugin-livereload';
import * as child from 'child_process';

function serve() {
  // Keep a reference to a spawned server process
  let server;

  function toExit() {
    // kill the server if it exists
    if (server) server.kill(0);
  }

  return {
    writeBundle() {
      if (server) return;
      // Spawn a child server process
      server = child.spawn(
        'npm',
        ['run', 'start', '--', '--dev'],
        {
          stdio: ['ignore', 'inherit', 'inherit'],
          shell: true,
        }
      );

      // Kill server on process termination or exit
      process.on('SIGTERM', toExit);
      process.on('exit', toExit);
    },
  };
}

export default {
  input: 'test/demo.js',   //Entry point for rollup aka file to bundle 
  output: {
    file: 'public/build/bundle.js', // The destination for our bundled JavaScript
    format: 'iife', // Our bundle will be an Immediately-Invoked Function Expression
    name: 'app', // The IIFE return value will be assigned into a variable called `app`
  },
  plugins: [
    svelte({
      // Tell the svelte plugin where our svelte files are located
      include: ['test/**/*.svelte','src/**/*.svelte'],
    }),
    resolve({ browser: true }), // Tell any third-party plugins that we're building for the browser
    postcss(), // Tell the browser to use this plugin for reading css
    serve(),
    livereload('public'),
  ],
};

//https://typeofnan.dev/how-to-set-up-a-svelte-app-with-rollup/