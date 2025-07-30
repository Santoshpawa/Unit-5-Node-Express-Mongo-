import boxen from "boxen";

const msg1 = boxen("I am using my first external module!", {
  padding: 1,
  margin: 1,
  borderStyle: "double",
  borderColor: "cyan",
});

const msg2 = boxen("Second boxed message", {
  padding: 1,
  margin: 1,
  borderStyle: "round",
  borderColor: "magenta",
});

console.log(msg1);
console.log(msg2);
console.log("boxen module box printed");
