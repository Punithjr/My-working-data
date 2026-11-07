import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList
} from 'recharts';
import { 
  FolderGit2, 
  Clock, 
  Eye, 
  CheckCircle2, 
  BarChart3, 
  PieChart as PieIcon, 
  Filter, 
  Sparkles, 
  AlertCircle, 
  RotateCcw,
  TrendingUp,
  LayoutGrid,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { MasterDocketFile } from '../types';

export interface FileStatusMiniDashboardProps {
  files: MasterDocketFile[];
  activeStatusFilter: string;
  onSelectStatusFilter: (filterKey: string) => void;
  onClearFilter?: () => void;
}

export type StatusBucketKey = 'bucket_pending' | 'bucket_under_review' | 'bucket_completed';

export const isPendingDocket = (status?: string): boolean => {
  if (!status) return true;
  const s = status.toLowerCase();
  return (
    s.includes('pending') ||
    s.includes('active') ||
    s.includes('open') ||
    s.includes('in-transit') ||
    s.includes('ಬಾಕಿ') ||
    s.includes('ಸಕ್ರಿಯ') ||
    s === 'active / open' ||
    s === 'pending higher approval'
  );
};

export const isUnderReviewDocket = (status?: string): boolean => {
  if (!status) return false;
  const s = status.toLowerCase();
  return (
    s.includes('scrutiny') ||
    s.includes('review') ||
    s.includes('ಪರಿಶೀಲನೆ') ||
    s === 'under scrutiny' ||
    s === 'under review'
  );
};

export const isCompletedDocket = (status?: string): boolean => {
  if (!status) return false;
  const s = status.toLowerCase();
  return (
    s.includes('closed') ||
    s.includes('disposed') ||
    s.includes('completed') ||
    s.includes('ವಿಲೇವಾರಿ') ||
    s.includes('ಮುಕ್ತಾಯ') ||
    s.includes('approved') ||
    s.includes('withdrawn') ||
    s === 'disposed / closed'
  );
};

export const FileStatusMiniDashboard: React.FC<FileStatusMiniDashboardProps> = ({
  files,
  activeStatusFilter,
  onSelectStatusFilter,
  onClearFilter
}) => {
  // View mode: 'split' (side by side) | 'bar' | 'donut'
  const [viewMode, setViewMode] = useState<'split' | 'bar' | 'donut'>('split');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Calculate Metrics by Status
  const metrics = useMemo(() => {
    let pendingCount = 0;
    let underReviewCount = 0;
    let completedCount = 0;

    files.forEach(file => {
      const st = file.status;
      if (isCompletedDocket(st)) {
        completedCount++;
      } else if (isUnderReviewDocket(st)) {
        underReviewCount++;
      } else {
        // Pending / Active / In-transit / Default
        pendingCount++;
      }
    });

    const total = files.length;
    const pendingPct = total > 0 ? Math.round((pendingCount / total) * 100) : 0;
    const underReviewPct = total > 0 ? Math.round((underReviewCount / total) * 100) : 0;
    const completedPct = total > 0 ? Math.round((completedCount / total) * 100) : 0;

    return {
      total,
      pendingCount,
      underReviewCount,
      completedCount,
      pendingPct,
      underReviewPct,
      completedPct
    };
  }, [files]);

  // Chart datasets
  const chartData = useMemo(() => {
    return [
      {
        key: 'bucket_pending' as StatusBucketKey,
        name: 'ಕ್ರಮ ಬಾಕಿ (Pending)',
        shortName: 'Pending',
        kannada: 'ಬಾಕಿ ಕಡತಗಳು',
        count: metrics.pendingCount,
        percentage: metrics.pendingPct,
        fill: '#f59e0b', // Amber-500
        stroke: '#b45309', // Amber-700
        lightBg: 'bg-amber-50',
        badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
        activeRing: 'ring-4 ring-amber-400 border-amber-600',
        description: 'ಅಧಿಕಾರಿಯ ಪರಿಶೀಲನೆ ಅಥವಾ ಮುಂದಿನ ಆದೇಶಕ್ಕೆ ಬಾಕಿ'
      },
      {
        key: 'bucket_under_review' as StatusBucketKey,
        name: 'ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ (Under Review)',
        shortName: 'Under Review',
        kannada: 'ಪರಿಶೀಲನೆಯಲ್ಲಿ',
        count: metrics.underReviewCount,
        percentage: metrics.underReviewPct,
        fill: '#0284c7', // Sky-600
        stroke: '#0369a1', // Sky-700
        lightBg: 'bg-sky-50',
        badgeBg: 'bg-sky-100 text-sky-900 border-sky-300',
        activeRing: 'ring-4 ring-sky-400 border-sky-600',
        description: 'ಸ್ಕ್ರೂಟಿನಿ, ದಾಖಲೆಗಳ ತಪಾಸಣೆ ಮತ್ತು ಟಿಪ್ಪಣಿ ಹಂತ'
      },
      {
        key: 'bucket_completed' as StatusBucketKey,
        name: 'ವಿಲೇವಾರಿಗೊಂಡಿದೆ (Completed)',
        shortName: 'Completed',
        kannada: 'ವಿಲೇವಾರಿ ಪೂರ್ಣ',
        count: metrics.completedCount,
        percentage: metrics.completedPct,
        fill: '#10b981', // Emerald-500
        stroke: '#047857', // Emerald-700
        lightBg: 'bg-emerald-50',
        badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        activeRing: 'ring-4 ring-emerald-400 border-emerald-600',
        description: 'ಆದೇಶ ಜಾರಿಗೊಂಡು ಯಶಸ್ವಿಯಾಗಿ ಮುಕ್ತಾಯಗೊಂಡ ಕಡತ'
      }
    ];
  }, [metrics]);

  const handleCardClick = (bucketKey: StatusBucketKey) => {
    if (activeStatusFilter === bucketKey) {
      if (onClearFilter) onClearFilter();
      else onSelectStatusFilter('all');
    } else {
      onSelectStatusFilter(bucketKey);
    }
  };

  // Custom tooltip for BarChart
  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-stone-900 text-white p-3 rounded-xl shadow-xl border border-stone-700 text-xs space-y-1.5 min-w-[200px]">
          <div className="flex items-center justify-between gap-2 border-b border-stone-700 pb-1.5">
            <span className="font-bold text-amber-400">{data.kannada}</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-stone-800 text-stone-300">
              {data.shortName}
            </span>
          </div>
          <div className="flex items-center justify-between text-stone-200">
            <span>ಕಡತಗಳ ಸಂಖ್ಯೆ (Count):</span>
            <span className="font-bold text-sm text-white font-mono">{data.count}</span>
          </div>
          <div className="flex items-center justify-between text-stone-300 text-[11px]">
            <span>ಒಟ್ಟು ಶೇಕಡಾವಾರು (Share):</span>
            <span className="font-mono font-bold text-emerald-400">{data.percentage}%</span>
          </div>
          <p className="text-[10px] text-stone-400 pt-1 italic">{data.description}</p>
          <div className="text-[9px] text-amber-300 font-bold pt-0.5 text-center bg-stone-800/80 rounded py-0.5">
            ಕ್ಲಿಕ್ ಮಾಡಿ ಕಡತಗಳನ್ನು ಫಿಲ್ಟರ್ ಮಾಡಿ
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for PieChart
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-stone-900 text-white p-3 rounded-xl shadow-xl border border-stone-700 text-xs space-y-1 min-w-[180px]">
          <div className="font-bold text-amber-300">{data.name}</div>
          <div className="flex justify-between items-center text-stone-200">
            <span>ಕಡತಗಳು:</span>
            <span className="font-bold font-mono text-sm">{data.count} ಕಡತ</span>
          </div>
          <div className="flex justify-between items-center text-stone-300 text-[11px]">
            <span>ಪ್ರಮಾಣ:</span>
            <span className="font-bold font-mono text-emerald-400">{data.percentage}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl border-2 border-[#2b2b2b] shadow-[4px_4px_0px_#2b2b2b] overflow-hidden transition-all">
      {/* Header bar */}
      <div className="bg-stone-900 text-white p-3.5 sm:px-5 flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#2b2b2b]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-400 text-stone-950 flex items-center justify-center font-bold shadow-[2px_2px_0px_rgba(255,255,255,0.4)]">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold font-kannada tracking-wide text-amber-300">
                ಕಡತಗಳ ಸ್ಥಿತಿ ಮಿನಿ-ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ (File Status Dashboard)
              </h3>
              <span className="hidden sm:inline px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Recharts Powered
              </span>
            </div>
            <p className="text-[11px] text-stone-300 font-kannada">
              ಕೇಸ್ ವರ್ಕರ್ ತ್ವರಿತ ಅವಲೋಕನ: ಬಾಕಿ, ಪರಿಶೀಲನೆ ಮತ್ತು ವಿಲೇವಾರಿ ಹಂತಗಳ ಸಾರಾಂಶ
            </p>
          </div>
        </div>

        {/* View mode toggle & expand toggle */}
        <div className="flex items-center gap-2">
          {/* Active filter badge */}
          {activeStatusFilter !== 'all' && (
            <div className="flex items-center gap-1.5 bg-amber-400 text-stone-950 px-2.5 py-1 rounded-lg text-xs font-bold font-kannada shadow-sm">
              <Filter className="w-3 h-3" />
              <span>
                {activeStatusFilter === 'bucket_pending' && 'ಫಿಲ್ಟರ್: ಬಾಕಿ'}
                {activeStatusFilter === 'bucket_under_review' && 'ಫಿಲ್ಟರ್: ಪರಿಶೀಲನೆ'}
                {activeStatusFilter === 'bucket_completed' && 'ಫಿಲ್ಟರ್: ವಿಲೇವಾರಿ'}
                {!activeStatusFilter.startsWith('bucket_') && `ಫಿಲ್ಟರ್: ${activeStatusFilter}`}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (onClearFilter) onClearFilter();
                  else onSelectStatusFilter('all');
                }}
                className="hover:bg-amber-500 p-0.5 rounded cursor-pointer ml-1"
                title="ಫಿಲ್ಟರ್ ತೆಗೆದುಹಾಕಿ (Reset)"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Chart View Mode Controls */}
          <div className="bg-stone-800 p-0.5 rounded-lg border border-stone-700 flex items-center text-xs">
            <button
              type="button"
              onClick={() => {
                setViewMode('split');
                setIsExpanded(true);
              }}
              className={`px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                viewMode === 'split' ? 'bg-amber-400 text-stone-950 shadow-xs' : 'text-stone-300 hover:text-white'
              }`}
              title="ದ್ವಿಮುಖ ನಕ್ಷೆ (Bar + Donut)"
            >
              <LayoutGrid className="w-3 h-3" />
              <span className="hidden md:inline">ಉಭಯ (Split)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode('bar');
                setIsExpanded(true);
              }}
              className={`px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                viewMode === 'bar' ? 'bg-amber-400 text-stone-950 shadow-xs' : 'text-stone-300 hover:text-white'
              }`}
              title="ಕಂಬ ಸಾಲು ನಕ್ಷೆ (Bar Chart)"
            >
              <BarChart3 className="w-3 h-3" />
              <span className="hidden md:inline">ಬಾರ್ (Bar)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode('donut');
                setIsExpanded(true);
              }}
              className={`px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                viewMode === 'donut' ? 'bg-amber-400 text-stone-950 shadow-xs' : 'text-stone-300 hover:text-white'
              }`}
              title="ವೃತ್ತ ನಕ್ಷೆ (Donut Chart)"
            >
              <PieIcon className="w-3 h-3" />
              <span className="hidden md:inline">ವೃತ್ತ (Donut)</span>
            </button>
          </div>

          {/* Collapse / Expand Toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 cursor-pointer transition-colors"
            title={isExpanded ? 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಕುಗ್ಗಿಸಿ (Collapse)' : 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ವಿಸ್ತರಿಸಿ (Expand)'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main KPI Cards Row (Always Visible) */}
      <div className="p-4 sm:p-5 bg-stone-50 border-b border-stone-200">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Total Dockets */}
          <button
            type="button"
            onClick={() => onSelectStatusFilter('all')}
            className={`p-3.5 sm:p-4 rounded-xl border-2 transition-all text-left bg-white shadow-2xs hover:shadow-md cursor-pointer ${
              activeStatusFilter === 'all'
                ? 'border-stone-900 ring-2 ring-stone-900/30 bg-stone-100/50'
                : 'border-stone-300 hover:border-stone-400'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-stone-600 font-kannada flex items-center gap-1">
                <FolderGit2 className="w-3.5 h-3.5 text-stone-800" />
                ಒಟ್ಟು ಕಡತಗಳು
              </span>
              <span className="px-1.5 py-0.5 rounded bg-stone-200 text-stone-800 text-[10px] font-mono font-bold">
                TOTAL
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-mono">
                {metrics.total}
              </span>
              <span className="text-xs text-stone-500 font-bold font-mono">
                100%
              </span>
            </div>
            <p className="text-[10px] text-stone-500 mt-1 truncate font-kannada">
              ಶಾಖೆಯ ಎಲ್ಲಾ ಕಡತಗಳ ಸಂಖ್ಯೆ
            </p>
          </button>

          {/* Card 2: Pending Dockets (Amber) */}
          <button
            type="button"
            onClick={() => handleCardClick('bucket_pending')}
            className={`p-3.5 sm:p-4 rounded-xl border-2 transition-all text-left bg-white shadow-2xs hover:shadow-md cursor-pointer ${
              activeStatusFilter === 'bucket_pending'
                ? 'border-amber-600 ring-2 ring-amber-500/40 bg-amber-50/70'
                : 'border-amber-200 hover:border-amber-400'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-amber-900 font-kannada flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                ಕ್ರಮ ಬಾಕಿ (Pending)
              </span>
              <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-mono font-bold border border-amber-300">
                {metrics.pendingPct}%
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-700 font-mono">
                {metrics.pendingCount}
              </span>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                ತಕ್ಷಣದ ಕ್ರಮ
              </span>
            </div>
            <p className="text-[10px] text-amber-800 mt-1 truncate font-kannada">
              ಅನುಮೋದನೆ / ಚಲನವಲನ ಬಾಕಿ
            </p>
          </button>

          {/* Card 3: Under Review / Scrutiny (Sky/Blue) */}
          <button
            type="button"
            onClick={() => handleCardClick('bucket_under_review')}
            className={`p-3.5 sm:p-4 rounded-xl border-2 transition-all text-left bg-white shadow-2xs hover:shadow-md cursor-pointer ${
              activeStatusFilter === 'bucket_under_review'
                ? 'border-sky-600 ring-2 ring-sky-500/40 bg-sky-50/70'
                : 'border-sky-200 hover:border-sky-400'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-sky-900 font-kannada flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-sky-600" />
                ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ (Review)
              </span>
              <span className="px-1.5 py-0.5 rounded bg-sky-100 text-sky-900 text-[10px] font-mono font-bold border border-sky-300">
                {metrics.underReviewPct}%
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-sky-700 font-mono">
                {metrics.underReviewCount}
              </span>
              <span className="text-[10px] font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded-full">
                ಸ್ಕ್ರೂಟಿನಿ ಹಂತ
              </span>
            </div>
            <p className="text-[10px] text-sky-800 mt-1 truncate font-kannada">
              ದಾಖಲೆಗಳ ಪರಿಶೀಲನೆ ಹಂತದಲ್ಲಿ
            </p>
          </button>

          {/* Card 4: Completed / Disposed (Emerald) */}
          <button
            type="button"
            onClick={() => handleCardClick('bucket_completed')}
            className={`p-3.5 sm:p-4 rounded-xl border-2 transition-all text-left bg-white shadow-2xs hover:shadow-md cursor-pointer ${
              activeStatusFilter === 'bucket_completed'
                ? 'border-emerald-600 ring-2 ring-emerald-500/40 bg-emerald-50/70'
                : 'border-emerald-200 hover:border-emerald-400'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-emerald-900 font-kannada flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ವಿಲೇವಾರಿ (Completed)
              </span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[10px] font-mono font-bold border border-emerald-300">
                {metrics.completedPct}%
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-mono">
                {metrics.completedCount}
              </span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                ಆದೇಶ ಜಾರಿ
              </span>
            </div>
            <p className="text-[10px] text-emerald-800 mt-1 truncate font-kannada">
              ಯಶಸ್ವಿಯಾಗಿ ವಿಲೇವಾರಿಯಾದ ಕಡತಗಳು
            </p>
          </button>
        </div>
      </div>

      {/* Expandable Recharts Visualizations Area */}
      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Visual Chart Left: Bar Chart */}
            {(viewMode === 'split' || viewMode === 'bar') && (
              <div
                className={`bg-stone-50/70 rounded-xl p-4 border border-stone-200 flex flex-col justify-between ${
                  viewMode === 'bar' ? 'lg:col-span-12' : 'lg:col-span-7'
                }`}
              >
                <div className="flex items-center justify-between mb-3 border-b border-stone-200 pb-2">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-stone-700" />
                    <span className="text-xs font-bold text-stone-800 font-kannada">
                      ಸ್ಥಿತಿವಾರು ಕಡತಗಳ ವಿವರ (Count by Status)
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-500 font-mono">
                    ಕ್ಲಿಕ್ ಮಾಡಿ ಫಿಲ್ಟರ್ ಮಾಡಿ (Click bar to filter)
                  </span>
                </div>

                <div className="w-full h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 20, right: 20, left: -15, bottom: 5 }}
                      onClick={(state: any) => {
                        if (state && state.activePayload && state.activePayload.length) {
                          const item = state.activePayload[0].payload;
                          handleCardClick(item.key);
                        }
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                      <XAxis
                        dataKey="shortName"
                        tick={{ fill: '#374151', fontSize: 11, fontWeight: 600 }}
                        axisLine={{ stroke: '#d1d5db' }}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fill: '#6b7280', fontSize: 11 }}
                        axisLine={{ stroke: '#d1d5db' }}
                      />
                      <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.04)' }} />
                      <Bar
                        dataKey="count"
                        radius={[6, 6, 0, 0]}
                        cursor="pointer"
                      >
                        {chartData.map((entry) => (
                          <Cell
                            key={`bar-${entry.key}`}
                            fill={entry.fill}
                            stroke={activeStatusFilter === entry.key ? '#000000' : entry.stroke}
                            strokeWidth={activeStatusFilter === entry.key ? 3 : 1}
                          />
                        ))}
                        <LabelList
                          dataKey="count"
                          position="top"
                          fill="#1f2937"
                          fontSize={12}
                          fontWeight="bold"
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Bar Chart Quick Legend / Chips */}
                <div className="flex flex-wrap items-center justify-around gap-2 pt-3 border-t border-stone-200 mt-2 text-xs">
                  {chartData.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handleCardClick(item.key)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-all border ${
                        item.badgeBg
                      } ${activeStatusFilter === item.key ? 'ring-2 ring-stone-900 shadow-xs' : 'hover:opacity-80'}`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }}></span>
                      <span>{item.name}:</span>
                      <span className="font-mono">{item.count}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Visual Chart Right: Donut / Pie Chart */}
            {(viewMode === 'split' || viewMode === 'donut') && (
              <div
                className={`bg-stone-50/70 rounded-xl p-4 border border-stone-200 flex flex-col justify-between ${
                  viewMode === 'donut' ? 'lg:col-span-12' : 'lg:col-span-5'
                }`}
              >
                <div className="flex items-center justify-between mb-3 border-b border-stone-200 pb-2">
                  <div className="flex items-center gap-2">
                    <PieIcon className="w-4 h-4 text-stone-700" />
                    <span className="text-xs font-bold text-stone-800 font-kannada">
                      ಶೇಕಡಾವಾರು ಪಾಲು (Percentage Share)
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-500 font-mono">
                    ಒಟ್ಟು {metrics.total} ಕಡತ
                  </span>
                </div>

                <div className="w-full h-56 flex items-center justify-center relative">
                  {metrics.total === 0 ? (
                    <div className="text-center text-xs text-stone-400 font-kannada">
                      ಕಡತಗಳ ವಿವರ ಲಭ್ಯವಿಲ್ಲ
                    </div>
                  ) : (
                    <>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={75}
                            paddingAngle={4}
                            dataKey="count"
                            cursor="pointer"
                            onClick={(entry: any) => handleCardClick(entry.key || entry.payload?.key)}
                          >
                            {chartData.map((entry) => (
                              <Cell
                                key={`donut-${entry.key}`}
                                fill={entry.fill}
                                stroke={activeStatusFilter === entry.key ? '#000000' : '#ffffff'}
                                strokeWidth={activeStatusFilter === entry.key ? 3 : 2}
                              />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomPieTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      {/* Center summary ring label */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-xs text-stone-500 font-bold">ವಿಲೇವಾರಿ ದರ</span>
                        <span className="text-base font-extrabold text-emerald-700 font-mono">
                          {metrics.completedPct}%
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Donut Legend */}
                <div className="pt-3 border-t border-stone-200 mt-2 space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between text-stone-600">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      ಕ್ರಮ ಬಾಕಿ
                    </span>
                    <span className="font-mono font-bold text-amber-700">
                      {metrics.pendingCount} ({metrics.pendingPct}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-stone-600">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-sky-600"></span>
                      ಪರಿಶೀಲನೆ
                    </span>
                    <span className="font-mono font-bold text-sky-700">
                      {metrics.underReviewCount} ({metrics.underReviewPct}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-stone-600">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      ವಿಲೇವಾರಿ ಪೂರ್ಣ
                    </span>
                    <span className="font-mono font-bold text-emerald-700">
                      {metrics.completedCount} ({metrics.completedPct}%)
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actionable Insights Bar for Case Worker */}
          <div className="bg-gradient-to-r from-amber-50 via-stone-50 to-emerald-50 rounded-xl p-3 border border-stone-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <div className="font-kannada text-stone-800">
                <strong>ಕೇಸ್ ವರ್ಕರ್ ಸಲಹೆ: </strong>
                {metrics.pendingCount > 0 ? (
                  <span>
                    ಪ್ರಸ್ತುತ <strong className="text-amber-800">{metrics.pendingCount} ಕಡತಗಳು</strong> ಬಾಕಿ ಇವೆ. ಕಡತ ಪರಿಶೀಲಿಸಿ ಟಿಪ್ಪಣಿ ಬರೆದು ಶೀಘ್ರವೇ BEO/ಅಧೀಕ್ಷಕರ ಅನುಮೋದನೆಗೆ ರವಾನಿಸಿ.
                  </span>
                ) : (
                  <span className="text-emerald-800 font-bold">
                    ಅತ್ಯುತ್ತಮ ಪ್ರಗತಿ! ಎಲ್ಲಾ ಕಡತಗಳ ಪರಿಶೀಲನೆ ಮತ್ತು ವಿಲೇವಾರಿ ಸಕಾಲದಲ್ಲಿ ಪೂರ್ಣಗೊಂಡಿದೆ.
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] text-stone-600 font-mono">
                ವಿಲೇವಾರಿ ದರ: <strong className="text-emerald-700">{metrics.completedPct}%</strong>
              </span>
              {activeStatusFilter !== 'all' && (
                <button
                  type="button"
                  onClick={() => {
                    if (onClearFilter) onClearFilter();
                    else onSelectStatusFilter('all');
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-stone-100 text-stone-700 rounded-lg border border-stone-300 font-bold text-[11px] cursor-pointer font-kannada"
                >
                  ಎಲ್ಲಾ ಕಡತಗಳು ({metrics.total})
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
