export const calculateRiskDollar = (balance: number, riskPercent: number): number => {
  return balance * (riskPercent / 100);
};

export const calculatePositionSize = (riskDollar: number, entry: number, stopLoss: number): number => {
  const riskPerUnit = Math.abs(entry - stopLoss);
  if (riskPerUnit === 0) return 0;
  return riskDollar / riskPerUnit;
};

export const calculateRiskRewardRatio = (entry: number, takeProfit: number | undefined, stopLoss: number): number | undefined => {
  if (!takeProfit) return undefined;
  const risk = Math.abs(entry - stopLoss);
  const reward = Math.abs(takeProfit - entry);
  if (risk === 0) return undefined;
  return parseFloat((reward / risk).toFixed(3));
};

export const calculatePnL = (entry: number, exit: number, positionSize: number, direction: 'Long' | 'Short'): { plDollar: number; plPercent: number } => {
  let priceDifference = exit - entry;
  if (direction === 'Short') {
    priceDifference = entry - exit;
  }
  const plDollar = priceDifference * positionSize;
  const plPercent = parseFloat(((plDollar / Math.abs(entry * positionSize)) * 100).toFixed(2));
  return { plDollar: parseFloat(plDollar.toFixed(2)), plPercent };
};

export const determineTradeResult = (plDollar: number): 'Win' | 'Loss' | 'Break Even' => {
  if (plDollar > 0) return 'Win';
  if (plDollar < 0) return 'Loss';
  return 'Break Even';
};

export const calculateWinRate = (wins: number, totalTrades: number): number => {
  if (totalTrades === 0) return 0;
  return parseFloat(((wins / totalTrades) * 100).toFixed(2));
};

export const calculateProfitFactor = (totalWins: number, totalLosses: number): number => {
  if (totalLosses === 0) return totalWins > 0 ? 999.99 : 0;
  return parseFloat((totalWins / Math.abs(totalLosses)).toFixed(3));
};

export const formatDuration = (startTime: string, endTime: string): string => {
  const start = new Date(`2000-01-01 ${startTime}`);
  const end = new Date(`2000-01-01 ${endTime}`);

  let diff = end.getTime() - start.getTime();
  if (diff < 0) {
    diff = start.getTime() - end.getTime();
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export const getSessionFromTime = (time: string): 'London Close' | 'NY Session' | 'Asian Session' => {
  const [hour] = time.split(':').map(Number);

  if (hour >= 20 && hour < 22) return 'London Close';
  if (hour >= 22 || hour < 2) return 'NY Session';
  return 'Asian Session';
};

export const getDayOfWeek = (date: string): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const d = new Date(date);
  return days[d.getUTCDay()];
};
