import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bell,
  History,
  PieChart,
  AlertOctagon,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const LandingPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
  };

  const features = [
    {
      title: 'Smart Reminders',
      description:
        'Get automated notifications before your bills are due. Never miss a billing cycle again.',
      icon: Bell,
      color: 'text-c-accent bg-c-success-bg',
    },
    {
      title: 'Detailed History',
      description:
        'Review your complete historical records of receipts, dates, and amounts in a beautiful list.',
      icon: History,
      color: 'text-c-success-text bg-c-success-bg',
    },
    {
      title: 'Category Breakdown',
      description:
        'Understand exactly where your funds go with automated charts and distribution views.',
      icon: PieChart,
      color: 'text-c-warning-text bg-c-warning-bg',
    },
    {
      title: 'Overdue Warnings',
      description:
        'Actionable real-time visual alerts highlighting accounts that require immediate attention.',
      icon: AlertOctagon,
      color: 'text-[#C6461E] bg-[#C6461E]/10',
    },
  ];

  const steps = [
    {
      num: '01',
      title: 'Register Profile',
      desc: 'Create your account in seconds by providing basic contact info.',
    },
    {
      num: '02',
      title: 'Add Bills',
      desc: 'Register recurring utilities, subscriptions, or credit card bills.',
    },
    {
      num: '03',
      title: 'Track & Pay',
      desc: 'Keep track of amounts paid, track history, and resolve overdue bills.',
    },
  ];

  return (
    <div className="bg-c-bg min-h-screen flex flex-col font-sans text-c-text-primary transition-colors duration-300">
      {/* Header */}
      <header className="px-6 md:px-10 py-5 bg-c-card border-b border-c-border flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-c-accent flex items-center justify-center text-c-accent-text font-bold">
            S
          </div>
          <span className="font-serif font-medium text-lg text-c-text-primary tracking-tight">SmartBill</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            to="/login"
            className="text-sm font-semibold text-c-text-secondary hover:text-c-text-primary px-4 py-2 transition-colors"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="text-sm font-semibold bg-c-accent text-c-accent-text hover:bg-c-accent-hover px-4 py-2 rounded-xl transition-colors shadow-sm"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-6 md:px-10 py-16 md:py-24 text-center max-w-4xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-c-success-bg border border-c-border/40 text-xs font-semibold text-c-success-text"
          >
            <Sparkles size={14} className="animate-pulse text-c-accent" />
            <span>Introducing Smart Bill Manager</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl font-serif font-medium text-c-text-primary leading-tight tracking-tight"
          >
            Track bills, subscriptions & payments in{' '}
            <span className="text-[#C6461E]">
              one unified place
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-c-text-secondary max-w-2xl mx-auto font-medium"
          >
            Manage utilities, monthly subscriptions, and credit card payments. Get real-time charts, due notifications, and historical reports in a single modern interface.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link
              to="/register"
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-c-accent text-c-accent-text hover:bg-c-accent-hover font-semibold px-6 py-3 rounded-xl transition-colors shadow-lg shadow-c-accent/10 hover:scale-[1.02]"
            >
              <span>Get Started Now</span>
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto bg-c-card border border-c-border text-c-text-secondary font-semibold px-6 py-3 rounded-xl hover:bg-c-bg hover:text-c-text-primary transition-colors"
            >
              Sign In
            </Link>
          </motion.div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="px-6 md:px-10 py-16 bg-c-card border-y border-c-border">
          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-3 mb-12">
              <h2 className="text-3xl font-serif font-medium text-c-text-primary tracking-tight">
                Designed to make payments effortless
              </h2>
              <p className="text-c-text-secondary max-w-lg mx-auto text-sm font-medium">
                A simple dashboard backed by robust tools to ensure you maintain complete financial visibility.
              </p>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              className="grid grid-cols-1 md:grid-cols-4 gap-6"
            >
              {features.map((feat) => (
                <motion.div
                  key={feat.title}
                  variants={itemVariants}
                  className="p-6 rounded-xl border border-c-border bg-c-bg/30 hover-lift space-y-4"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${feat.color}`}>
                    <feat.icon size={20} />
                  </div>
                  <h3 className="font-serif font-medium text-c-text-primary text-base">{feat.title}</h3>
                  <p className="text-c-text-secondary text-xs leading-relaxed font-medium">{feat.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* How it works */}
        <section className="px-6 md:px-10 py-16 max-w-6xl mx-auto">
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-3xl font-serif font-medium text-c-text-primary tracking-tight">
              Get running in 3 steps
            </h2>
            <p className="text-c-text-secondary max-w-lg mx-auto text-sm font-medium">
              No complex setup required. Create your profile and start managing your bills immediately.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div
                key={step.num}
                className="relative bg-c-card p-8 rounded-xl border border-c-border shadow-sm space-y-4"
              >
                <span className="text-5xl font-serif font-medium text-c-text-secondary/10 absolute right-6 top-6 leading-none select-none">
                  {step.num}
                </span>
                <h3 className="font-serif font-medium text-c-text-primary text-lg relative z-10">{step.title}</h3>
                <p className="text-c-text-secondary text-sm leading-relaxed font-medium relative z-10">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="px-6 md:px-10 py-8 bg-[#1C3B2E] text-[#C7CFC7] text-xs border-t border-[#2E5142]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-md bg-[#F2EFE6] flex items-center justify-center text-[#1C3B2E] font-bold text-xs">
              S
            </div>
            <span className="font-serif font-medium text-white tracking-tight">SmartBill</span>
          </div>
          <p>© {new Date().getFullYear()} SmartBill & Subscription Manager. All rights reserved.</p>
          <div className="w-8 h-1" />
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
