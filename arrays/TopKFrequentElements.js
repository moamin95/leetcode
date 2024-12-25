class Solution {
  /**
   * @param {number[]} nums
   * @param {number} k
   * @return {number[]}
   */
  topKFrequent(nums, k) {
    const nMap = {};

    for (const num of nums) {
      nMap[num] = (nMap[num] || 0) + 1;
    }

    const frequency = Array(nums.length + 1)
      .fill()
      .map(() => []);

    for (let [key, value] of Object.entries(nMap)) {
      frequency[value].push(key);
    }

    const res = [];

    for (let i = frequency.length - 1; i >= 0; i--) {
      let bucket = frequency[i];

      for (let j = 0; j < bucket.length; j++) {
        res.push(bucket[j]);

        if (res.length === k) {
          return res;
        }
      }
    }
  }
}
