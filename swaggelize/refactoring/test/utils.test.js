const {readFileContent, getFileInDirectory} = require("../src/utils/utils");

describe('utils functions', () => {
    it('read content of a file', () => {
        expect(readFileContent('refactoring/test/contentTest.txt')).toBe('test content');
    })

    it('get files in a directory', () => {
        expect(getFileInDirectory('refactoring/src/utils')).toStrictEqual(["constants.js", "utils.js"]);
    })
})