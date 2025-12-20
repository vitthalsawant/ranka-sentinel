import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Building2, Users, AlertTriangle, Search, MoreVertical, Settings, Loader2, UserPlus, Clock } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { getDummyUsers } from '@/contexts/MockAuthContext';

interface CustomerProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  created_at: string;
  is_approved: boolean;
  company_id: string | null;
}

interface Company {
  id: string;
  name: string;
  contact_email: string;
  contact_phone: string | null;
  address: string | null;
  is_active: boolean;
  created_at: string;
}

const AdminDashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const [activeTab, setActiveTab] = useState<'companies' | 'registrations'>('registrations');
  const [registrationFilter, setRegistrationFilter] = useState<'all' | 'pending' | 'approved'>('all');

  useEffect(() => {
    // Load mock data
    fetchCustomers();
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setIsLoadingCompanies(true);
      
      // Get customers and convert them to companies (customers ARE companies)
      const dummyUsers = getDummyUsers();
      const customerUsers = dummyUsers.filter(u => u.role === 'customer');
      
      // Map customers to companies format
      const mockCompanies: Company[] = customerUsers.map((user, index) => ({
        id: `company-${index + 1}`,
        name: user.fullName, // Company name is the customer name
        contact_email: user.email,
        contact_phone: user.phone || null,
        address: `${index + 1}${index === 0 ? '23 Business Street' : index === 1 ? '56 Corporate Avenue' : '89 Business Park'}, ${index === 0 ? 'Mumbai' : index === 1 ? 'Delhi' : 'Bangalore'}`,
        is_active: true,
        created_at: user.createdAt.toISOString(),
      }));
      
      setCompanies(mockCompanies);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load companies');
    } finally {
      setIsLoadingCompanies(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      
      // Get dummy users and filter for customers (these are companies)
      const dummyUsers = getDummyUsers();
      const customerUsers = dummyUsers.filter(u => u.role === 'customer');
      
      // Map customers to companies format (customers ARE companies)
      const mappedCustomers: CustomerProfile[] = customerUsers.map((user, index) => ({
        id: user.id,
        full_name: user.fullName,
        email: user.email,
        phone: user.phone || null,
        created_at: user.createdAt.toISOString(),
        is_approved: true,
        company_id: `company-${index + 1}`,
      }));
      
      setCustomers(mappedCustomers);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load companies');
    } finally {
      setIsLoading(false);
    }
  };


  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.contact_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.contact_phone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCompanies = companies.filter(c => c.is_active).length;
  const pendingRegistrations = customers.filter(c => !c.is_approved).length;
  const recentRegistrations = [...customers]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);
  
  const filteredRegistrations = registrationFilter === 'all' 
    ? recentRegistrations 
    : recentRegistrations.filter(c => 
        registrationFilter === 'pending' ? !c.is_approved : c.is_approved
      );


  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">View and manage company registrations</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setActiveTab('registrations')}
            className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'registrations'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Registrations
            {pendingRegistrations > 0 && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-orange-500/20 text-orange-500">
                {pendingRegistrations}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('companies')}
            className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'companies'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Companies
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg gold-gradient flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-background" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{customers.length}</p>
                  <p className="text-xs text-muted-foreground">Total Registrations</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{companies.length}</p>
                  <p className="text-xs text-muted-foreground">Total Companies</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeCompanies}</p>
                  <p className="text-xs text-muted-foreground">Active Companies</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{customers.length}</p>
                  <p className="text-xs text-muted-foreground">Registrations</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={
                activeTab === 'registrations' ? 'Search registrations...' : 
                'Search companies...'
              }
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {activeTab === 'registrations' && (
            <div className="flex gap-2">
              <Button
                variant={registrationFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRegistrationFilter('all')}
              >
                All
              </Button>
              <Button
                variant={registrationFilter === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRegistrationFilter('pending')}
              >
                Pending
              </Button>
              <Button
                variant={registrationFilter === 'approved' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRegistrationFilter('approved')}
              >
                Approved
              </Button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {(isLoading && activeTab === 'registrations') || (isLoadingCompanies && activeTab === 'companies') ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : activeTab === 'registrations' ? (
          /* Registrations Tab */
          filteredRegistrations.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="p-12 text-center">
                <UserPlus className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {searchQuery ? 'No registrations found matching your search.' : 'No registrations yet.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRegistrations
                  .filter(reg => 
                    reg.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    reg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    reg.phone?.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((customer) => (
                  <Card 
                    key={customer.id} 
                    className={`glass-card hover-lift transition-all ${!customer.is_approved ? 'border-orange-500/50' : ''}`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center text-background font-bold text-lg">
                            {customer.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{customer.full_name}</CardTitle>
                            <p className="text-xs text-muted-foreground">{customer.email}</p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={async () => {
                              // Update approval status in mock data
                              const updatedCustomers = customers.map(c => 
                                c.id === customer.id ? { ...c, is_approved: !c.is_approved } : c
                              );
                              setCustomers(updatedCustomers);
                              toast.success(`Registration ${customer.is_approved ? 'unapproved' : 'approved'}`);
                            }}>
                              <Settings className="w-4 h-4 mr-2" />
                              {customer.is_approved ? 'Unapprove' : 'Approve'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Phone:</span>
                          <span>{customer.phone || 'Not provided'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Registered:</span>
                          <span>{new Date(customer.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Time:</span>
                          <span>{new Date(customer.created_at).toLocaleTimeString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded-full text-xs ${customer.is_approved ? 'bg-green-500/20 text-green-500' : 'bg-orange-500/20 text-orange-500'}`}>
                          {customer.is_approved ? 'Approved' : 'Pending Approval'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        ) : (
          /* Companies Tab */
          filteredCompanies.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="p-12 text-center">
                <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {searchQuery ? 'No companies found matching your search.' : 'No companies registered yet.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompanies.map((company) => (
                <Card 
                  key={company.id} 
                  className={`glass-card hover-lift transition-all ${!company.is_active ? 'opacity-75' : ''}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{company.name}</CardTitle>
                          <p className="text-xs text-muted-foreground">{company.contact_email}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={async () => {
                            // Update company status in mock data
                            const updatedCompanies = companies.map(c => 
                              c.id === company.id ? { ...c, is_active: !c.is_active } : c
                            );
                            setCompanies(updatedCompanies);
                            toast.success(`Company ${company.is_active ? 'deactivated' : 'activated'}`);
                          }}>
                            <Settings className="w-4 h-4 mr-2" />
                            {company.is_active ? 'Deactivate' : 'Activate'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Phone:</span>
                        <span>{company.contact_phone || 'Not provided'}</span>
                      </div>
                      {company.address && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Address:</span>
                          <span className="truncate">{company.address}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Created:</span>
                        <span>{new Date(company.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs ${company.is_active ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}`}>
                        {company.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
