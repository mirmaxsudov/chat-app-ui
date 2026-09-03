// Use the browser bundle: the package's CommonJS source expects Node's `global`.
// Avoid introducing a global polyfill into the entire Vite application.
declare module 'sockjs-client/dist/sockjs' {
  import SockJS from 'sockjs-client';
  export default SockJS;
}
