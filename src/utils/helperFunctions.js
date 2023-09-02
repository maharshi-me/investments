export const isLineStartsWith = (line, text) => line.substr(0, text.length) === text
export const isLineEndsWith = (line, text) => line.substr(-text.length) === text
export const isLineIncludes = (line, text) => line.includes(text)
export const getIndexByStartingText = (lines, text) => lines.indexOf(lines.filter(line => isLineStartsWith(line, text))[0])
