/**
 * This computes the zipped array of input arrays.
 *
 * This runs on `O(n)`, linear time in respect to the array
 *
 * @param {...Array<number>} x samples of one or more data points
 * @returns {Array<number>} packed array
 * @example
 * max([1, 2, 3, 4]);
 * // => 4
 */
export const zip = (...rows: any[]) => rows[0].map((_: any, c: string | number) => rows.map((row) => row[c]));

/**
 * This computes the maximum number in an array.
 *
 * This runs on `O(n)`, linear time in respect to the array
 *
 * @param {Array<number>} x sample of one or more data points
 * @returns {number} maximum value
 * @throws {Error} if the the length of x is less than one
 * @example
 * max([1, 2, 3, 4]);
 * // => 4
 */
export function max(x: number[]) {
  if (x.length === 0) {
    throw new Error('max requires at least one data point');
  }

  let value = x[0];
  for (let i = 1; i < x.length; i++) {
    // On the first iteration of this loop, max is
    // undefined and is thus made the maximum element in the array
    if (x[i] > value) {
      value = x[i];
    }
  }
  return value;
}

/**
 * The min is the lowest number in the array. This runs on `O(n)`, linear time in respect to the array
 *
 * @param {Array<number>} x sample of one or more data points
 * @throws {Error} if the the length of x is less than one
 * @returns {number} minimum value
 * @example
 * min([1, 5, -10, 100, 2]); // => -10
 */
export function min(x: number[]) {
  if (x.length === 0) {
    throw new Error('min requires at least one data point');
  }

  let value = x[0];
  for (let i = 1; i < x.length; i++) {
    // On the first iteration of this loop, min is
    // undefined and is thus made the minimum element in the array
    if (x[i] < value) {
      value = x[i];
    }
  }
  return value;
}

/**
 * The maximum is the highest number in the array. With a sorted array,
 * the last element in the array is always the largest, so this calculation
 * can be done in one step, or constant time.
 *
 * @param {Array<number>} x input
 * @returns {number} maximum value
 * @example
 * maxSorted([-100, -10, 1, 2, 5]); // => 5
 */
export function maxSorted(x: number[]) {
  return x[x.length - 1];
}

/**
 * Rearrange items in `arr` so that all items in `[left, k]` range are the smallest.
 * The `k`-th element will have the `(k - left + 1)`-th smallest value in `[left, right]`.
 *
 * Implements Floyd-Rivest selection algorithm https://en.wikipedia.org/wiki/Floyd-Rivest_algorithm
 *
 * @param {Array<number>} arr input array
 * @param {number} k pivot index
 * @param {number} [left] left index
 * @param {number} [right] right index
 * @returns {void} mutates input array
 * @example
 * var arr = [65, 28, 59, 33, 21, 56, 22, 95, 50, 12, 90, 53, 28, 77, 39];
 * quickselect(arr, 8);
 * // = [39, 28, 28, 33, 21, 12, 22, 50, 53, 56, 59, 65, 90, 77, 95]
 */
export function quickselect(arr: number[], k: number, left: number, right: number) {
  left = left || 0;
  right = right || arr.length - 1;

  while (right > left) {
    // 600 and 0.5 are arbitrary constants chosen in the original paper to minimize execution time
    if (right - left > 600) {
      const n = right - left + 1;
      const m = k - left + 1;
      const z = Math.log(n);
      const s = 0.5 * Math.exp((2 * z) / 3);
      let sd = 0.5 * Math.sqrt((z * s * (n - s)) / n);
      if (m - n / 2 < 0) sd *= -1;
      const newLeft = Math.max(left, Math.floor(k - (m * s) / n + sd));
      const newRight = Math.min(right, Math.floor(k + ((n - m) * s) / n + sd));
      quickselect(arr, k, newLeft, newRight);
    }

    const t = arr[k];
    let i = left;
    let j = right;

    swap(arr, left, k);
    if (arr[right] > t) swap(arr, left, right);

    while (i < j) {
      swap(arr, i, j);
      i++;
      j--;
      while (arr[i] < t) i++;
      while (arr[j] > t) j--;
    }

    if (arr[left] === t) swap(arr, left, j);
    else {
      j++;
      swap(arr, j, right);
    }

    if (j <= k) left = j + 1;
    if (k <= j) right = j - 1;
  }
}

function swap(arr: number[], i: number, j: number) {
  const tmp = arr[i];
  arr[i] = arr[j];
  arr[j] = tmp;
}

/**
 * This is the internal implementation of quantiles: when you know
 * that the order is sorted, you don't need to re-sort it, and the computations
 * are faster.
 *
 * @param {Array<number>} x sample of one or more data points
 * @param {number} p desired quantile: a number between 0 to 1, inclusive
 * @returns {number} quantile value
 * @throws {Error} if p ix outside of the range from 0 to 1
 * @throws {Error} if x is empty
 * @example
 * quantileSorted([3, 6, 7, 8, 8, 9, 10, 13, 15, 16, 20], 0.5); // => 9
 */
