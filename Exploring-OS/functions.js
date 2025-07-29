const os = require("os");

function getSystemInfo() {
  console.log("System Architecture: ", os.arch());
  const cpus = os.cpus();

  cpus.forEach((cpu, index) => {
    console.log(`CPU ${index + 1}:`);
    console.log(`Model: ${cpu.model}`);
    console.log(`Speed: ${cpu.speed} MHz`);
  });
}

module.exports = getSystemInfo;
