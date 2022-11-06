const fs = require('fs');
const path = require('path');
const { readdir } = require('node:fs/promises');
const { mkdir } = require('node:fs/promises');

async function createDirectory(pathToNewDir) {
  try {
    const dirCreate = await mkdir(pathToNewDir, { recursive: true });
  } catch (err) {
    console.log(err);
  }
}

function createHtmlFileWithData(data) {
  fs.writeFile(
    path.join(__dirname, 'project-dist', 'index.html'),
    data,
    (err) => {
      if (err) throw err;
    }
  );
}

async function assembleHtml() {
  try {
    const files = await readdir(path.join(__dirname, 'components'));

    const streamTemplate = fs.createReadStream(
      path.join(__dirname, 'template.html'),
      'utf-8'
    );
    let data = '';
    streamTemplate.on('data', (chunk) => (data += chunk));
    streamTemplate.on('end', () => {
      files.forEach((file) => {
        if (path.extname(file) === '.html') {
          const streamComponent = fs.createReadStream(
            path.join(__dirname, 'components', file),
            'utf-8'
          );
          let componentData = '';
          streamComponent.on('data', (chunk) => (componentData += chunk));
          streamComponent.on('end', () => {
            const fileName = file.split('.')[0];
            if (data.includes(`{{${fileName}}}`)) {
              data = data.replace(`{{${fileName}}}`, componentData);
              createHtmlFileWithData(data);
            }
          });
          streamComponent.on('error', (error) =>
            console.log('Error', error.message)
          );
        }
      });
    });
    streamTemplate.on('error', (error) => console.log('Error', error.message));
    console.log('файл index.html создан');
  } catch (err) {
    console.error(err);
  }
}

function writeDataToCssFile(file) {
  let data = '';
  const input = fs.createReadStream(
    path.join(__dirname, 'styles', file),
    'utf-8'
  );
  input.on('data', (chunk) => (data += chunk));
  input.on('end', () => {
    fs.appendFile(
      path.join(__dirname, 'project-dist', 'style.css'),
      data,
      (err) => {
        if (err) throw err;
      }
    );
  });
  input.on('error', (error) => console.log('Error', error.message));
}

function createCssFile() {
  fs.writeFile(path.join(__dirname, 'project-dist', 'style.css'), '', (err) => {
    if (err) throw err;
  });
}

async function assembleCss() {
  try {
    const files = await readdir(path.join(__dirname, 'styles'), {
      withFileTypes: true,
    });
    createCssFile();
    files.forEach((dirent) => {
      if (dirent.isFile() && path.extname(dirent.name) === '.css') {
        writeDataToCssFile(dirent.name);
      }
    });
    console.log('файл style.css создан');
  } catch (err) {
    console.error(err);
  }
}

function copyFileToDirectory(dir, file) {
  fs.copyFile(
    path.join(__dirname, 'assets', dir, file),
    path.join(__dirname, 'project-dist', 'assets', dir, file),
    (err) => {
      if (err) throw err;
    }
  );
}

function copyFile(file) {
  fs.copyFile(
    path.join(__dirname, 'assets', file),
    path.join(__dirname, 'project-dist', 'assets', file),
    (err) => {
      if (err) throw err;
    }
  );
}

async function copyAssetsDirectory() {
  try {
    const projectDistFiles = await readdir(
      path.join(__dirname, 'project-dist')
    );
    const assetsFiles = await readdir(path.join(__dirname, 'assets'));

    return new Promise((resolve) => {
      // if assets derictory exists in project-dist

      projectDistFiles.forEach((file) => {
        if (file === 'assets') {
          fs.rm(
            path.join(__dirname, 'project-dist', 'assets'),
            { recursive: true },
            (err) => {
              if (err) throw err;
              createDirectory(path.join(__dirname, 'project-dist', 'assets'));
              assetsFiles.forEach((item) => {
                fs.stat(path.join(__dirname, 'assets', item), (err, stats) => {
                  if (err) throw err;
                  if (stats.isDirectory()) {
                    createDirectory(
                      path.join(__dirname, 'project-dist', 'assets', item)
                    );
                    fs.readdir(
                      path.join(__dirname, 'assets', item),
                      (err, files) => {
                        if (err) throw err;
                        files.forEach((file) => {
                          copyFileToDirectory(item, file);
                        });
                      }
                    );
                  } else {
                    copyFile(item);
                  }
                });
              });
            }
          );
          resolve('Папка assets обновлена');
        }
      });
      // if assets derictory doesn't exist in project-dist

      createDirectory(path.join(__dirname, 'project-dist', 'assets'));
      assetsFiles.forEach((item) => {
        fs.stat(path.join(__dirname, 'assets', item), (err, stats) => {
          if (err) throw err;
          if (stats.isDirectory()) {
            createDirectory(
              path.join(__dirname, 'project-dist', 'assets', item)
            );
            fs.readdir(path.join(__dirname, 'assets', item), (err, files) => {
              if (err) throw err;
              files.forEach((file) => {
                copyFileToDirectory(item, file);
              });
            });
          } else {
            copyFile(item);
          }
        });
        resolve('папка assets создана');
      });
    });
  } catch (err) {
    console.log(err);
  }
}

createDirectory(path.join(__dirname, 'project-dist'));
copyAssetsDirectory().then(console.log);
assembleHtml();
assembleCss();