export function quantileSorted(x: number[], p: number) {
  const idx = x.length * p;
  if (x.length === 0) {
    throw new Error('quantile requires at least one data point.');
  } else if (p < 0 || p > 1) {
    throw new Error('quantiles must be between 0 and 1');
  } else if (p === 1) {
    // If p is 1, directly return the last element
    return x[x.length - 1];
  } else if (p === 0) {
    // If p is 0, directly return the first element
    return x[0];
  } else if (idx % 1 !== 0) {
    // If p is not integer, return the next element in array
    return x[Math.ceil(idx) - 1];
  } else if (x.length % 2 === 0) {
    // If the list has even-length, we'll take the average of this number
    // and the next value, if there is one
    return (x[idx - 1] + x[idx]) / 2;
  } else {
    // Finally, in the simple case of an integer value
    // with an odd-length list, return the x value at the index.
    return x[idx];
  }
}

/**
 * The [quantile](https://en.wikipedia.org/wiki/Quantile):
 * this is a population quantile, since we assume to know the entire
 * dataset in this library. This is an implementation of the
 * [Quantiles of a Population](http://en.wikipedia.org/wiki/Quantile#Quantiles_of_a_population)
 * algorithm from wikipedia.
 *
 * Sample is a one-dimensional array of numbers,
 * and p is either a decimal number from 0 to 1 or an array of decimal
 * numbers from 0 to 1.
 * In terms of a k/q quantile, p = k/q - it's just dealing with fractions or dealing
 * with decimal values.
 * When p is an array, the result of the function is also an array containing the appropriate
 * quantiles in input order
 *
 * @param {Array<number>} x sample of one or more numbers
 * @param {Array<number> | number} p the desired quantile, as a number between 0 and 1
 * @returns {number} quantile
 * @example
 * quantile([3, 6, 7, 8, 8, 9, 10, 13, 15, 16, 20], 0.5); // => 9
 */
export function quantile(x: number[], p: number) {
  const copy = x.slice();

  const idx = quantileIndex(copy.length, p);
  quantileSelect(copy, idx, 0, copy.length - 1);
  return quantileSorted(copy, p);
}

export function quantileArray(x: number[], p: number[]) {
  const copy = x.slice();

  if (Array.isArray(p)) {
    // rearrange elements so that each element corresponding to a requested
    // quantile is on a place it would be if the array was fully sorted
    multiQuantileSelect(copy, p);
    // Initialize the result array
    const results = [];
    // For each requested quantile
    for (let i = 0; i < p.length; i++) {
      results[i] = quantileSorted(copy, p[i]);
    }
    return results;
  } else {
    const idx = quantileIndex(copy.length, p);
    quantileSelect(copy, idx, 0, copy.length - 1);
    return quantileSorted(copy, p);
  }
}

function quantileSelect(arr: number[], k: number, left: number, right: number) {
  if (k % 1 === 0) {
    quickselect(arr, k, left, right);
  } else {
    k = Math.floor(k);
    quickselect(arr, k, left, right);
    quickselect(arr, k + 1, k + 1, right);
  }
}

function multiQuantileSelect(arr: number[], p: number[]) {
  const indices = [0];
  for (let i = 0; i < p.length; i++) {
    indices.push(quantileIndex(arr.length, p[i]));
  }
  indices.push(arr.length - 1);
  indices.sort(compare);

  const stack = [0, indices.length - 1];

  while (stack.length) {
    const s1 = stack.pop();
    const s2 = stack.pop();
    const r = Math.ceil(s1!);
    const l = Math.floor(s2!);
    if (r - l <= 1) continue;

    const m = Math.floor((l + r) / 2);
    quantileSelect(arr, indices[m], Math.floor(indices[l]), Math.ceil(indices[r]));

    stack.push(l, m, m, r);
  }
}

function compare(a: number, b: number) {
  return a - b;
}

function quantileIndex(len: number, p: number) {
  const idx = len * p;
  if (p === 1) {
    // If p is 1, directly return the last index
    return len - 1;
  } else if (p === 0) {
    // If p is 0, directly return the first index
    return 0;
  } else if (idx % 1 !== 0) {
    // If index is not integer, return the next index in array
    return Math.ceil(idx) - 1;
  } else if (len % 2 === 0) {
    // If the list has even-length, we'll return the middle of two indices
    // around quantile to indicate that we need an average value of the two
    return idx - 0.5;
  } else {
    // Finally, in the simple case of an integer index
    // with an odd-length list, return the index
    return idx;
  }
}

export function getCol(matrix: any[], col: number) {
  const column = [];

  for (let i = 0; i < matrix.length; i++) {
    column.push(matrix[i][col]);
  }

  return column;
}
