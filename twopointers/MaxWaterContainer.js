class Solution {
  /**
   * @param {number[]} heights
   * @return {number}
   */
  maxArea(heights) {
    let maxArea = 0;

    let left = 0;
    let right = heights.length - 1;

    while (left < right) {
      let calcHeight = Math.min(heights[right], heights[left]);
      let length = right - left;

      let curArea = calcHeight * length;

      maxArea = Math.max(maxArea, curArea);

      if (heights[left] <= heights[right]) {
        left++;
      } else {
        right--;
      }
    }

    return maxArea;
  }
}
