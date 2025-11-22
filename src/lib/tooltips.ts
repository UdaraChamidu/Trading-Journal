export const ictTooltips: Record<string, string> = {
  CHOCH: 'Change of Character - A shift in market behavior indicating a potential trend change or confirmation.',
  POI: 'Point of Interest - Key price levels where significant market activity has occurred (Order Blocks, FVGs, Liquidity).',
  'Order Block': 'A supply or demand zone where price rejection occurred, indicating institutional buying/selling activity.',
  FVG: 'Fair Value Gap - An imbalance in price action between two candles that the market tends to fill.',
  'Liquidity Pool': 'Clusters of stop losses or limit orders where price is likely to move to collect liquidity.',
  '4H Analysis': 'Analyzing the 4-hour chart to determine the overall trend and identify major points of interest.',
  '15m Confirmation': 'Using the 15-minute chart to confirm the analysis from the 4H and look for confirmation of CHoCH.',
  '1m Entry': 'Using the 1-minute chart for precise entry execution and timing of the trade setup.',
  'Risk %': 'The percentage of your account balance you are risking on this trade.',
  'Risk Reward': 'The ratio between what you stand to win vs what you stand to lose. Higher is better.',
  'Fib 0.618': 'A Fibonacci retracement level at 61.8% - a strong support/resistance area.',
  'Fib 0.786': 'A Fibonacci retracement level at 78.6% - an even stronger support/resistance area.',
  'OB+FVG': 'Entry occurring at the overlap of both an Order Block and a Fair Value Gap.',
  'FVG+Fib': 'Entry occurring at the overlap of a Fair Value Gap and a Fibonacci level.',
  'Golden Pocket': 'The area where both 0.618 and 0.786 Fibonacci levels converge.',
  'Break Even': 'Moving stop loss to entry price after profit has been secured, typically at 1:5 risk reward.',
  'Profit Factor': 'Total winning amount divided by total losing amount. Values above 1.5 are considered strong.',
  'Plan Adherence': 'How well you followed your trading plan. Directly correlates with long-term profitability.',
};

export const tooltipCategories = {
  analysis: ['CHOCH', 'POI', 'Order Block', 'FVG', 'Liquidity Pool', '4H Analysis', '15m Confirmation', '1m Entry'],
  risk: ['Risk %', 'Risk Reward', 'Break Even', 'Profit Factor'],
  entry: ['Fib 0.618', 'Fib 0.786', 'OB+FVG', 'FVG+Fib', 'Golden Pocket'],
  psychology: ['Plan Adherence'],
};
