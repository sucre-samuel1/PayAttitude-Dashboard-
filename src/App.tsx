import React from 'react';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Layout } from './components/Layout/Layout';
import { FilterTab } from './components/FilterTab/FilterTab';
import { OverviewStats } from './components/OverviewStats/OverviewStats';
import { PerformanceCharts } from './components/PerformanceCharts/PerformanceCharts';
import { EntriesChart } from './components/EntriesChart/EntriesChart';
import { MerchantsList } from './components/MerchantsList/MerchantsList';
import { TokenActivity } from './components/TokenActivity/TokenActivity';
import { OtherActivities } from './components/OtherActivities/OtherActivities';
import { RecentTransactions } from './components/RecentTransactions/RecentTransactions';
import { DatePicker } from './components/DatePicker/DatePicker';
import { useDashboard } from './hooks/useDashboard';
import { FilterPeriod } from './types';
import {
  mockOverviewStats,
  mockTokenizationPerfData,
  mockDetokenizationPerfData,
  mockChartData,
  mockMerchants,
  mockTokenActivityStats,
  mockTopMerchant,
  mockMostUsedToken,
  mockFraudDetection,
  mockTransactions,
} from './data';

function App() {
  const {
    filterPeriod,
    setFilterPeriod,
    showDatePicker,
    setShowDatePicker,
    dateRange,
    setDateRange,
  } = useDashboard();

  const periods: FilterPeriod[] = ['Today', 'Last 7 days', 'Last 30 days', 'Last 90 days'];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Overview</h1>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <FilterTab
              periods={periods}
              activePeriod={filterPeriod}
              onChange={setFilterPeriod}
            />
            <button
              onClick={() => setShowDatePicker(true)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 flex items-center transition-colors shadow-sm"
            >
              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
              {dateRange.start && dateRange.end
                ? `${format(dateRange.start, 'MMM d')} - ${format(dateRange.end, 'MMM d')}`
                : 'Select dates'}
            </button>
          </div>
        </div>

        <OverviewStats stats={mockOverviewStats} />

        <PerformanceCharts
          tokenizationData={mockTokenizationPerfData}
          detokenizationData={mockDetokenizationPerfData}
        />

        <EntriesChart data={mockChartData} />

        <div className="flex flex-col xl:flex-row gap-6 mb-6 items-start">
          <MerchantsList merchants={mockMerchants} />
          <TokenActivity stats={mockTokenActivityStats} />
        </div>

        <OtherActivities
          topMerchant={mockTopMerchant}
          mostUsedToken={mockMostUsedToken}
          fraudDetection={mockFraudDetection}
        />

        <RecentTransactions initialTransactions={mockTransactions} />
      </div>

      <DatePicker
        key={showDatePicker ? 'open' : 'closed'}
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        startDate={dateRange.start}
        endDate={dateRange.end}
        onApply={(start, end) => setDateRange({ start, end })}
      />
    </Layout>
  );
}

export default App;
