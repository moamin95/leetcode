/**
 * @param {number[]} prices
 * @return {number}
 */
var maxProfit = function (prices) {
  let maxProf = 0;
  let buy = 0;
  let sell = buy + 1;

  while (sell < prices.length) {
    if (prices[sell] > prices[buy]) {
      let sum = prices[sell] - prices[buy];
      maxProf = Math.max(maxProf, sum);
    } else {
      buy = sell;
    }

    sell++;
  }

  return maxProf;
};
