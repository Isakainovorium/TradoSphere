'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  AlertCircle,
  RefreshCw,
  Power,
  Zap,
  TrendingUp,
  Shield,
  Clock,
  Loader2,
} from 'lucide-react';
import { useState } from 'react';

// =====================================================
// TYPES
// =====================================================

export interface BrokerConnection {
  id: string;
  brokerName: string;
  status: 'connected' | 'disconnected' | 'pending' | 'error' | 'expired';
  accountName?: string;
  isPaper: boolean;
  isPrimary: boolean;
  connectedAt?: string;
  lastSyncedAt?: string;
  expiresAt?: string;
  errorMessage?: string;
  accounts: Array<{
    id: string;
    accountName: string;
    balance: number;
    currency: string;
    isActive: boolean;
  }>;
}

interface BrokerCardProps {
  broker: {
    name: string;
    displayName: string;
    authType: 'oauth' | 'credentials';
    description: string;
    supportedAssets: string[];
    features: string[];
    gradient: string;
    icon: any;
  };
  connection?: BrokerConnection;
  onConnect: () => void;
  onDisconnect: (id: string) => void;
  onRefresh: (id: string) => void;
  isConnecting: boolean;
}

// =====================================================
// BROKER CARD COMPONENT
// =====================================================

export function BrokerCard({
  broker,
  connection,
  onConnect,
  onDisconnect,
  onRefresh,
  isConnecting,
}: BrokerCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const isConnected = connection?.status === 'connected';
  const hasError = connection?.status === 'error' || connection?.status === 'expired';

  const Icon = broker.icon;

  // Get status display
  const getStatusDisplay = () => {
    if (!connection) {
      return {
        label: 'Not Connected',
        color: 'text-gray-400',
        bgColor: 'bg-gray-500/20',
        Icon: Power,
      };
    }

    switch (connection.status) {
      case 'connected':
        return {
          label: 'Connected',
          color: 'text-profit',
          bgColor: 'bg-profit/20',
          Icon: Check,
        };
      case 'pending':
        return {
          label: 'Connecting...',
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/20',
          Icon: Clock,
        };
      case 'error':
        return {
          label: 'Error',
          color: 'text-loss',
          bgColor: 'bg-loss/20',
          Icon: AlertCircle,
        };
      case 'expired':
        return {
          label: 'Expired',
          color: 'text-orange-400',
          bgColor: 'bg-orange-500/20',
          Icon: Clock,
        };
      default:
        return {
          label: 'Disconnected',
          color: 'text-gray-400',
          bgColor: 'bg-gray-500/20',
          Icon: Power,
        };
    }
  };

  const status = getStatusDisplay();
  const StatusIcon = status.Icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-dark-glass backdrop-blur-xl transition-all hover:shadow-glass"
    >
      {/* Gradient Accent Bar */}
      <div className={`h-1.5 bg-gradient-to-r ${broker.gradient}`} />

      {/* Main Content */}
      <div className="p-6">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Icon */}
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${broker.gradient} shadow-glow-md`}
            >
              <Icon className="h-6 w-6 text-white" />
            </motion.div>

            {/* Name & Auth Badge */}
            <div>
              <h3 className="text-lg font-bold text-white">{broker.displayName}</h3>
              <div className="mt-1 flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.bgColor} ${status.color}`}
                >
                  {broker.authType === 'oauth' ? 'OAuth 2.0' : 'Credentials'}
                </span>
                {connection?.isPaper && (
                  <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-xs font-medium text-purple-400">
                    Paper
                  </span>
                )}
                {connection?.isPrimary && (
                  <Shield className="h-3.5 w-3.5 text-yellow-400" />
                )}
              </div>
            </div>
          </div>

          {/* Status Indicator */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className={`flex items-center gap-1.5 rounded-full ${status.bgColor} px-3 py-1.5`}
          >
            <StatusIcon className={`h-4 w-4 ${status.color}`} />
            <span className={`text-sm font-medium ${status.color}`}>
              {status.label}
            </span>
          </motion.div>
        </div>

        {/* Description */}
        <p className="mb-4 text-sm text-gray-400">{broker.description}</p>

        {/* Supported Assets */}
        <div className="mb-4 flex flex-wrap gap-2">
          {broker.supportedAssets.map((asset) => (
            <span
              key={asset}
              className="rounded-lg bg-white/5 px-2.5 py-1 text-xs font-medium text-gray-300"
            >
              {asset}
            </span>
          ))}
        </div>

        {/* Connection Details (if connected) */}
        <AnimatePresence>
          {isConnected && connection?.accounts && connection.accounts.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-4 overflow-hidden"
            >
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <h4 className="mb-2 text-sm font-semibold text-white">Connected Accounts</h4>
                <div className="space-y-2">
                  {connection.accounts.map((account) => (
                    <div
                      key={account.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-gray-300">{account.accountName}</span>
                      <span className="font-mono font-semibold text-white">
                        {account.currency} {account.balance.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Last Synced */}
                {connection.lastSyncedAt && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
                    <Clock className="h-3 w-3" />
                    <span>
                      Synced{' '}
                      {new Date(connection.lastSyncedAt).toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        {hasError && connection?.errorMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 rounded-lg border border-loss/30 bg-loss/10 p-3"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-loss" />
              <p className="text-sm text-loss">{connection.errorMessage}</p>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {!isConnected ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onConnect}
              disabled={isConnecting}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${broker.gradient} px-4 py-3 font-semibold text-white shadow-glow-md transition-all hover:shadow-glow-lg disabled:opacity-50`}
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5" />
                  Connect {broker.displayName}
                </>
              )}
            </motion.button>
          ) : (
            <>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onRefresh(connection.id)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 font-semibold text-white backdrop-blur-xl transition-all hover:bg-white/20"
              >
                <RefreshCw className="h-5 w-5" />
                Refresh
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onDisconnect(connection.id)}
                className="flex items-center justify-center gap-2 rounded-xl bg-loss/20 px-4 py-3 font-semibold text-loss transition-all hover:bg-loss/30"
              >
                <Power className="h-5 w-5" />
                Disconnect
              </motion.button>
            </>
          )}
        </div>

        {/* Features (expandable) */}
        <motion.button
          onClick={() => setShowDetails(!showDetails)}
          className="mt-3 w-full text-center text-sm text-gray-400 transition-colors hover:text-white"
        >
          {showDetails ? 'Hide Details' : 'Show Features'}
        </motion.button>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-3 overflow-hidden"
            >
              <div className="space-y-1">
                {broker.features.map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-2 text-sm text-gray-300"
                  >
                    <Check className="h-3.5 w-3.5 text-profit" />
                    {feature}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Glow Effect on Hover */}
      <div
        className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
        style={{
          background: `radial-gradient(circle at 50% 0%, ${broker.gradient.includes('blue') ? 'rgba(59, 130, 246, 0.1)' : 'rgba(234, 179, 8, 0.1)'} 0%, transparent 70%)`,
        }}
      />
    </motion.div>
  );
}
