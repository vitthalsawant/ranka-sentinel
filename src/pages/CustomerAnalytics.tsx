import React, { useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, User, TrendingUp, Clock, Calendar, Download, FileText, Activity, RefreshCw, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { useAnalyticsExport } from '@/hooks/useAnalyticsExport';
import { usePythonAPI } from '@/hooks/usePythonAPI';
import APIConnectionStatus from '@/components/APIConnectionStatus';
import { toast } from 'sonner';

const HOURLY_VISITORS = [
  { hour: '9AM', visitors: 25, male: 14, female: 11 },
  { hour: '10AM', visitors: 42, male: 22, female: 20 },
  { hour: '11AM', visitors: 58, male: 30, female: 28 },
  { hour: '12PM', visitors: 78, male: 42, female: 36 },
  { hour: '1PM', visitors: 65, male: 35, female: 30 },
  { hour: '2PM', visitors: 82, male: 44, female: 38 },
  { hour: '3PM', visitors: 95, male: 52, female: 43 },
  { hour: '4PM', visitors: 73, male: 40, female: 33 },
  { hour: '5PM', visitors: 61, male: 33, female: 28 },
  { hour: '6PM', visitors: 48, male: 26, female: 22 },
];

const WEEKLY_VISITORS = [
  { day: 'Mon', visitors: 285, male: 156, female: 129 },
  { day: 'Tue', visitors: 342, male: 189, female: 153 },
  { day: 'Wed', visitors: 398, male: 215, female: 183 },
  { day: 'Thu', visitors: 312, male: 171, female: 141 },
  { day: 'Fri', visitors: 456, male: 248, female: 208 },
  { day: 'Sat', visitors: 523, male: 286, female: 237 },
  { day: 'Sun', visitors: 412, male: 225, female: 187 },
];

// Mock data fallback (used when API is not connected)
const MOCK_VISITOR_DATA = {
  today: 342,
  male: 189,
  female: 153,
  peakHour: '3:00 PM',
};

const AGE_DISTRIBUTION = [
  { age: '18-25', count: 78 },
  { age: '26-35', count: 124 },
  { age: '36-45', count: 86 },
  { age: '46-55', count: 42 },
  { age: '55+', count: 12 },
];

const CustomerAnalytics: React.FC = () => {
  const { analytics, isConnected, error, refreshAll, lastUpdate, isLoading } = usePythonAPI(5000); // 5 second refresh to reduce API load
  const { exportToCSV, exportToPDF } = useAnalyticsExport();

  // Use API data if connected, otherwise use mock data
  const visitorData = useMemo(() => {
    if (isConnected && analytics) {
      const personCounting = analytics.person_counting;
      const hourlyFootTraffic = personCounting?.hourly_foot_traffic || {};
      
      // Find peak hour from hourly foot traffic
      let peakHour = 'N/A';
      let peakValue = 0;
      Object.entries(hourlyFootTraffic).forEach(([hour, count]) => {
        if (typeof count === 'number' && count > peakValue) {
          peakValue = count;
          peakHour = hour;
        }
      });

      return {
        today: analytics.total_visitors || 0,
        male: analytics.male_count || 0,
        female: analytics.female_count || 0,
        currentOccupancy: analytics.current_occupancy || 0,
        totalCount: personCounting?.total_count || 0,
        peakOccupancy: personCounting?.peak_occupancy || 0,
        peakTime: personCounting?.peak_time || null,
        peakHour: peakHour,
        entriesToday: personCounting?.entries_today || 0,
        exitsToday: personCounting?.exits_today || 0,
      };
    }
    return {
      today: MOCK_VISITOR_DATA.today,
      male: MOCK_VISITOR_DATA.male,
      female: MOCK_VISITOR_DATA.female,
      currentOccupancy: 0,
      totalCount: 0,
      peakOccupancy: 0,
      peakTime: null,
      peakHour: MOCK_VISITOR_DATA.peakHour,
      entriesToday: 0,
      exitsToday: 0,
    };
  }, [analytics, isConnected]);

  // Transform API hourly data for charts
  const hourlyVisitorsData = useMemo(() => {
    if (isConnected && analytics?.person_counting?.hourly_foot_traffic) {
      const hourlyData = analytics.person_counting.hourly_foot_traffic;
      const entries = Object.entries(hourlyData)
        .map(([hour, count]) => {
          const countNum = typeof count === 'number' ? count : 0;
          const maleRatio = analytics.male_count / (analytics.male_count + analytics.female_count || 1) || 0.55;
          const femaleRatio = analytics.female_count / (analytics.male_count + analytics.female_count || 1) || 0.45;
          
          return {
            hour: hour.replace(':00', ''),
            visitors: countNum,
            male: Math.floor(countNum * maleRatio),
            female: Math.floor(countNum * femaleRatio),
          };
        })
        .sort((a, b) => {
          // Sort by hour (convert to 24h format for comparison)
          const hourA = parseInt(a.hour.replace(/\D/g, '')) || 0;
          const hourB = parseInt(b.hour.replace(/\D/g, '')) || 0;
          return hourA - hourB;
        });
      
      // Return last 12 hours or all if less than 12
      return entries.length > 12 ? entries.slice(-12) : entries;
    }
    return HOURLY_VISITORS;
  }, [analytics, isConnected]);

  // Transform age distribution from API
  const ageDistributionData = useMemo(() => {
    if (isConnected && analytics?.age_distribution) {
      const ageMap: Record<string, string> = {
        '0-18': '0-18',
        '19-30': '19-30',
        '31-45': '31-45',
        '46-60': '46-60',
        '60+': '60+',
      };
      
      return Object.entries(analytics.age_distribution)
        .map(([age, count]) => ({
          age: ageMap[age] || age,
          count: typeof count === 'number' ? count : 0,
        }))
        .filter(item => item.count > 0) // Only show age groups with data
        .sort((a, b) => {
          // Sort by age range
          const order = ['0-18', '19-30', '31-45', '46-60', '60+'];
          return order.indexOf(a.age) - order.indexOf(b.age);
        });
    }
    return AGE_DISTRIBUTION;
  }, [analytics, isConnected]);

  // Generate weekly trend from hourly data or use mock
  const weeklyVisitorsData = useMemo(() => {
    if (isConnected && analytics?.person_counting?.hourly_foot_traffic) {
      // Generate weekly trend from current day's data
      // For demo purposes, we'll use mock data but could be enhanced with historical data
      const todayTotal = analytics.total_visitors || 0;
      const baseMultiplier = todayTotal / 342; // Normalize to mock data scale
      
      return WEEKLY_VISITORS.map(day => ({
        ...day,
        visitors: Math.round(day.visitors * baseMultiplier),
        male: Math.round(day.male * baseMultiplier),
        female: Math.round(day.female * baseMultiplier),
      }));
    }
    return WEEKLY_VISITORS;
  }, [analytics, isConnected]);

  // Gender data for pie chart
  const genderData = useMemo(() => [
    { name: 'Male', value: visitorData.male, color: 'hsl(220, 80%, 60%)' },
    { name: 'Female', value: visitorData.female, color: 'hsl(330, 80%, 60%)' },
  ], [visitorData]);

  const handleExportCSV = () => {
    exportToCSV({
      visitorData: {
        today: visitorData.today,
        male: visitorData.male,
        female: visitorData.female,
        vipCount: 0,
        avgDwellTime: 'N/A',
        peakHour: visitorData.peakHour,
      },
      hourlyVisitors: hourlyVisitorsData,
      weeklyVisitors: WEEKLY_VISITORS,
      ageDistribution: ageDistributionData,
    });
    toast.success('CSV report downloaded successfully');
  };

  const handleExportPDF = () => {
    exportToPDF({
      visitorData: {
        today: visitorData.today,
        male: visitorData.male,
        female: visitorData.female,
        vipCount: 0,
        avgDwellTime: 'N/A',
        peakHour: visitorData.peakHour,
      },
      hourlyVisitors: hourlyVisitorsData,
      weeklyVisitors: WEEKLY_VISITORS,
      ageDistribution: ageDistributionData,
    });
    toast.success('PDF report downloaded successfully');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-3xl font-bold">Analytics</h1>
              {isLoading && (
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              )}
            </div>
            <p className="text-muted-foreground">
              Visitor insights and counting statistics
              {lastUpdate && isConnected && (
                <span className="ml-2 text-xs">
                  • Last updated: {lastUpdate.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={refreshAll} 
              className="gap-2"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" onClick={handleExportCSV} className="gap-2">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
            <Button variant="gold" onClick={handleExportPDF} className="gap-2">
              <FileText className="w-4 h-4" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* API Connection Status */}
        <APIConnectionStatus 
          isConnected={isConnected} 
          error={error} 
          onRefresh={refreshAll} 
        />

        {/* Quick Stats - Matching Dashboard Style */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="glass-card border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{visitorData.today}</p>
                  <p className="text-xs text-muted-foreground">Total Visitors</p>
                  {isConnected && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      Live
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{visitorData.male}</p>
                  <p className="text-xs text-muted-foreground">Male Visitors</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-pink-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-pink-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{visitorData.female}</p>
                  <p className="text-xs text-muted-foreground">Female Visitors</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{visitorData.currentOccupancy}</p>
                  <p className="text-xs text-muted-foreground">Current Occupancy</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Person Counting Stats */}
        {isConnected && analytics?.person_counting && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{visitorData.totalCount}</p>
                    <p className="text-xs text-muted-foreground">Total Count</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{visitorData.peakOccupancy}</p>
                    <p className="text-xs text-muted-foreground">Peak Occupancy</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-cyan-500" />
                  </div>
                  <div>
                    <p className="text-lg font-bold">{visitorData.peakHour}</p>
                    <p className="text-xs text-muted-foreground">Peak Hour</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{visitorData.entriesToday}</p>
                    <p className="text-xs text-muted-foreground">Entries Today</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts Row 1 */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Hourly Visitors */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Hourly Visitor Count
                {isConnected && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    Live Data
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hourlyVisitorsData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={hourlyVisitorsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="hour" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Legend />
                    <Bar dataKey="visitors" fill="hsl(var(--primary))" name="Total Visitors" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="male" fill="hsl(220, 80%, 60%)" name="Male" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="female" fill="hsl(330, 80%, 60%)" name="Female" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  <div className="text-center">
                    <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No hourly data available</p>
                    <p className="text-sm">Data will appear as detection runs</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gender Distribution */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Gender Distribution
                {isConnected && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    Live Data
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {genderData.some(item => item.value > 0) ? (
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={300} key={`gender-${genderData[0]?.value}-${genderData[1]?.value}-${lastUpdate?.getTime()}`}>
                    <PieChart>
                      <Pie
                        data={genderData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent, value }) => 
                          value > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''
                        }
                      >
                        {genderData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value: number) => [`${value} visitors`, 'Count']}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  <div className="text-center">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No gender data available</p>
                    <p className="text-sm">Data will appear as detection runs</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Weekly Trend */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Weekly Visitor Trend
                {isConnected && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    Estimated
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300} key={`weekly-${weeklyVisitorsData[0]?.visitors}-${lastUpdate?.getTime()}`}>
                <LineChart data={weeklyVisitorsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Legend />
                  <Line type="monotone" dataKey="visitors" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: 'hsl(var(--primary))' }} />
                  <Line type="monotone" dataKey="male" stroke="hsl(220, 80%, 60%)" strokeWidth={2} dot={{ fill: 'hsl(220, 80%, 60%)' }} />
                  <Line type="monotone" dataKey="female" stroke="hsl(330, 80%, 60%)" strokeWidth={2} dot={{ fill: 'hsl(330, 80%, 60%)' }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Age Distribution */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Age Distribution
                {isConnected && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    Live Data
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ageDistributionData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300} key={`age-${ageDistributionData.length}-${lastUpdate?.getTime()}`}>
                  <BarChart data={ageDistributionData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis dataKey="age" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [`${value} visitors`, 'Count']}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  <div className="text-center">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No age distribution data available</p>
                    <p className="text-sm">Data will appear as detection runs</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CustomerAnalytics;
