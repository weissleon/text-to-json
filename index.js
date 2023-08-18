const OUT_PATH = "./out";

const run = async () => {
  const filePath = process.argv[2];
  const fs = require("fs/promises");
  const path = require("path");
  const Xlsx = require("xlsx");
  const workbook = Xlsx.readFile(path.join(filePath));
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  let rawData = Xlsx.utils.sheet_to_json(worksheet, { header: 1 });
  rawData.shift();
  rawData = rawData.filter((val) => val.length !== 0);
  const jsonData = {};
  for (const pair of rawData) {
    const key = pair[0].toString();
    const value = pair[1];

    const keySegments = key.split("/");

    let lvl = jsonData;
    for (let i = 0; i < keySegments.length; i++) {
      let subKey = keySegments[i];
      // Fill in the value
      if (i === keySegments.length - 1) {
        const result = isArray(subKey);
        if (result !== null) {
          if (lvl[result.key] === undefined) lvl[result.key] = [];
          lvl[result.key][result.index] = value;
        } else {
          lvl[subKey] = value;
        }
        break;
      }

      // Construct the map in case the key is empty
      const result = isArray(subKey);
      if (result === null) {
        lvl[subKey] = {};
      }
      if (lvl[result.key] === undefined) {
        if (result !== null) {
          lvl[result.key] = [];
          subKey = result.key;
          lvl[subKey][result.index] = {};
          lvl = lvl[subKey][result.index];
        } else {
          lvl[subKey] = {};
          lvl = lvl[subKey];
        }
      } else {
        if (result !== null) {
          if (lvl[result.key][result.index] === undefined)
            lvl[result.key][result.index] = {};
          lvl = lvl[result.key][result.index];
        } else {
          lvl = lvl[subKey];
        }
      }
    }
  }

  await fs.writeFile(
    path.join(OUT_PATH, path.basename(filePath).split(".")[0]),
    JSON.stringify(jsonData),
    { encoding: "utf-8" }
  );
};

const isArray = (key) => {
  const result = key.match(/(?<=\[)\d+(?=\])/);

  if (result === null) return null;
  const path = key.slice(0, key.indexOf("["));
  return { index: result[0], key: path };
};

run();
