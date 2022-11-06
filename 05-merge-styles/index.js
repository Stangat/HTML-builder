const fs = require('fs');
const path = require('path');
const { readdir } = require('node:fs/promises');

function writeDataToFile(file) {
  let data = '';
  const input = fs.createReadStream(
    path.join(__dirname, 'styles', file),
    'utf-8'
  );
  input.on('data', (chunk) => (data += chunk));
  input.on('end', () => {
    fs.appendFile(
      path.join(__dirname, 'project-dist', 'bundle.css'),
      data,
      (err) => {
        if (err) throw err;
      }
    );
  });
  input.on('error', (error) => console.log('Error', error.message));
}

function createFile() {
  fs.writeFile(
    path.join(__dirname, 'project-dist', 'bundle.css'),
    '',
    (err) => {
      if (err) throw err;
      console.log('Файл bundle.css создан');
    }
  );
}

async function createBundle() {
  try {
    const files = await readdir(path.join(__dirname, 'styles'), {
      withFileTypes: true,
    });
    createFile();
    files.forEach((dirent) => {
      if (dirent.isFile() && path.extname(dirent.name) === '.css') {
        writeDataToFile(dirent.name);
      }
    });
  } catch (err) {
    console.error(err);
  }
}

createBundle();
