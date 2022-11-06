const fs = require('fs');
const path = require('path');
const { stdin, stdout } = process;

fs.writeFile(path.join(__dirname, 'text.txt'), '', (err) => {
  if (err) throw err;
});

stdout.write('Введите текст:\n');
stdin.on('data', (data) => {
  fs.appendFile(path.join(__dirname, 'text.txt'), data, (err) => {
    if (err) throw err;
  });
  data = data.toString().trim();
  if (data === 'exit') {
    process.exit();
  }
});

process.on('exit', () => console.log('Удачи в учёбе!'));
process.on('SIGINT', () => {
  process.exit();
});
