import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Clock, Target, TrendingUp, AlertTriangle, CheckCircle, BookOpen, Edit3, Save, X, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export const TradingPlanPage: React.FC = () => {
  const { session } = useAuth();
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
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sharedPlans, setSharedPlans] = useState<any[]>([]);
  const [personalPlans, setPersonalPlans] = useState<any[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const allPlans = [...sharedPlans, ...personalPlans];
  const [plan, setPlan] = useState<any>({
    plan_title: 'My Trading Plan',
    plan_version: '1.0',
    plan_status: 'Active',
    starting_capital: 10000,
    risk_per_trade: '1-2%',
    primary_asset: 'BTC/USD',
    trading_style: 'Multi-timeframe Analysis',
    h4_analysis: '',
    m15_confirmation: '',
    m1_execution: '',
    entry_rules: '',
    special_entries: '',
    position_size_formula: '',
    stop_loss_placement: '',
    take_profit_strategy: '',
    risk_reward_expectations: '',
    trading_schedule: '',
    optimal_hours: '',
    news_considerations: '',
    pre_trade_checklist: '',
    h4_checklist: '',
    m15_checklist: '',
    m1_checklist: '',
    mental_rules: '',
    red_flags: '',
    green_flags: '',
    weekly_review: '',
    monthly_review: '',
    tracking_items: '',
    risk_warnings: '',
    process_goals: '',
    outcome_goals: '',
    final_notes: '',
  });

  useEffect(() => {
    if (session) {
      fetchTradingPlans();
    }
  }, [session]);

  useEffect(() => {
    if (allPlans.length > 0 && !selectedPlanId) {
      setSelectedPlanId(allPlans[0].id);
    }
  }, [allPlans, selectedPlanId]);

  useEffect(() => {
    if (selectedPlanId) {
      const selectedPlan = allPlans.find(p => p.id === selectedPlanId);
      if (selectedPlan) {
        setPlan(selectedPlan);
      }
    }
  }, [selectedPlanId, allPlans]);

  const fetchTradingPlans = async () => {
    try {
      // Fetch shared plans
      const { data: sharedData, error: sharedError } = await supabase
        .from('trading_plan')
        .select('*')
        .eq('is_public', true)
        .order('updated_at', { ascending: false });

      if (sharedError) throw sharedError;

      // Fetch personal plans
      const { data: personalData, error: personalError } = await supabase
        .from('trading_plan')
        .select('*')
        .eq('user_id', session?.user?.id)
        .eq('is_public', false)
        .order('updated_at', { ascending: false });

      if (personalError) throw personalError;

      setSharedPlans(sharedData || []);
      setPersonalPlans(personalData || []);

      if ((sharedData || []).length === 0 && (personalData || []).length === 0) {
        // Create a default shared plan if none exist
        await createDefaultSharedPlan();
      }
    } catch (error) {
      console.error('Error fetching trading plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultSharedPlan = async () => {
    try {
      const { data, error } = await supabase
        .from('trading_plan')
        .insert([{
          user_id: null, // Shared plan
          is_public: true,
          plan_title: 'BTC FIBONACCI GOLDEN RATIO TRADING PLAN',
          plan_version: '2.0',
          plan_status: 'Practice/Learning Phase',
          starting_capital: 100,
          risk_per_trade: '1-2% ($1-$2)',
          primary_asset: 'BTC/USD',
          trading_style: 'Multi-timeframe Fibonacci Golden Ratio Reversals (SMC)',
          h4_analysis: `**Phase 1: 4H Analysis (Trend & Setup Identification)**

**Step 1: Identify Market Structure**
- Look for **BOS (Break of Structure)**: Price breaks previous high (bullish) or low (bearish)
- This confirms institutional interest and direction.

**Step 2: Wait for Retracement to Golden Ratio**
- After 4H BOS, draw Fibonacci from swing high/low to swing low/high.
- **Target Zones:**
  - Primary: 0.618 (Golden Ratio)
  - Extended: 0.786 (Deep Golden Ratio)
  - **4H "Golden Area":** 0.618 - 0.786 zone

**Step 3: Wait for Price to Enter Golden Area**
- Don't jump early. Let price fully enter the zone.
- **THEN** drop to 15min chart.`,
          m15_confirmation: `**Phase 2: 15min Confirmation (Entry Setup)**

**Step 1: Wait for CHoCH (Change of Character) - MANDATORY**
- **Downtrend:** Price breaks above previous lower high.
- **Uptrend:** Price breaks below previous higher low.
- Signals potential reversal at 4H Golden Area.
- **No CHoCH = No trade.**

**Step 2: After CHoCH, Wait for BOS**
- **Scenario A (RISKY - Against 4H):** 15min CHoCH + BOS opposite to 4H. Higher R:R, lower win rate.
- **Scenario B (SAFE - With 4H):** 15min CHoCH + BOS aligns with 4H. Lower R:R, higher win rate.

**Step 3: Mark 15min Golden Ratio**
- Draw Fib on the 15min BOS move.
- Identify 0.618-0.786 zone (15min Golden Area).

**Step 4: Wait for Price to Retrace**
- Wait for price to enter 15min Golden Area.
- **THEN** drop to 1min chart.`,
          m1_execution: `**Phase 3: 1min Execution (Precise Entry)**

**Step 1: Wait for 1min CHoCH - MANDATORY**
- Shows micro-reversal at 15min Golden Area.
- **No 1min CHoCH = No entry.**

**Step 2: After 1min CHoCH, Watch for Golden Ratio**
1. **BOS + Golden Ratio (Best):** Wait for 1min BOS, draw Fib, enter at 0.618-0.786.
2. **Golden Ratio only (Good):** Immediate retracement to 0.618-0.786. Faster entry.

**Step 3: Multiple Entries Allowed**
- Entry 1: At 0.618 (conservative)
- Entry 2: At 0.786 (extended)
- Entry 3: At BOS retest
*Each entry is a separate trade with own SL. Max 2% total risk.*`,
          entry_rules: `**Checklist before entry:**
- [ ] 4H BOS confirmed (for SAFE trades)
- [ ] 4H Golden Ratio reached
- [ ] 15min CHoCH occurred (mandatory)
- [ ] 15min BOS confirmed
- [ ] 15min Golden Ratio reached
- [ ] 1min CHoCH occurred (mandatory)
- [ ] 1min Golden Ratio reached

**Two Trade Types:**
1. **RISKY (Counter-Trend):** Trade 15min reversal AGAINST 4H trend. High R:R (1:25+), Low Win Rate (30-40%).
2. **SAFE (Trend-Following):** Trade 15min reversal WITH 4H trend. Low R:R (1:10-15), High Win Rate (45-50%).`,
          special_entries: `**Risk Management:**
- **Max Risk:** 6% total per day.
- **Position Size:** \`Risk $ / Stop Loss Distance\`
- **Stop Loss:** Just beyond Golden Ratio zone (0.786 or 1.0).
- **Take Profit:** Opposite 4H level (Swing High/Low).
- **Break-Even:** Move 50% to BE at 1:5 R:R. Let remaining 50% run.`,
          optimal_hours: '8:00 PM - 7:00 AM (Sri Lanka GMT +5:30)',
          risk_reward_expectations: `**SAFE Trades:** R:R 1:10 - 1:20 | Win Rate 40-50%
**RISKY Trades:** R:R 1:20 - 1:30+ | Win Rate 30-40%`,
        }])
        .select();

      if (error) throw error;

      if (data && data[0]) {
        setSharedPlans([data[0]]);
      }
    } catch (error) {
      console.error('Error creating default shared plan:', error);
    }
  };

  const createNewPlan = async () => {
    try {
      const { data, error } = await supabase
        .from('trading_plan')
        .insert([{
          user_id: session?.user?.id,
          is_public: false,
          plan_title: 'New Trading Plan',
          plan_version: '1.0',
          plan_status: 'Draft',
          starting_capital: 10000,
          risk_per_trade: '1-2%',
          primary_asset: 'BTC/USD',
          trading_style: 'Multi-timeframe Analysis',
        }])
        .select();

      if (error) throw error;

      if (data && data[0]) {
        setPersonalPlans([data[0], ...personalPlans]);
        setSelectedPlanId(data[0].id);
        setEditMode(true);
      }
    } catch (error) {
      console.error('Error creating new plan:', error);
    }
  };

  const saveTradingPlan = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('trading_plan')
        .update({
          ...plan,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedPlanId);

      if (error) throw error;

      // Update the plan in the local state
      const updatedPlan = { ...plan, updated_at: new Date().toISOString() };
      if (sharedPlans.some(p => p.id === selectedPlanId)) {
        setSharedPlans(sharedPlans.map(p => p.id === selectedPlanId ? updatedPlan : p));
      } else {
        setPersonalPlans(personalPlans.map(p => p.id === selectedPlanId ? updatedPlan : p));
      }
      setEditMode(false);
    } catch (error) {
      console.error('Error saving trading plan:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-gray-400 text-lg">Loading trading plan...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          {allPlans.length > 1 && (
            <select
              value={selectedPlanId || ''}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            >
              {allPlans.map(p => (
                <option key={p.id} value={p.id}>
                  {p.is_public ? `📖 ${p.plan_title}` : `👤 ${p.plan_title}`}
                </option>
              ))}
            </select>
          )}
          <h1 className="text-4xl font-bold text-white">{plan.plan_title}</h1>
          
        </div>
        <p className="text-gray-400 text-lg">{plan.plan_status} - {plan.trading_style}</p>
        <div className="mt-4 text-sm text-gray-500">
          Plan Version: {plan.plan_version} | Review: Monthly
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
                {editMode ? (
                  <input
                    type="number"
                    value={plan.starting_capital}
                    onChange={(e) => setPlan({...plan, starting_capital: parseFloat(e.target.value) || 0})}
                    className="w-full bg-slate-600 border border-slate-500 rounded px-2 py-1 text-green-400 font-bold"
                  />
                ) : (
                  <div className="text-2xl font-bold text-green-400">${plan.starting_capital}</div>
                )}
              </div>
              <div className="bg-slate-700 p-4 rounded-lg">
                <div className="text-sm text-gray-400">Risk Per Trade</div>
                {editMode ? (
                  <input
                    type="text"
                    value={plan.risk_per_trade}
                    onChange={(e) => setPlan({...plan, risk_per_trade: e.target.value})}
                    className="w-full bg-slate-600 border border-slate-500 rounded px-2 py-1 text-yellow-400 font-bold"
                  />
                ) : (
                  <div className="text-2xl font-bold text-yellow-400">{plan.risk_per_trade}</div>
                )}
              </div>
              <div className="bg-slate-700 p-4 rounded-lg">
                <div className="text-sm text-gray-400">Status</div>
                {editMode ? (
                  <input
                    type="text"
                    value={plan.plan_status}
                    onChange={(e) => setPlan({...plan, plan_status: e.target.value})}
                    className="w-full bg-slate-600 border border-slate-500 rounded px-2 py-1 text-blue-400 font-semibold"
                  />
                ) : (
                  <div className="text-lg font-semibold text-blue-400">{plan.plan_status}</div>
                )}
              </div>
              <div className="bg-slate-700 p-4 rounded-lg">
                <div className="text-sm text-gray-400">Primary Asset</div>
                {editMode ? (
                  <input
                    type="text"
                    value={plan.primary_asset}
                    onChange={(e) => setPlan({...plan, primary_asset: e.target.value})}
                    className="w-full bg-slate-600 border border-slate-500 rounded px-2 py-1 text-white font-semibold"
                  />
                ) : (
                  <div className="text-lg font-semibold text-white">{plan.primary_asset}</div>
                )}
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm text-gray-400">Trading Style</div>
              {editMode ? (
                <input
                  type="text"
                  value={plan.trading_style}
                  onChange={(e) => setPlan({...plan, trading_style: e.target.value})}
                  className="w-full bg-slate-600 border border-slate-500 rounded px-2 py-1 text-purple-400 font-semibold"
                />
              ) : (
                <div className="text-lg font-semibold text-purple-400">{plan.trading_style}</div>
              )}
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
              {editMode ? (
                <textarea
                  value={plan.h4_analysis || ''}
                  onChange={(e) => setPlan({...plan, h4_analysis: e.target.value})}
                  placeholder="Describe your 4H analysis methodology..."
                  className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-2 text-gray-300 min-h-32"
                />
              ) : (
                <div className="text-gray-300 whitespace-pre-line">
                  {plan.h4_analysis || (
                    <>
                      <p className="mb-3"><strong>Objective:</strong> Identify main trend and institutional levels</p>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-blue-400">1. Trend Identification</h4>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                          <li>Follow 4H market structure (Higher Highs/Higher Lows OR Lower Highs/Lower Lows)</li>
                          <li>Direction = Trend direction on 4H</li>
                        </ul>
                      </div>
                      <div className="space-y-2 mt-4">
                        <h4 className="font-semibold text-blue-400">2. Mark Key Levels</h4>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                          <li>Order Blocks (OBs): Last bullish/bearish candle before strong move</li>
                          <li>Fair Value Gaps (FVGs): 3-candle imbalance zones</li>
                          <li>Liquidity pools: Equal highs/lows, round numbers</li>
                        </ul>
                      </div>
                      <div className="space-y-2 mt-4">
                        <h4 className="font-semibold text-blue-400">3. Decision Point</h4>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                          <li>Wait for price to reach 4H POI (OB or FVG)</li>
                          <li>THEN move to 15min timeframe</li>
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              )}
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
              {editMode ? (
                <textarea
                  value={plan.entry_rules || ''}
                  onChange={(e) => setPlan({...plan, entry_rules: e.target.value})}
                  placeholder="Describe your entry rules..."
                  className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-2 text-gray-300 min-h-20"
                />
              ) : (
                <div className="text-gray-300 whitespace-pre-line">
                  {plan.entry_rules || (
                    <>
                      <ul className="list-disc list-inside space-y-1">
                        <li><strong>Multiple Positions:</strong> Yes, across different 1min POIs (OB, FVG, Fib levels)</li>
                        <li><strong>Entry Type:</strong> Market/Limit order at exact Golden Pocket/POI touch</li>
                        <li><strong>Position Sizing:</strong> Calculate based on stop loss distance</li>
                      </ul>
                    </>
                  )}
                </div>
              )}
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
              <h3 className="text-green-200 font-bold text-lg mb-2">Optimal Trading Hours</h3>
              {editMode ? (
                <input
                  type="text"
                  value={plan.optimal_hours || ''}
                  onChange={(e) => setPlan({...plan, optimal_hours: e.target.value})}
                  placeholder="e.g., 8:00 PM - 7:00 AM"
                  className="w-full bg-green-800 border border-green-600 rounded px-3 py-2 text-green-100"
                />
              ) : (
                <div className="text-green-100">{plan.optimal_hours || '8:00 PM - 7:00 AM'}</div>
              )}
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
              {editMode ? (
                <textarea
                  value={plan.mental_rules || ''}
                  onChange={(e) => setPlan({...plan, mental_rules: e.target.value})}
                  placeholder="Describe your mental rules..."
                  className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-2 text-gray-300 min-h-24"
                />
              ) : (
                <div className="text-gray-300 whitespace-pre-line">
                  {plan.mental_rules || (
                    <>
                      <ol className="list-decimal list-inside space-y-1 ml-4">
                        <li><strong>Accept losses as business costs</strong> - With 1:25 R:R, 60-70% loss rate is normal</li>
                        <li><strong>Trust the process</strong> - Don't abandon strategy after 3-4 losses</li>
                        <li><strong>One setup at a time</strong> - Don't force trades outside your system</li>
                        <li><strong>Journal everything</strong> - Your data is your teacher</li>
                      </ol>
                    </>
                  )}
                </div>
              )}
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
              {editMode ? (
                <textarea
                  value={plan.final_notes || ''}
                  onChange={(e) => setPlan({...plan, final_notes: e.target.value})}
                  placeholder="Add your final notes and motivation..."
                  className="w-full bg-blue-800 border border-blue-600 rounded px-3 py-2 text-blue-100 min-h-32"
                />
              ) : (
                <div className="text-blue-100 whitespace-pre-line">
                  {plan.final_notes || (
                    <>
                      <p className="mb-4">
                        <strong>Remember:</strong> This is a practice phase. Your primary goal is not profit but mastery of:
                      </p>
                      <ol className="list-decimal list-inside space-y-1 ml-4 mb-4">
                        <li>Identifying ICT concepts across timeframes</li>
                        <li>Patience in waiting for full confirmations</li>
                        <li>Emotional control during losing streaks</li>
                        <li>Data collection and analysis</li>
                      </ol>

                      <p className="mb-4">
                        <strong>Your edge is:</strong>
                      </p>
                      <ul className="list-disc list-inside space-y-1 ml-4 mb-4">
                        <li>Multi-timeframe confluence</li>
                        <li>High R:R setups</li>
                        <li>Proper risk management</li>
                        <li>Consistent execution</li>
                      </ul>

                      <p className="font-bold text-center text-lg">
                        Stay disciplined. Trust your data. One trade at a time.
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


export default TradingPlanPage;
