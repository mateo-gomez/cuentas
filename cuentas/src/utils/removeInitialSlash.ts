export const removeInitialSlash = (endpoint: string) => {
  return endpoint.at(0) === "/" ? endpoint.substring(1) : endpoint
}
