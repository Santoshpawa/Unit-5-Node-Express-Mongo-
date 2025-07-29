function factorial(n) {
  if (n == 0 || n == 1) {
    return `Factorial of ${n} is: ${1}`;
  }
  let arr = new Array(n + 1).fill(1);
  for (let i = 2; i <= n; ++i) {
    arr[i] = i * arr[i - 1];
  }
  return `Factorial of ${n} is: ${arr[n]}`;
}

module.exports = factorial;
