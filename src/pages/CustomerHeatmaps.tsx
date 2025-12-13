import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Map, Activity, Clock, Calendar, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from 'recharts';

// Mock heatmap zones data
const ZONE_DATA = [
  { zone: 'Main Entrance', visits: 450, avgTime: '2 min', density: 85 },
  { zone: 'Showroom A', visits: 320, avgTime: '8 min', density: 72 },
  { zone: 'Showroom B', visits: 280, avgTime: '6 min', density: 65 },
  { zone: 'Display Counter 1', visits: 180, avgTime: '12 min', density: 90 },
  { zone: 'Display Counter 2', visits: 145, avgTime: '10 min', density: 78 },
  { zone: 'Checkout Area', visits: 210, avgTime: '5 min', density: 55 },
  { zone: 'VIP Lounge', visits: 45, avgTime: '25 min', density: 30 },
];

const HOURLY_DENSITY = [
  { hour: '9AM', entrance: 25, showroomA: 15, showroomB: 10, checkout: 5 },
  { hour: '10AM', entrance: 45, showroomA: 30, showroomB: 22, checkout: 18 },
  { hour: '11AM', entrance: 60, showroomA: 48, showroomB: 35, checkout: 28 },
  { hour: '12PM', entrance: 75, showroomA: 62, showroomB: 50, checkout: 45 },
  { hour: '1PM', entrance: 55, showroomA: 45, showroomB: 38, checkout: 32 },
  { hour: '2PM', entrance: 80, showroomA: 68, showroomB: 55, checkout: 48 },
  { hour: '3PM', entrance: 95, showroomA: 82, showroomB: 68, checkout: 60 },
  { hour: '4PM', entrance: 70, showroomA: 58, showroomB: 45, checkout: 42 },
  { hour: '5PM', entrance: 58, showroomA: 45, showroomB: 35, checkout: 38 },
  { hour: '6PM', entrance: 40, showroomA: 32, showroomB: 25, checkout: 28 },
];

// Scatter plot data for foot traffic
const FOOT_TRAFFIC = [
  { x: 10, y: 30, z: 200 },
  { x: 30, y: 50, z: 350 },
  { x: 50, y: 20, z: 150 },
  { x: 70, y: 60, z: 450 },
  { x: 20, y: 70, z: 280 },
  { x: 60, y: 40, z: 320 },
  { x: 80, y: 80, z: 180 },
  { x: 40, y: 35, z: 420 },
  { x: 55, y: 55, z: 290 },
  { x: 25, y: 45, z: 380 },
];

