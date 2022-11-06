const fs = require('fs');
const { readdir } = require('fs/promises');
const { mkdir } = require('node:fs/promises');
const path = require('path');

async function createDirectory(pathToNewDir) {
  try {
    await mkdir(pathToNewDir, { recursive: true });
  } catch (err) {
    console.log(err);
  }
}

function copyFile(file) {
  fs.copyFile(
    path.join(__dirname, 'files', file),
    path.join(__dirname, 'files-copy', file),
    (err) => {
      if (err) throw err;
    }
  );
}

async function copyDir(pathToDirToCopy) {
  try {
    const filesToCopy = await readdir(pathToDirToCopy);
    const filesInRootDir = await readdir(path.join(__dirname));

    filesInRootDir.forEach((file) => {
      // if files-copy directory exists

      if (file === 'files-copy') {
        fs.rm(
          path.join(__dirname, 'files-copy'),
          { recursive: true },
          (err) => {
            if (err) throw err;
            createDirectory(path.join(__dirname, 'files-copy'));
            filesToCopy.forEach((file) => {
              copyFile(file);
            });
          }
        );
      }
      // if files-copy directory doesn't exist

      createDirectory(path.join(__dirname, 'files-copy'));
      filesToCopy.forEach((file) => {
        copyFile(file);
      });
    });
    console.log('Файлы успешно скопированы');
  } catch (err) {
    console.log(err);
  }
}

copyDir(path.join(__dirname, 'files'));
