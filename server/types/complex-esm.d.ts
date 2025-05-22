// fixes tsc compile error with this library
declare module "complex-esm" {
  export { Complex } from "complex-esm/dist/src/complex";
}
