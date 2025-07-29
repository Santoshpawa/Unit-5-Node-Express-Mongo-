function isPrime(n) {
  if (n == 1) {
    return `${n} is neither prime nor composite`;
  }
  if (n < 4) {
    return `${n} is prime number`;
  }
  let check = true;
  for (let x = 2; x * x <= n; ++x) {
    if (n % x == 0) {
      check = false;
    }
  }
  if (check) {
    return `${n} is prime number`;
  } else {
    return `${n} is not a prime number`;
  }
}

module.exports = isPrime;
