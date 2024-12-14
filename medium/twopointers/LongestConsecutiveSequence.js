class Solution {
  /**
   * @param {number[]} nums
   * @return {number}
   */
  longestConsecutive(nums) {
    const nSet = new Set(nums);
    let longest = 0;

    for (let i = 0; i < nums.length; i++) {
      if (nSet.has(nums[i] - 1)) continue;

      let length = 1; //2, 3
      while (nSet.has(nums[i] + length)) {
        length++;
      }

      longest = Math.max(longest, length);
    }

    return longest;
  }
}
