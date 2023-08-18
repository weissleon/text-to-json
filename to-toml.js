const OUT_PATH = "./out";

const run = async () => {
  const filePath = process.argv[2];
  const fs = require("fs/promises");
  const path = require("path");
  const Xlsx = require("xlsx");
  const workbook = Xlsx.readFile(path.join(filePath));
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawData = Xlsx.utils.sheet_to_json(worksheet, { header: 1 });
  rawData.shift();

  let outputData = [];

  let curCategory = "";
  for (let i = 0; i < rawData.length; i++) {
    const pair = rawData[i];
    const key = pair[0];
    const value = pair[1];

    const segments = key.split("/");
    const category = segments[0];
    if (curCategory !== category) {
      outputData.push(`[${category}]`);
      curCategory = category;
    }
    outputData.push(`${segments[1]}="${value}"`);
  }

  const data = outputData.join("\n");

  await fs.writeFile(
    path.join(OUT_PATH, path.basename(filePath).split(".")[0]),
    data,
    { encoding: "utf-8" }
  );
};

run();
