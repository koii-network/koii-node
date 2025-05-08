// __mocks__/zstd-napi.js
module.exports = {
  compress: jest.fn().mockImplementation(() => {
    return Promise.resolve(Buffer.from(''));
  }),
  decompress: jest.fn().mockImplementation(() => {
    return Promise.resolve(Buffer.from(''));
  }),
};
