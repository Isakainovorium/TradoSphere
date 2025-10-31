'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Link2,
  TrendingUp,
  Zap,
  Shield,
  Rocket,
  Bitcoin,
  Loader2,
  RefreshCw,
  Plus,
  Info,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { BrokerCard, type BrokerConnection } from '@/components/broker/broker-card';
import {
  MTConnectionModal,
  type MTConnectionData,
} from '@/components/broker/mt-connection-modal';

// =====================================================
// BROKER METADATA
// =====================================================

const BROKERS = [
  {
    name: 'tradovate',
    displayName: 'Tradovate',
    authType: 'oauth' as const,
    description: 'Professional futures trading platform with low latency execution',
    supportedAssets: ['Futures', 'Commodities', 'Indices'],
    features: ['Low latency', 'Advanced charts', 'Mobile trading', 'Free data'],
    gradient: 'from-blue-500 to-cyan-500',
    icon: TrendingUp,
  },
  {
    name: 'binance',
    displayName: 'Binance',
    authType: 'oauth' as const,
    description: "World's largest cryptocurrency exchange with deep liquidity",
    supportedAssets: ['Crypto', 'Spot', 'Futures', 'Options'],
    features: ['Low fees', 'High liquidity', 'Staking', 'Advanced trading'],
    gradient: 'from-yellow-500 to-orange-500',
    icon: Bitcoin,
  },
  {
    name: 'ninjatrader',
    displayName: 'NinjaTrader',
    authType: 'oauth' as const,
    description: 'Advanced platform for futures, forex, and stock trading',
    supportedAssets: ['Futures', 'Forex', 'Stocks', 'Options'],
    features: ['Automated trading', 'Backtesting', 'Advanced analytics', 'Custom indicators'],
    gradient: 'from-purple-500 to-pink-500',
    icon: Rocket,
  },
  {
    name: 'rhythmic',
    displayName: 'Rhythmic',
    authType: 'oauth' as const,
    description: 'High-performance futures trading infrastructure',
    supportedAssets: ['Futures', 'Forex', 'Commodities'],
    features: ['Ultra-low latency', 'Professional tools', 'Market data'],
    gradient: 'from-green-500 to-emerald-500',
    icon: Zap,
  },
  {
    name: 'tradelocker',
    displayName: 'TradeLocker',
    authType: 'oauth' as const,
    description: 'Modern multi-asset trading platform',
    supportedAssets: ['Forex', 'Stocks', 'Crypto', 'Commodities'],
    features: ['Social trading', 'Copy trading', 'Multi-account', 'Web-based'],
    gradient: 'from-indigo-500 to-blue-500',
    icon: Link2,
  },
  {
    name: 'mt4',
    displayName: 'MetaTrader 4',
    authType: 'credentials' as const,
    description: 'Industry-standard forex and CFD trading platform',
    supportedAssets: ['Forex', 'CFDs', 'Metals', 'Indices'],
    features: ['Expert Advisors', 'Custom indicators', 'MQL4 support', 'Mobile trading'],
    gradient: 'from-red-500 to-orange-500',
    icon: Shield,
  },
  {
    name: 'mt5',
    displayName: 'MetaTrader 5',
    authType: 'credentials' as const,
    description: 'Advanced multi-asset trading platform',
    supportedAssets: ['Forex', 'Stocks', 'Futures', 'Options'],
    features: ['Multi-threading', 'MQL5 support', 'Economic calendar', 'Advanced orders'],
    gradient: 'from-orange-500 to-red-500',
    icon: Shield,
  },
];

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function BrokerDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, loading: userLoading } = useUser();

  const [connections, setConnections] = useState<BrokerConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingBroker, setConnectingBroker] = useState<string | null>(null);
  const [mtModalOpen, setMtModalOpen] = useState(false);
  const [selectedMTPlatform, setSelectedMTPlatform] = useState<'mt4' | 'mt5'>('mt4');
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Handle OAuth callback success/error
  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    const broker = searchParams.get('broker');

    if (success === 'true' && broker) {
      showNotification('success', `Successfully connected to ${broker}!`);
      // Clean URL
      router.replace('/broker');
    } else if (error) {
      showNotification('error', `Connection failed: ${error}`);
      // Clean URL
      router.replace('/broker');
    }
  }, [searchParams]);

  // Fetch connections
  useEffect(() => {
    if (user) {
      fetchConnections();
    }
  }, [user]);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/broker/connections', {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to fetch connections');

      const data = await response.json();
      setConnections(data.connections || []);
    } catch (error) {
      console.error('Error fetching connections:', error);
      showNotification('error', 'Failed to load broker connections');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Handle OAuth connection
  const handleOAuthConnect = async (brokerName: string) => {
    try {
      setConnectingBroker(brokerName);

      const response = await fetch(`/api/broker/connect/${brokerName}`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to initiate connection');

      const data = await response.json();

      // Redirect to broker's OAuth page
      window.location.href = data.authorizationUrl;
    } catch (error) {
      console.error('Error connecting broker:', error);
      showNotification('error', `Failed to connect to ${brokerName}`);
      setConnectingBroker(null);
    }
  };

  // Handle MT4/MT5 connection
  const handleMTConnect = async (data: MTConnectionData) => {
    try {
      setConnectingBroker(data.platform);

      const response = await fetch('/api/broker/connect/mt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Connection failed');
      }

      showNotification('success', `Successfully connected to ${data.platform.toUpperCase()}!`);
      setMtModalOpen(false);
      fetchConnections();
    } catch (error: any) {
      console.error('Error connecting MT:', error);
      showNotification('error', error.message || 'Failed to connect');
    } finally {
      setConnectingBroker(null);
    }
  };

  const handleDisconnect = async (connectionId: string) => {
    if (!confirm('Are you sure you want to disconnect this broker?')) return;

    try {
      const response = await fetch(`/api/broker/disconnect/${connectionId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to disconnect');

      showNotification('success', 'Broker disconnected successfully');
      fetchConnections();
    } catch (error) {
      console.error('Error disconnecting broker:', error);
      showNotification('error', 'Failed to disconnect broker');
    }
  };

  const handleRefresh = async (connectionId: string) => {
    try {
      const response = await fetch(`/api/broker/refresh/${connectionId}`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to refresh connection');

      showNotification('success', 'Connection refreshed successfully');
      fetchConnections();
    } catch (error) {
      console.error('Error refreshing connection:', error);
      showNotification('error', 'Failed to refresh connection');
    }
  };

  const handleConnect = (brokerName: string, authType: 'oauth' | 'credentials') => {
    if (authType === 'oauth') {
      handleOAuthConnect(brokerName);
    } else {
      setSelectedMTPlatform(brokerName as 'mt4' | 'mt5');
      setMtModalOpen(true);
    }
  };

  // Redirect if not authenticated
  if (!userLoading && !user) {
    router.push('/login?redirect=/broker');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-purple-950">
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed left-1/2 top-6 z-50 flex items-center gap-3 rounded-xl border border-white/10 bg-gradient-dark-glass px-6 py-4 shadow-glass-dark backdrop-blur-xl"
          >
            {notification.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-profit" />
            ) : (
              <AlertCircle className="h-5 w-5 text-loss" />
            )}
            <p
              className={`text-sm font-medium ${notification.type === 'success' ? 'text-profit' : 'text-loss'}`}
            >
              {notification.message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="border-b border-white/10 bg-gradient-dark-glass backdrop-blur-xl">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-signal shadow-glow-md">
                  <Link2 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white">Broker Connections</h1>
                  <p className="mt-1 text-gray-400">
                    Connect your trading accounts to sync positions and automate trading
                  </p>
                </div>
              </motion.div>
            </div>

            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fetchConnections()}
              className="flex items-center gap-2 rounded-xl bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur-xl transition-all hover:bg-white/20"
            >
              <RefreshCw className="h-5 w-5" />
              Refresh All
            </motion.button>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-8 grid grid-cols-3 gap-4"
          >
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
              <div className="text-3xl font-bold text-white">
                {connections.filter((c) => c.status === 'connected').length}
              </div>
              <div className="text-sm text-gray-400">Connected</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
              <div className="text-3xl font-bold text-white">{BROKERS.length}</div>
              <div className="text-sm text-gray-400">Available Brokers</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
              <div className="text-3xl font-bold text-white">
                {connections.reduce((acc, c) => acc + (c.accounts?.length || 0), 0)}
              </div>
              <div className="text-sm text-gray-400">Trading Accounts</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-blue-400" />
            <p className="mt-4 text-gray-400">Loading broker connections...</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {BROKERS.map((broker, index) => {
              const connection = connections.find((c) => c.brokerName === broker.name);

              return (
                <motion.div
                  key={broker.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <BrokerCard
                    broker={broker}
                    connection={connection}
                    onConnect={() => handleConnect(broker.name, broker.authType)}
                    onDisconnect={handleDisconnect}
                    onRefresh={handleRefresh}
                    isConnecting={connectingBroker === broker.name}
                  />
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-6 backdrop-blur-xl"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20">
              <Info className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">About Broker Connections</h3>
              <p className="mt-2 text-sm text-gray-300">
                Connecting your broker allows TradoSphere to sync your positions, track performance,
                and enable automated trading features. All credentials are encrypted with AES-256
                and stored securely. OAuth connections are refreshed automatically.
              </p>
              <p className="mt-2 text-sm text-gray-400">
                <strong>MT4/MT5:</strong> Requires local bridge software (download from settings) or
                MetaAPI.cloud free tier.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* MT Connection Modal */}
      <MTConnectionModal
        isOpen={mtModalOpen}
        onClose={() => setMtModalOpen(false)}
        onSubmit={handleMTConnect}
        platform={selectedMTPlatform}
        isConnecting={connectingBroker !== null}
      />
    </div>
  );
}
