import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const CalculatorPage: React.FC = () => {
  const { userProfile } = useAuth();
  
  const [balance, setBalance] = useState<number>(10000);
  const [riskPercent, setRiskPercent] = useState<number>(1);
  const [entryPrice, setEntryPrice] = useState<number>(0);
  const [stopLoss, setStopLoss] = useState<number>(0);
  const [direction, setDirection] = useState<'long' | 'short'>('long');
  
  // Results
  const [positionSize, setPositionSize] = useState<number>(0);
  const [positionValue, setPositionValue] = useState<number>(0);
  const [riskAmount, setRiskAmount] = useState<number>(0);
  const [leverage, setLeverage] = useState<number>(1);
  
  useEffect(() => {
    if (userProfile?.account_balance) {
      setBalance(userProfile.account_balance);
    }
  }, [userProfile]);

  useEffect(() => {
    calculateSize();
  }, [balance, riskPercent, entryPrice, stopLoss, direction]);

  const calculateSize = () => {
    if (!entryPrice || !stopLoss) {
      setPositionSize(0);
      setPositionValue(0);
      setRiskAmount(0);
      return;
    }

    const riskAmt = balance * (riskPercent / 100);
    setRiskAmount(riskAmt);

    let priceDiff = 0;
    if (direction === 'long') {
      priceDiff = entryPrice - stopLoss;
    } else {
      priceDiff = stopLoss - entryPrice;
    }

    if (priceDiff <= 0) {
      // Invalid SL for direction
      setPositionSize(0);
      setPositionValue(0);
      return;
    }

    // Risk Amount = Position Size * Price Diff
    // Position Size = Risk Amount / Price Diff
    const size = riskAmt / priceDiff;
    setPositionSize(size);
    
    const value = size * entryPrice;
    setPositionValue(value);
    
    // Simple leverage calc (Position Value / Balance)
    setLeverage(value / balance);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3 rounded-full mb-4 shadow-lg shadow-blue-500/25">
          <Calculator className="w-6 h-6 text-white" />
          <h1 className="text-2xl font-bold text-white">Position Size Calculator</h1>
        </div>
        <p className="text-gray-400 text-lg">Calculate exact position sizes to manage risk effectively</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-400" />
            Trade Parameters
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Account Balance</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={balance}
                  onChange={(e) => setBalance(parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Risk Percentage</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                <input
                  type="number"
                  step="0.1"
                  value={riskPercent}
                  onChange={(e) => setRiskPercent(parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setDirection('long')}
                className={`py-3 rounded-lg font-bold transition-all ${
                  direction === 'long'
                    ? 'bg-green-600 text-white shadow-lg shadow-green-500/20'
                    : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
                }`}
              >
                Long 📈
              </button>
              <button
                onClick={() => setDirection('short')}
                className={`py-3 rounded-lg font-bold transition-all ${
                  direction === 'short'
                    ? 'bg-red-600 text-white shadow-lg shadow-red-500/20'
                    : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
                }`}
              >
                Short 📉
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Entry Price</label>
              <input
                type="number"
                step="any"
                value={entryPrice}
                onChange={(e) => setEntryPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Stop Loss</label>
              <input
                type="number"
                step="any"
                value={stopLoss}
                onChange={(e) => setStopLoss(parseFloat(e.target.value) || 0)}
                className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white focus:outline-none ${
                  (direction === 'long' && stopLoss >= entryPrice && entryPrice > 0) ||
                  (direction === 'short' && stopLoss <= entryPrice && entryPrice > 0)
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-slate-600 focus:border-blue-500'
                }`}
                placeholder="0.00"
              />
              {((direction === 'long' && stopLoss >= entryPrice && entryPrice > 0) ||
                (direction === 'short' && stopLoss <= entryPrice && entryPrice > 0)) && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Invalid Stop Loss for {direction} position
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-900 to-purple-900 border border-indigo-700 rounded-lg p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-indigo-400" />
              Calculation Results
            </h2>

            <div className="space-y-6">
              <div className="bg-indigo-950/50 p-4 rounded-lg border border-indigo-800">
                <div className="text-indigo-300 text-sm mb-1">Position Size (Units)</div>
                <div className="text-3xl font-bold text-white font-mono">
                  {positionSize > 0 ? positionSize.toFixed(4) : '0.0000'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-indigo-950/50 p-4 rounded-lg border border-indigo-800">
                  <div className="text-indigo-300 text-sm mb-1">Position Value</div>
                  <div className="text-xl font-bold text-white font-mono">
                    ${positionValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="bg-indigo-950/50 p-4 rounded-lg border border-indigo-800">
                  <div className="text-indigo-300 text-sm mb-1">Risk Amount</div>
                  <div className="text-xl font-bold text-red-400 font-mono">
                    ${riskAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              <div className="bg-indigo-950/50 p-4 rounded-lg border border-indigo-800 flex justify-between items-center">
                <div>
                  <div className="text-indigo-300 text-sm">Effective Leverage</div>
                  <div className="text-xs text-indigo-400">Based on account balance</div>
                </div>
                <div className={`text-2xl font-bold font-mono ${leverage > 10 ? 'text-red-400' : 'text-green-400'}`}>
                  {leverage.toFixed(1)}x
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-white font-bold mb-2">Risk Management Tip</h3>
            <p className="text-gray-400 text-sm">
              Professional traders typically risk 1-2% of their account balance per trade. 
              {leverage > 5 && <span className="text-yellow-400 block mt-2">⚠️ Your effective leverage is high ({leverage.toFixed(1)}x). Be careful!</span>}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculatorPage;