const CustomerHeatmaps: React.FC = () => {
  const [selectedCamera, setSelectedCamera] = useState('all');
  const [timeRange, setTimeRange] = useState('today');

  const getDensityColor = (density: number) => {
    if (density >= 80) return 'bg-red-500';
    if (density >= 60) return 'bg-orange-500';
    if (density >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getDensityLabel = (density: number) => {
    if (density >= 80) return 'High';
    if (density >= 60) return 'Medium';
    if (density >= 40) return 'Low';
    return 'Very Low';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">Heatmaps & Traffic</h1>
            <p className="text-muted-foreground">Visualize foot traffic and crowd density patterns</p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedCamera} onValueChange={setSelectedCamera}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select Camera" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cameras</SelectItem>
                <SelectItem value="entrance">Main Entrance</SelectItem>
                <SelectItem value="showroom-a">Showroom A</SelectItem>
                <SelectItem value="showroom-b">Showroom B</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="zones" className="space-y-6">
          <TabsList className="bg-secondary/50">
            <TabsTrigger value="zones">Zone Analysis</TabsTrigger>
            <TabsTrigger value="density">Density Over Time</TabsTrigger>
            <TabsTrigger value="traffic">Foot Traffic Map</TabsTrigger>
          </TabsList>

          {/* Zone Analysis Tab */}
          <TabsContent value="zones" className="space-y-6">
            {/* Visual Heatmap Grid */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Map className="w-5 h-5" />
                  Store Layout Heatmap
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2 mb-6">
                  {/* Simplified store layout heatmap visualization */}
                  <div className="col-span-4 grid grid-cols-4 gap-2">
                    <div className="aspect-square rounded-lg bg-red-500/80 flex items-center justify-center text-white text-xs font-medium p-2 text-center">
                      Main Entrance<br />85%
                    </div>
                    <div className="col-span-2 aspect-video rounded-lg bg-orange-500/70 flex items-center justify-center text-white text-xs font-medium">
                      Showroom A - 72%
                    </div>
                    <div className="aspect-square rounded-lg bg-yellow-500/60 flex items-center justify-center text-white text-xs font-medium p-2 text-center">
                      VIP<br />30%
                    </div>
                  </div>
                  <div className="col-span-2 aspect-video rounded-lg bg-red-500/90 flex items-center justify-center text-white text-xs font-medium">
                    Display Counter 1 - 90%
                  </div>
                  <div className="col-span-2 aspect-video rounded-lg bg-orange-500/75 flex items-center justify-center text-white text-xs font-medium">
                    Display Counter 2 - 78%
                  </div>
                  <div className="col-span-2 aspect-video rounded-lg bg-yellow-500/65 flex items-center justify-center text-white text-xs font-medium">
                    Showroom B - 65%
                  </div>
                  <div className="col-span-2 aspect-video rounded-lg bg-green-500/55 flex items-center justify-center text-white text-xs font-medium">
                    Checkout Area - 55%
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-500" />
                    <span>High (80%+)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-orange-500" />
                    <span>Medium (60-80%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-yellow-500" />
                    <span>Low (40-60%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-500" />
                    <span>Very Low (&lt;40%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Zone Stats Table */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Zone Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Zone</th>
                        <th className="text-right py-3 px-4 font-medium text-muted-foreground">Visits</th>
                        <th className="text-right py-3 px-4 font-medium text-muted-foreground">Avg. Time</th>
                        <th className="text-right py-3 px-4 font-medium text-muted-foreground">Density</th>
                        <th className="text-center py-3 px-4 font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ZONE_DATA.map((zone) => (
                        <tr key={zone.zone} className="border-b border-border/50 hover:bg-secondary/30">
                          <td className="py-3 px-4 font-medium">{zone.zone}</td>
                          <td className="py-3 px-4 text-right">{zone.visits}</td>
                          <td className="py-3 px-4 text-right">{zone.avgTime}</td>
                          <td className="py-3 px-4 text-right">{zone.density}%</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${getDensityColor(zone.density)}`} />
                              <span className="text-sm">{getDensityLabel(zone.density)}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Density Over Time Tab */}
          <TabsContent value="density" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Crowd Density by Zone (Hourly)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={HOURLY_DENSITY}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Area type="monotone" dataKey="entrance" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.6)" name="Main Entrance" />
                    <Area type="monotone" dataKey="showroomA" stackId="1" stroke="hsl(200, 80%, 50%)" fill="hsl(200, 80%, 50%,0.6)" name="Showroom A" />
                    <Area type="monotone" dataKey="showroomB" stackId="1" stroke="hsl(150, 80%, 45%)" fill="hsl(150, 80%, 45%,0.6)" name="Showroom B" />
                    <Area type="monotone" dataKey="checkout" stackId="1" stroke="hsl(280, 80%, 55%)" fill="hsl(280, 80%, 55%,0.6)" name="Checkout" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Peak Times Summary */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="glass-card">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-primary">3:00 PM</p>
                  <p className="text-sm text-muted-foreground mt-1">Peak Hour</p>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-primary">95</p>
                  <p className="text-sm text-muted-foreground mt-1">Max Density</p>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-primary">9:00 AM</p>
                  <p className="text-sm text-muted-foreground mt-1">Quietest Hour</p>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-primary">52</p>
                  <p className="text-sm text-muted-foreground mt-1">Avg. Density</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Foot Traffic Map Tab */}
          <TabsContent value="traffic" className="space-y-6">
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Map className="w-5 h-5" />
                  Foot Traffic Visualization
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon">
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" dataKey="x" name="X Position" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" />
                    <YAxis type="number" dataKey="y" name="Y Position" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" />
                    <ZAxis type="number" dataKey="z" name="Traffic" range={[100, 500]} />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value, name) => [value, name === 'z' ? 'Traffic Count' : name]}
                    />
                    <Scatter data={FOOT_TRAFFIC} fill="hsl(var(--primary))" fillOpacity={0.7} />
                  </ScatterChart>
                </ResponsiveContainer>
                <p className="text-sm text-muted-foreground text-center mt-4">
                  Bubble size represents traffic volume. Larger bubbles indicate higher foot traffic areas.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default CustomerHeatmaps;
