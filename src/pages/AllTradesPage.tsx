import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { supabase } from "../lib/supabase";
import { Trade } from "../types";
import {
  Trash2,
  Edit2,
  Eye,
  Filter,
  Download,
  Search,
  ChevronDown,
  ChevronUp,
  Table,
  BarChart3,
} from "lucide-react";

interface AllTradesPageProps {
  onEditTrade?: (trade: Trade) => void;
  onViewTrade?: (trade: Trade) => void;
}

export const AllTradesPage: React.FC<AllTradesPageProps> = ({
  onEditTrade,
  onViewTrade,
}) => {
  const { session } = useAuth();
  const { addToast } = useToast();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [resultFilter, setResultFilter] = useState("");
  const [sessionFilter, setSessionFilter] = useState("");
  const [directionFilter, setDirectionFilter] = useState("");
  const [entryTypeFilter, setEntryTypeFilter] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "pl" | "rr">("date");
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    filters: true,
    trades: true,
  });
  const isInitialLoad = useRef(true);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  useEffect(() => {
    if (session) {
      const showLoading = isInitialLoad.current;
      fetchTrades(showLoading);
      isInitialLoad.current = false;
    }
  }, [
    session,
    resultFilter,
    sessionFilter,
    directionFilter,
    entryTypeFilter,
    sortBy,
  ]);

  const fetchTrades = async (showLoading = true) => {
    if (!session) {
      console.log("No session, returning");
      return;
    }

    console.log(
      "Fetching trades with showLoading:",
      showLoading,
      "resultFilter:",
      resultFilter,
      "sessionFilter:",
      sessionFilter,
      "directionFilter:",
      directionFilter,
      "sortBy:",
      sortBy
    );

    if (showLoading) {
      setLoading(true);
    }

    try {
      console.log(
        "Fetching trades with filters - result:",
        resultFilter,
        "session:",
        sessionFilter,
        "direction:",
        directionFilter,
        "sortBy:",
        sortBy
      );

      let query = supabase
        .from("trades")
        .select("*")
        .eq("user_id", session.user.id)
        .order("trade_date", { ascending: false });

      // Apply filters
      if (resultFilter && resultFilter !== "") {
        query = query.eq("trade_result", resultFilter);
        console.log("Applying result filter:", resultFilter);
      }
      if (sessionFilter && sessionFilter !== "") {
        query = query.eq("session", sessionFilter);
        console.log("Applying session filter:", sessionFilter);
      }
      if (directionFilter && directionFilter !== "") {
        query = query.eq("direction", directionFilter);
        console.log("Applying direction filter:", directionFilter);
      }
      if (entryTypeFilter && entryTypeFilter !== "") {
        query = query.eq("m1_entry_type", entryTypeFilter);
        console.log("Applying entryType filter:", entryTypeFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Supabase error:", error);
        addToast("Error loading trades", "error");
        return;
      }

      console.log("Fetched data:", data);

      if (data) {
        let sorted = [...data];
        if (sortBy === "pl") {
          sorted.sort((a, b) => (b.pl_dollar || 0) - (a.pl_dollar || 0));
          console.log("Sorted by P&L");
        } else if (sortBy === "rr") {
          sorted.sort(
            (a, b) => (b.risk_reward_ratio || 0) - (a.risk_reward_ratio || 0)
          );
          console.log("Sorted by R:R");
        }
        console.log("Setting trades:", sorted.length, "trades");
        setTrades(sorted);
      } else {
        console.log("No data returned");
        setTrades([]);
      }
    } catch (error) {
      console.error("Error fetching trades:", error);
      addToast("Error loading trades", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (tradeId: string) => {
    if (!window.confirm("Are you sure you want to delete this trade?")) return;

    try {
      const { error } = await supabase
        .from("trades")
        .delete()
        .eq("id", tradeId);

      if (error) throw error;

      setTrades(trades.filter((t) => t.id !== tradeId));
      addToast("Trade deleted successfully", "success");
    } catch (error: any) {
      console.error("Error deleting trade:", error);
      addToast("Error deleting trade", "error");
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "Date",
      "Time",
      "Session",
      "Direction",
      "Entry Type",
      "Entry",
      "Exit",
      "R:R",
      "Result",
      "P/L ($)",
      "P/L (%)",
    ];
    const rows = trades.map((t) => [
      t.trade_date,
      t.trade_time,
      t.session,
      t.direction,
      t.m1_entry_type || "-",
      t.entry_price.toFixed(2),
      t.exit_price ? t.exit_price.toFixed(2) : "-",
      t.risk_reward_ratio ? `1:${t.risk_reward_ratio}` : "-",
      t.trade_result || "-",
      t.pl_dollar ? t.pl_dollar.toFixed(2) : "-",
      t.pl_percent ? t.pl_percent.toFixed(2) : "-",
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trades-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400">Loading trades...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 rounded-full mb-4 shadow-lg shadow-blue-500/25">
          <Table className="w-6 h-6 text-white" />
          <h1 className="text-2xl font-bold text-white">All Trades</h1>
        </div>
        <p className="text-gray-400 text-lg">
          Complete trade history and management
        </p>
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500 bg-slate-800/50 px-4 py-2 rounded-lg inline-flex">
          <Table className="w-4 h-4" />
          <span>
            {trades.length} trade{trades.length !== 1 ? "s" : ""} recorded
          </span>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl">
        <button
          onClick={() => toggleSection("filters")}
          className="w-full flex items-center justify-between p-6 hover:bg-slate-700/50 transition-all duration-200"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <Filter className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Filters & Controls</h2>
          </div>
          {expandedSections.filters ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {expandedSections.filters && (
          <div className="border-t border-slate-700 p-6">
            <div className="bg-gradient-to-br from-slate-700 to-slate-600 p-6 rounded-lg space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-slate-800 p-3 rounded-lg">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Result
                  </label>
                  <select
                    value={resultFilter}
                    onChange={(e) => setResultFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
                  >
                    <option value="">All Results</option>
                    <option value="Win">✅ Win</option>
                    <option value="Loss">❌ Loss</option>
                    <option value="Break Even">⚪ Break Even</option>
                  </select>
                </div>

                <div className="bg-slate-800 p-3 rounded-lg">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Session
                  </label>
                  <select
                    value={sessionFilter}
                    onChange={(e) => setSessionFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
                  >
                    <option value="">All Sessions</option>
                    <option value="London Close">🌅 London Close</option>
                    <option value="NY Session">🌆 NY Session</option>
                    <option value="Asian Session">🌄 Asian Session</option>
                  </select>
                </div>

                <div className="bg-slate-800 p-3 rounded-lg">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Direction
                  </label>
                  <select
                    value={directionFilter}
                    onChange={(e) => {
                      console.log(
                        "Direction filter changed to:",
                        e.target.value
                      );
                      setDirectionFilter(e.target.value);
                    }}
                    className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
                  >
                    <option value="">All Directions</option>
                    <option value="Long">📈 Long</option>
                    <option value="Short">📉 Short</option>
                  </select>
                </div>

                <div className="bg-slate-800 p-3 rounded-lg">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
                  >
                    <option value="date">📅 Date</option>
                    <option value="pl">💰 P/L</option>
                    <option value="rr">🎯 R:R Ratio</option>
                  </select>
                </div>

                <div className="bg-slate-800 p-3 rounded-lg">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Export
                  </label>
                  <button
                    onClick={handleExportCSV}
                    className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold rounded-lg transition-all duration-200 transform hover:scale-105 text-sm"
                  >
                    📊 CSV Export
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Trades Table */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl">
        <button
          onClick={() => toggleSection("trades")}
          className="w-full flex items-center justify-between p-6 hover:bg-slate-700/50 transition-all duration-200"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Trade History</h2>
          </div>
          <div className="text-sm text-gray-400">
            {trades.length} trade{trades.length !== 1 ? "s" : ""} displayed
          </div>
        </button>

        {expandedSections.trades && (
          <div className="border-t border-slate-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-700 to-slate-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">
                      📅 Date/Time
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">
                      🌍 Session
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">
                      📈 Direction
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">
                      🎯 Entry Type
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">
                      💰 Entry / Exit
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">
                      ⚖️ R:R
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">
                      📊 Result
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">
                      💵 P/L
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-white">
                      ⚙️ Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {trades.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center">
                        <div className="text-gray-400">
                          <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p className="text-lg mb-2">No trades found</p>
                          <p className="text-sm">
                            Try adjusting your filters or add your first trade
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    trades.map((trade, index) => (
                      <tr
                        key={trade.id}
                        className="hover:bg-slate-700/50 transition-all duration-200"
                      >
                        <td className="px-6 py-4">
                          <div className="text-white font-medium">
                            {trade.trade_date}
                          </div>
                          <div className="text-gray-400 text-sm">
                            {trade.trade_time}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-slate-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                            {trade.session}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`font-bold text-lg ${
                              trade.direction === "Long"
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {trade.direction === "Long" ? "📈" : "📉"}{" "}
                            {trade.direction}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-white">
                            {trade.m1_entry_type || "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-white font-mono">
                            ${trade.entry_price.toFixed(2)}
                          </div>
                          {trade.exit_price && (
                            <div className="text-gray-400 text-sm font-mono">
                              ${trade.exit_price.toFixed(2)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-purple-900 text-purple-100 px-3 py-1 rounded-full text-sm font-bold">
                            {trade.risk_reward_ratio
                              ? `1:${trade.risk_reward_ratio}`
                              : "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-bold ${
                              trade.trade_result === "Win"
                                ? "bg-green-900 text-green-100"
                                : trade.trade_result === "Loss"
                                ? "bg-red-900 text-red-100"
                                : "bg-yellow-900 text-yellow-100"
                            }`}
                          >
                            {trade.trade_result === "Win" && "✅ "}
                            {trade.trade_result === "Loss" && "❌ "}
                            {trade.trade_result === "Break Even" && "⚪ "}
                            {trade.trade_result || "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div
                            className={`font-bold text-lg ${
                              trade.pl_dollar && trade.pl_dollar >= 0
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            $
                            {trade.pl_dollar
                              ? trade.pl_dollar.toFixed(2)
                              : "0.00"}
                          </div>
                          {trade.pl_percent && (
                            <div className="text-gray-400 text-sm">
                              {trade.pl_percent >= 0 ? "+" : ""}
                              {trade.pl_percent.toFixed(2)}%
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => onViewTrade?.(trade)}
                              className="p-2 hover:bg-blue-600 rounded-lg transition-colors text-blue-400 hover:text-white"
                              title="View Trade Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onEditTrade?.(trade)}
                              className="p-2 hover:bg-yellow-600 rounded-lg transition-colors text-yellow-400 hover:text-white"
                              title="Edit Trade"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(trade.id)}
                              className="p-2 hover:bg-red-600 rounded-lg transition-colors text-red-400 hover:text-white"
                              title="Delete Trade"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Trade Management Tips */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 border border-blue-700 rounded-lg p-6">
        <h3 className="text-blue-200 font-bold text-lg mb-3">
          💡 Trade Management Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-100">
          <div className="bg-blue-800/50 p-3 rounded-lg">
            <div className="font-semibold mb-1">Regular Review</div>
            <div className="text-sm">
              Review your trades weekly to identify patterns and improvements
            </div>
          </div>
          <div className="bg-blue-800/50 p-3 rounded-lg">
            <div className="font-semibold mb-1">Data Export</div>
            <div className="text-sm">
              Export your data regularly for backup and external analysis
            </div>
          </div>
          <div className="bg-blue-800/50 p-3 rounded-lg">
            <div className="font-semibold mb-1">Filter Analysis</div>
            <div className="text-sm">
              Use filters to analyze performance by session, direction, or
              result
            </div>
          </div>
          <div className="bg-blue-800/50 p-3 rounded-lg">
            <div className="font-semibold mb-1">Risk Assessment</div>
            <div className="text-sm">
              Monitor your R:R ratios and ensure consistent risk management
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
