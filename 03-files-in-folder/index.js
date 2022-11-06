const { readdir } = require('node:fs/promises');
const path = require('path');
const fs = require('fs');

(async function (pathToDir) {
  try {
    const files = await readdir(pathToDir, { withFileTypes: true });

    files.forEach((dirent) => {
      if (dirent.isFile()) {
        fs.stat(
          path.join(__dirname, 'secret-folder', dirent.name),
          (err, stats) => {
            if (err) throw err;
            console.log(
              `${dirent.name.split('.')[0]} - ${
                path.extname(dirent.name).split('.')[1]
              } - ${stats.size} bytes`
            );
          }
        );
      }
    });
  } catch (err) {
    console.error(err);
  }
})(path.join(__dirname, 'secret-folder'));
