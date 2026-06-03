const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

function generateShortCode(id) {
  let code = '';
  while (id > 0) {
    code = ALPHABET[id % 62] + code;
    id = Math.floor(id / 62);
  }
  return code || '0';
}

module.exports = { generateShortCode };