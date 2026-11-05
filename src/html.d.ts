// examples/*.html are bundled as strings (webpack asset/source).
declare module '*.html' {
  const source: string;
  export default source;
}
