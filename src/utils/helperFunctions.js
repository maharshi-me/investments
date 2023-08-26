export const isLineStartsWith = (line, text) => line.substr(0, text.length) === text
export const isLineEndsWith = (line, text) => line.substr(-text.length) === text
