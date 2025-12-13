import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DataMorphosisLogo } from '@/components/DataMorphosisLogo';
import { Brain, Shield, Users, Sparkles, Database, BarChart3, Cloud, Cpu } from 'lucide-react';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        </div>

        {/* Navigation */}
        <nav className="relative z-10 container mx-auto px-6 py-6 flex items-center justify-between">
          <DataMorphosisLogo variant="color" />
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" className="text-foreground hover:text-primary">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="gold" size="lg">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-6 py-24 text-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">AI-Powered Security Solutions</span>
            </div>
          </div>
          
          <h1 className="animate-slide-up font-display text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            Transform Your
            <span className="gold-text block mt-2">Business Security</span>
          </h1>
          
          <p className="animate-slide-up text-xl text-muted-foreground max-w-2xl mx-auto mb-12" style={{ animationDelay: '0.1s' }}>
            Advanced AI-powered surveillance and analytics platform 
            for enterprise security management and business intelligence.
          </p>
          
          <div className="animate-slide-up flex flex-col sm:flex-row gap-4 justify-center" style={{ animationDelay: '0.2s' }}>
            <Link to="/register">
              <Button variant="gold" size="xl" className="w-full sm:w-auto">
                <Brain className="w-5 h-5 mr-2" />
                Start Free Trial
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="xl" className="w-full sm:w-auto">
                Access Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Services Section */}
      <section className="container mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Our Services
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Comprehensive technology solutions powered by AI and data analytics.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {[
            { icon: Brain, title: 'Machine Learning', description: 'AI-driven insights and automation' },
            { icon: Database, title: 'Big Data', description: 'Scalable data processing solutions' },
            { icon: BarChart3, title: 'Analytics', description: 'Real-time business intelligence' },
            { icon: Cloud, title: 'Cloud Services', description: 'Secure cloud infrastructure' },
          ].map((service, index) => (
            <div
              key={service.title}
              className="glass-card rounded-xl p-6 text-center hover-lift animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-lg gold-gradient flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
                <service.icon className="w-6 h-6 text-background" />
              </div>
              <h3 className="font-semibold mb-2">{service.title}</h3>
              <p className="text-sm text-muted-foreground">{service.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Dashboard Features Section */}
      <section className="container mx-auto px-6 py-24 border-t border-border">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Security Management Platform
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Three-tier dashboard system tailored for every role in your organization.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Cpu,
              title: 'Customer Portal',
              description: 'Personalized experience with service history, analytics access, and support tickets.',
              theme: 'Self-service analytics',
            },
            {
              icon: Users,
              title: 'Employee Hub',
              description: 'Task management, monitoring dashboards, and internal communications for your team.',
              theme: 'Operational efficiency',
            },
            {
              icon: Shield,
              title: 'Admin Control',
              description: 'Complete oversight with AI-powered security, camera management, and detection analytics.',
              theme: 'Full system control',
            },
          ].map((feature, index) => (
            <div
              key={feature.title}
              className="glass-card rounded-2xl p-8 hover-lift animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-14 h-14 rounded-xl gold-gradient flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
                <feature.icon className="w-7 h-7 text-background" />
              </div>
              <h3 className="font-display text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground mb-4">{feature.description}</p>
              <span className="text-xs text-primary font-medium">{feature.theme}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-24">
        <div className="glass-card rounded-3xl p-12 md:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 gold-gradient opacity-5" />
          <div className="relative z-10">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Security?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Join leading enterprises using Datamorphosis for intelligent 
              security and business analytics solutions.
            </p>
            <Link to="/register">
              <Button variant="gold" size="xl">
                Get Started Today
                <Sparkles className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <DataMorphosisLogo variant="color" />
            <p className="text-sm text-muted-foreground">
              © 2024 Datamorphosis. Transforming Data Into Intelligence.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
