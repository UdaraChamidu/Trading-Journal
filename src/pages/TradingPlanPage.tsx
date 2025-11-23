import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, Target, TrendingUp, AlertTriangle, CheckCircle, BookOpen } from 'lucide-react';

export const TradingPlanPage: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true,
    methodology: true,
    management: true,
    schedule: true,
    checklist: true,
    psychology: true,
    improvement: true,
    warnings: false,
    metrics: false,
    notes: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">BTC ICT Trading Plan</h1>
        <p className="text-gray-400 text-lg">Practice Phase - Smart Money Concepts</p>
        <div className="mt-4 text-sm text-gray-500">
          Plan Version: 1.0 | Created: 21 November 2025 | Owner: Udara Chamidu | Review: Monthly
        </div>
      </div>

      {/* Account Overview */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl">
        <button
          onClick={() => toggleSection('overview')}
          className="w-full flex items-center justify-between p-6 hover:bg-slate-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">📊 Account Overview</h2>
          </div>
          {expandedSections.overview ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {expandedSections.overview && (
          <div className="border-t border-slate-700 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-700 p-4 rounded-lg">
                <div className="text-sm text-gray-400">Starting Capital</div>
                <div className="text-2xl font-bold text-green-400">$100</div>
              </div>
              <div className="bg-slate-700 p-4 rounded-lg">
                <div className="text-sm text-gray-400">Risk Per Trade</div>
                <div className="text-2xl font-bold text-yellow-400">1-2%</div>
              </div>
              <div className="bg-slate-700 p-4 rounded-lg">
                <div className="text-sm text-gray-400">Status</div>
                <div className="text-lg font-semibold text-blue-400">Practice/Learning Phase</div>
              </div>
              <div className="bg-slate-700 p-4 rounded-lg">
                <div className="text-sm text-gray-400">Primary Asset</div>
                <div className="text-lg font-semibold text-white">BTC/USD</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm text-gray-400">Trading Style</div>
              <div className="text-lg font-semibold text-purple-400">Multi-timeframe ICT (Smart Money Concepts)</div>
            </div>
          </div>
        )}
      </div>

      {/* Trading Methodology */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl">
        <button
          onClick={() => toggleSection('methodology')}
          className="w-full flex items-center justify-between p-6 hover:bg-slate-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-green-400" />
            <h2 className="text-xl font-bold text-white">🎯 Trading Methodology</h2>
          </div>
          {expandedSections.methodology ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {expandedSections.methodology && (
          <div className="border-t border-slate-700 p-6 space-y-6">
            {/* Phase 1 */}
            <div className="bg-slate-700 p-4 rounded-lg">
              <h3 className="text-lg font-bold text-white mb-3">Phase 1: 4H Analysis (Bias & Direction)</h3>
              <p className="text-gray-300 mb-3"><strong>Objective:</strong> Identify main trend and institutional levels</p>
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-400">1. Trend Identification</h4>
                <ul className="list-disc list-inside text-gray-300 ml-4 space-y-1">
                  <li>Follow 4H market structure (Higher Highs/Higher Lows OR Lower Highs/Lower Lows)</li>
                  <li>Direction = Trend direction on 4H</li>
                </ul>
              </div>
              <div className="space-y-2 mt-4">
                <h4 className="font-semibold text-blue-400">2. Mark Key Levels</h4>
                <ul className="list-disc list-inside text-gray-300 ml-4 space-y-1">
                  <li>Order Blocks (OBs): Last bullish/bearish candle before strong move</li>
                  <li>Fair Value Gaps (FVGs): 3-candle imbalance zones</li>
                  <li>Liquidity pools: Equal highs/lows, round numbers</li>
                </ul>
              </div>
              <div className="space-y-2 mt-4">
                <h4 className="font-semibold text-blue-400">3. Decision Point</h4>
                <ul className="list-disc list-inside text-gray-300 ml-4 space-y-1">
                  <li>Wait for price to reach 4H POI (OB or FVG)</li>
                  <li>THEN move to 15min timeframe</li>
                </ul>
              </div>
            </div>

            {/* Phase 2 */}
            <div className="bg-slate-700 p-4 rounded-lg">
              <h3 className="text-lg font-bold text-white mb-3">Phase 2: 15min Confirmation (Entry Setup)</h3>
              <p className="text-gray-300 mb-3"><strong>Objective:</strong> Confirm reversal at 4H POI</p>
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-400">1. Wait for CHoCH (Change of Character)</h4>
                <ul className="list-disc list-inside text-gray-300 ml-4 space-y-1">
                  <li>Bullish CHoCH: Break of previous lower high (in downtrend)</li>
                  <li>Bearish CHoCH: Break of previous higher low (in uptrend)</li>
                  <li>This confirms institutional interest at the 4H POI</li>
                </ul>
              </div>
              <div className="space-y-2 mt-4">
                <h4 className="font-semibold text-blue-400">2. Mark 15min Levels</h4>
                <ul className="list-disc list-inside text-gray-300 ml-4 space-y-1">
                  <li>Identify new OBs after CHoCH</li>
                  <li>Mark FVGs created during the CHoCH move</li>
                  <li>Note: These become your 15min POIs</li>
                </ul>
              </div>
              <div className="space-y-2 mt-4">
                <h4 className="font-semibold text-blue-400">3. Decision Point</h4>
                <ul className="list-disc list-inside text-gray-300 ml-4 space-y-1">
                  <li>Wait for price to retrace to 15min POI</li>
                  <li>THEN move to 1min timeframe</li>
                </ul>
              </div>
            </div>

            {/* Phase 3 */}
            <div className="bg-slate-700 p-4 rounded-lg">
              <h3 className="text-lg font-bold text-white mb-3">Phase 3: 1min Execution (Precise Entry)</h3>
              <p className="text-gray-300 mb-3"><strong>Objective:</strong> Execute trade with optimal entry</p>
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-400">1. Wait for 1min CHoCH</h4>
                <ul className="list-disc list-inside text-gray-300 ml-4 space-y-1">
                  <li>Confirms strength at 15min POI</li>
                  <li>Shows short-term momentum shift</li>
                </ul>
              </div>
              <div className="space-y-2 mt-4">
                <h4 className="font-semibold text-blue-400">2. Identify 1min POIs</h4>
                <ul className="list-disc list-inside text-gray-300 ml-4 space-y-1">
                  <li>Order Blocks in 1min</li>
                  <li>Fair Value Gaps in 1min</li>
                  <li>Fibonacci levels (0.618, 0.786 golden ratios)</li>
                </ul>
              </div>
              <div className="space-y-2 mt-4">
                <h4 className="font-semibold text-blue-400">3. Entry Execution</h4>
                <ul className="list-disc list-inside text-gray-300 ml-4 space-y-1">
                  <li>If it can identify a single POI clearly, use it to enter.</li>
                  <li>If there are many POIs (FVG + OB), Enter when price touches Golden Pocket.</li>
                  <li>No additional confirmation needed (direct entry)</li>
                  <li>Multiple entries allowed across different 1min POIs (Because of 1 min most of the time trades can be lost)</li>
                  <li>If one trade loss then wait for another BOS or CHOCH in 15 min.</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Position Management */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl">
        <button
          onClick={() => toggleSection('management')}
          className="w-full flex items-center justify-between p-6 hover:bg-slate-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">🎲 Position Management</h2>
          </div>
          {expandedSections.management ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {expandedSections.management && (
          <div className="border-t border-slate-700 p-6 space-y-6">
            <div className="bg-slate-700 p-4 rounded-lg">
              <h3 className="text-lg font-bold text-white mb-3">Entry Rules</h3>
              <ul className="list-disc list-inside text-gray-300 space-y-1">
                <li><strong>Multiple Positions:</strong> Yes, across different 1min POIs (OB, FVG, Fib levels)</li>
                <li><strong>Entry Type:</strong> Market/Limit order at exact Golden Pocket/POI touch</li>
                <li><strong>Position Sizing:</strong> Calculate based on stop loss distance</li>
              </ul>
            </div>

            <div className="bg-slate-700 p-4 rounded-lg">
              <h3 className="text-lg font-bold text-white mb-3">Special Entries</h3>
              <ul className="list-disc list-inside text-gray-300 space-y-1">
                <li>After BOS when 15 CHOCH has confirmed.</li>
                <li>Mark 15 min POIs (FVGs and OBs)</li>
                <li>After price reaches it, go to 1 min and do the same thing.</li>
                <li>TP: 15 min liquidity area. Not 4H target.</li>
              </ul>
            </div>

            <div className="bg-slate-700 p-4 rounded-lg">
              <h3 className="text-lg font-bold text-white mb-3">Position Size Formula</h3>
              <div className="bg-slate-600 p-3 rounded font-mono text-green-400">
                Position Size = (Account × Risk%) / Stop Loss Distance in $
              </div>
            </div>

            <div className="bg-slate-700 p-4 rounded-lg">
              <h3 className="text-lg font-bold text-white mb-3">Stop Loss Placement</h3>
              <ul className="list-disc list-inside text-gray-300 space-y-1">
                <li><strong>Primary Rule:</strong> Upper/lower boundary of 1min swing.</li>
                <li><strong>Alternative Rule:</strong> Nearest 1min swing high/low (if market is choppy)</li>
              </ul>
              <div className="mt-3 p-3 bg-yellow-900 border border-yellow-700 rounded">
                <p className="text-yellow-200 text-sm">⚠️ <strong>Important:</strong> Adjust position size if using wider SL</p>
              </div>
            </div>

            <div className="bg-slate-700 p-4 rounded-lg">
              <h3 className="text-lg font-bold text-white mb-3">Take Profit Strategy</h3>
              <ul className="list-disc list-inside text-gray-300 space-y-1">
                <li><strong>Primary Target:</strong> Opposite 4H POI or major liquidity level. Based on the power of POI and trend direction.</li>
              </ul>
              <h4 className="font-semibold text-blue-400 mt-3">Secondary Adjustments:</h4>
              <ul className="list-disc list-inside text-gray-300 ml-4 space-y-1">
                <li>If 15min shows new resistance/support → Consider partial TP</li>
                <li>If momentum weakens → Trail stop or manual exit</li>
                <li>Watch for 15min CHoCH against your position</li>
              </ul>
              <h4 className="font-semibold text-green-400 mt-3">Break-Even Rule:</h4>
              <ul className="list-disc list-inside text-gray-300 ml-4 space-y-1">
                <li>At 1:5 R:R → Move stop loss to entry on 50% of position</li>
                <li>Let remaining 50% run to full 4H target</li>
              </ul>
            </div>

            <div className="bg-slate-700 p-4 rounded-lg">
              <h3 className="text-lg font-bold text-white mb-3">Risk-Reward Expectations</h3>
              <ul className="list-disc list-inside text-gray-300 space-y-1">
                <li><strong>Target R:R:</strong> 1:25+ (based on 4H targets)</li>
                <li><strong>Expected Win Rate:</strong> 30-40% (acceptable with high R:R)</li>
                <li><strong>Implication:</strong> Expect 6-7 losses for every 3-4 wins</li>
                <li><strong>Psychology:</strong> Losses are normal and expected with this strategy</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Trading Schedule */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl">
        <button
          onClick={() => toggleSection('schedule')}
          className="w-full flex items-center justify-between p-6 hover:bg-slate-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-orange-400" />
            <h2 className="text-xl font-bold text-white">⏰ Trading Schedule (Sri Lanka GMT +5:30)</h2>
          </div>
          {expandedSections.schedule ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {expandedSections.schedule && (
          <div className="border-t border-slate-700 p-6">
            <div className="bg-green-900 border border-green-700 rounded-lg p-4 mb-6">
              <h3 className="text-green-200 font-bold text-lg mb-2">Optimal Trading Hours: 8:00 PM - 7:00 AM</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full bg-slate-700 rounded-lg overflow-hidden">
                <thead className="bg-slate-600">
                  <tr>
                    <th className="px-4 py-3 text-left text-white font-semibold">Time (LK)</th>
                    <th className="px-4 py-3 text-left text-white font-semibold">Session</th>
                    <th className="px-4 py-3 text-left text-white font-semibold">Characteristics</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-slate-600">
                    <td className="px-4 py-3 text-gray-300">8:00 PM - 12:00 AM</td>
                    <td className="px-4 py-3 text-gray-300">London Close / NY Session</td>
                    <td className="px-4 py-3 text-gray-300">High volatility, strong trends</td>
                  </tr>
                  <tr className="border-t border-slate-600">
                    <td className="px-4 py-3 text-gray-300">12:00 AM - 4:00 AM</td>
                    <td className="px-4 py-3 text-gray-300">NY Session</td>
                    <td className="px-4 py-3 text-gray-300">Good momentum, liquidity</td>
                  </tr>
                  <tr className="border-t border-slate-600">
                    <td className="px-4 py-3 text-gray-300">4:00 AM - 7:00 AM</td>
                    <td className="px-4 py-3 text-gray-300">Asian Session Start</td>
                    <td className="px-4 py-3 text-gray-300">Lower volatility, range-bound</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 bg-blue-900 border border-blue-700 rounded-lg p-4">
              <h4 className="text-blue-200 font-bold mb-2">Best Hours for Your Strategy:</h4>
              <p className="text-blue-100"><strong>8:00 PM - 2:00 AM</strong> (Highest probability setups)</p>
              <ul className="list-disc list-inside text-blue-100 mt-2 ml-4">
                <li>Strong institutional activity</li>
                <li>Clear trend moves</li>
              </ul>
            </div>

            <div className="mt-4 bg-yellow-900 border border-yellow-700 rounded-lg p-4">
              <h4 className="text-yellow-200 font-bold mb-2">News Considerations</h4>
              <ul className="list-disc list-inside text-yellow-100 ml-4">
                <li><strong>Monitor major news:</strong> Fed announcements, CPI, NFP, unemployment</li>
                <li><strong>During high-impact news:</strong></li>
              </ul>
              <ul className="list-disc list-inside text-yellow-100 ml-8 mt-1">
                <li>Wider stops OR</li>
                <li>Stay out 15min before/after OR</li>
                <li>Reduce position size by 50%</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Pre-trade Checklist */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl">
        <button
          onClick={() => toggleSection('checklist')}
          className="w-full flex items-center justify-between p-6 hover:bg-slate-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <h2 className="text-xl font-bold text-white">📋 Pre-Trade Checklist</h2>
          </div>
          {expandedSections.checklist ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {expandedSections.checklist && (
          <div className="border-t border-slate-700 p-6 space-y-4">
            <div className="bg-slate-700 p-4 rounded-lg">
              <h3 className="font-bold text-white mb-3">Before Opening Platform:</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-gray-300">Am I well-rested and focused?</span>
                </li>
                <li className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-gray-300">Have I reviewed yesterday's trades?</span>
                </li>
                <li className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-gray-300">Am I emotionally neutral (no revenge trading)?</span>
                </li>
                <li className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-gray-300">Is it within my trading hours (8 PM - 7 AM)?</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-700 p-4 rounded-lg">
              <h3 className="font-bold text-white mb-3">4H Analysis Checklist:</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-gray-300">Clear trend identified?</span>
                </li>
                <li className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-gray-300">4H OBs and FVGs marked?</span>
                </li>
                <li className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-gray-300">Price approaching 4H POI?</span>
                </li>
                <li className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-gray-300">News events checked for next 4 hours?</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-700 p-4 rounded-lg">
              <h3 className="font-bold text-white mb-3">15min Confirmation Checklist:</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-gray-300">CHoCH occurred on 15min?</span>
                </li>
                <li className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-gray-300">15min OBs and FVGs marked?</span>
                </li>
                <li className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-gray-300">Price retracing to 15min POI?</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-700 p-4 rounded-lg">
              <h3 className="font-bold text-white mb-3">1min Entry Checklist:</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-gray-300">1min CHoCH confirmed?</span>
                </li>
                <li className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-gray-300">1min POIs identified (OB/FVG/Fib)?</span>
                </li>
                <li className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-gray-300">Stop loss level determined?</span>
                </li>
                <li className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-gray-300">Position size calculated?</span>
                </li>
                <li className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-gray-300">4H target level marked?</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Psychology & Discipline */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl">
        <button
          onClick={() => toggleSection('psychology')}
          className="w-full flex items-center justify-between p-6 hover:bg-slate-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <h2 className="text-xl font-bold text-white">🧠 Psychology & Discipline</h2>
          </div>
          {expandedSections.psychology ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {expandedSections.psychology && (
          <div className="border-t border-slate-700 p-6 space-y-4">
            <div className="bg-slate-700 p-4 rounded-lg">
              <h3 className="font-bold text-white mb-3">Mental Rules:</h3>
              <ol className="list-decimal list-inside text-gray-300 space-y-1 ml-4">
                <li><strong>Accept losses as business costs</strong> - With 1:25 R:R, 60-70% loss rate is normal</li>
                <li><strong>Trust the process</strong> - Don't abandon strategy after 3-4 losses</li>
                <li><strong>One setup at a time</strong> - Don't force trades outside your system</li>
                <li><strong>Journal everything</strong> - Your data is your teacher</li>
              </ol>
            </div>

            <div className="bg-red-900 border border-red-700 rounded-lg p-4">
              <h3 className="font-bold text-red-200 mb-3">Red Flags (Stop Trading):</h3>
              <ul className="list-disc list-inside text-red-100 space-y-1 ml-4">
                <li>3 consecutive losses in one session → Stop for the day</li>
                <li>Feeling emotional (angry, desperate) → Close platform</li>
                <li>Deviating from plan → Review plan, don't trade</li>
                <li>Account down 10% in a week → Review entire strategy</li>
              </ul>
            </div>

            <div className="bg-green-900 border border-green-700 rounded-lg p-4">
              <h3 className="font-bold text-green-200 mb-3">Green Flags (Keep Trading):</h3>
              <ul className="list-disc list-inside text-green-100 space-y-1 ml-4">
                <li>Following plan exactly, regardless of outcome</li>
                <li>Losing trades that were "perfect setups"</li>
                <li>Patient waiting for all confirmations</li>
                <li>Proper position sizing every time</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Continuous Improvement */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl">
        <button
          onClick={() => toggleSection('improvement')}
          className="w-full flex items-center justify-between p-6 hover:bg-slate-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">📈 Continuous Improvement</h2>
          </div>
          {expandedSections.improvement ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {expandedSections.improvement && (
          <div className="border-t border-slate-700 p-6 space-y-4">
            <div className="bg-slate-700 p-4 rounded-lg">
              <h3 className="font-bold text-white mb-3">Weekly Review (Every Sunday):</h3>
              <ol className="list-decimal list-inside text-gray-300 space-y-1 ml-4">
                <li>Review all trades in journal</li>
                <li>Calculate: Win rate, Average R:R, Profit Factor</li>
                <li>Identify pattern: Which timeframe had errors?</li>
                <li>Update plan if consistent issue found</li>
              </ol>
            </div>

            <div className="bg-slate-700 p-4 rounded-lg">
              <h3 className="font-bold text-white mb-3">Monthly Review:</h3>
              <ol className="list-decimal list-inside text-gray-300 space-y-1 ml-4">
                <li>Are you profitable? If not, why?</li>
                <li>Is win rate within expected range (30-40%)?</li>
                <li>Are losses controlled (max 1-2% per trade)?</li>
                <li>Psychology check: Are you following plan?</li>
              </ol>
            </div>

            <div className="bg-slate-700 p-4 rounded-lg">
              <h3 className="font-bold text-white mb-3">What to Track:</h3>
              <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                <li>Best performing 1min POI type (OB vs FVG vs Fib)</li>
                <li>Best trading hours</li>
                <li>Impact of news trading</li>
                <li>Emotional state vs outcome</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Risk Warnings */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl">
        <button
          onClick={() => toggleSection('warnings')}
          className="w-full flex items-center justify-between p-6 hover:bg-slate-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <h2 className="text-xl font-bold text-white">⚠️ Risk Warnings</h2>
          </div>
          {expandedSections.warnings ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {expandedSections.warnings && (
          <div className="border-t border-slate-700 p-6 space-y-4">
            <div className="bg-red-900 border border-red-700 rounded-lg p-4">
              <ol className="list-decimal list-inside text-red-100 space-y-2">
                <li><strong>Small Account Reality:</strong> $100 account limits position sizes significantly. With $1-2 risk, some trades may be too small for minimum lot sizes.</li>
                <li><strong>High R:R = Low Win Rate:</strong> Be prepared for strings of 5-10 losses. This is mathematically normal.</li>
                <li><strong>Multiple Entries Risk:</strong> If 4H POI fails completely, all 1min entries will likely fail. Don't risk more than 2% total across all entries in same zone.</li>
                <li><strong>Overtrading Danger:</strong> With multiple entries allowed, track total daily risk. Don't exceed 6% total risk per day.</li>
              </ol>
            </div>
          </div>
        )}
      </div>

      {/* Success Metrics */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl">
        <button
          onClick={() => toggleSection('metrics')}
          className="w-full flex items-center justify-between p-6 hover:bg-slate-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-green-400" />
            <h2 className="text-xl font-bold text-white">🎯 Success Metrics (Next 3 Months)</h2>
          </div>
          {expandedSections.metrics ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {expandedSections.metrics && (
          <div className="border-t border-slate-700 p-6 space-y-4">
            <div className="bg-blue-900 border border-blue-700 rounded-lg p-4">
              <h3 className="font-bold text-blue-200 mb-3">Process Goals (More Important):</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-blue-100">90%+ trade plan adherence</span>
                </li>
                <li className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-blue-100">Journal filled for every trade</span>
                </li>
                <li className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-blue-100">Zero emotional revenge trades</span>
                </li>
                <li className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-blue-100">Weekly reviews completed</span>
                </li>
              </ul>
            </div>

            <div className="bg-green-900 border border-green-700 rounded-lg p-4">
              <h3 className="font-bold text-green-200 mb-3">Outcome Goals:</h3>
              <ul className="list-disc list-inside text-green-100 space-y-1 ml-4">
                <li><strong>Win rate:</strong> 30-40%</li>
                <li><strong>Average R:R:</strong> 1:15+ (realistic for this strategy)</li>
                <li><strong>Profit Factor:</strong> {'>'}2.0</li>
                <li><strong>Account growth:</strong> 10-20% over 3 months</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Final Notes */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl">
        <button
          onClick={() => toggleSection('notes')}
          className="w-full flex items-center justify-between p-6 hover:bg-slate-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">📝 Final Notes</h2>
          </div>
          {expandedSections.notes ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {expandedSections.notes && (
          <div className="border-t border-slate-700 p-6">
            <div className="bg-gradient-to-r from-blue-900 to-purple-900 border border-blue-700 rounded-lg p-6">
              <p className="text-blue-100 mb-4">
                <strong>Remember:</strong> This is a practice phase. Your primary goal is not profit but mastery of:
              </p>
              <ol className="list-decimal list-inside text-blue-100 space-y-1 ml-4 mb-4">
                <li>Identifying ICT concepts across timeframes</li>
                <li>Patience in waiting for full confirmations</li>
                <li>Emotional control during losing streaks</li>
                <li>Data collection and analysis</li>
              </ol>

              <p className="text-blue-100 mb-4">
                <strong>Your edge is:</strong>
              </p>
              <ul className="list-disc list-inside text-blue-100 space-y-1 ml-4 mb-4">
                <li>Multi-timeframe confluence</li>
                <li>High R:R setups</li>
                <li>Proper risk management</li>
                <li>Consistent execution</li>
              </ul>

              <p className="text-blue-100 font-bold text-center text-lg">
                Stay disciplined. Trust your data. One trade at a time.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


export default TradingPlanPage;
