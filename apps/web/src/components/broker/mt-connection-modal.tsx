'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Server, Key, User, Shield, Info, Loader2, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface MTConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MTConnectionData) => void;
  platform: 'mt4' | 'mt5';
  isConnecting: boolean;
}

export interface MTConnectionData {
  platform: 'mt4' | 'mt5';
  serverAddress: string;
  accountNumber: string;
  password: string;
  investorPassword?: string;
  isRealAccount: boolean;
}

export function MTConnectionModal({
  isOpen,
  onClose,
  onSubmit,
  platform,
  isConnecting,
}: MTConnectionModalProps) {
  const [formData, setFormData] = useState<MTConnectionData>({
    platform,
    serverAddress: '',
    accountNumber: '',
    password: '',
    investorPassword: '',
    isRealAccount: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showInvestorPassword, setShowInvestorPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.serverAddress.trim()) {
      newErrors.serverAddress = 'Server address is required';
    } else if (!/^[a-zA-Z0-9.-]+(:\d+)?$/.test(formData.serverAddress)) {
      newErrors.serverAddress = 'Invalid server format (e.g., server.broker.com:443)';
    }

    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = 'Account number is required';
    } else if (!/^\d{5,10}$/.test(formData.accountNumber)) {
      newErrors.accountNumber = 'Account number must be 5-10 digits';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 4) {
      newErrors.password = 'Password must be at least 4 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof MTConnectionData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-gradient-dark-glass shadow-glass-dark backdrop-blur-xl"
            >
              {/* Header */}
              <div className="border-b border-white/10 bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Connect {platform.toUpperCase()}
                    </h2>
                    <p className="mt-1 text-sm text-gray-400">
                      Enter your MetaTrader credentials
                    </p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="rounded-lg bg-white/10 p-2 text-gray-400 transition-colors hover:bg-white/20 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-4">
                  {/* Server Address */}
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
                      <Server className="h-4 w-4" />
                      Server Address
                    </label>
                    <input
                      type="text"
                      value={formData.serverAddress}
                      onChange={(e) => handleChange('serverAddress', e.target.value)}
                      placeholder="e.g., demo.mt4server.com:443"
                      className={`w-full rounded-xl border ${errors.serverAddress ? 'border-loss/50' : 'border-white/10'} bg-white/5 px-4 py-3 text-white placeholder-gray-400 backdrop-blur-xl transition-all focus:border-white/20 focus:bg-white/10 focus:outline-none`}
                    />
                    {errors.serverAddress && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-xs text-loss"
                      >
                        {errors.serverAddress}
                      </motion.p>
                    )}
                  </div>

                  {/* Account Number */}
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
                      <User className="h-4 w-4" />
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={formData.accountNumber}
                      onChange={(e) => handleChange('accountNumber', e.target.value)}
                      placeholder="e.g., 12345678"
                      className={`w-full rounded-xl border ${errors.accountNumber ? 'border-loss/50' : 'border-white/10'} bg-white/5 px-4 py-3 text-white placeholder-gray-400 backdrop-blur-xl transition-all focus:border-white/20 focus:bg-white/10 focus:outline-none`}
                    />
                    {errors.accountNumber && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-xs text-loss"
                      >
                        {errors.accountNumber}
                      </motion.p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
                      <Key className="h-4 w-4" />
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleChange('password', e.target.value)}
                        placeholder="••••••••"
                        className={`w-full rounded-xl border ${errors.password ? 'border-loss/50' : 'border-white/10'} bg-white/5 px-4 py-3 pr-12 text-white placeholder-gray-400 backdrop-blur-xl transition-all focus:border-white/20 focus:bg-white/10 focus:outline-none`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-white"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-xs text-loss"
                      >
                        {errors.password}
                      </motion.p>
                    )}
                  </div>

                  {/* Investor Password (Optional) */}
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
                      <Shield className="h-4 w-4" />
                      Investor Password (Optional)
                    </label>
                    <div className="relative">
                      <input
                        type={showInvestorPassword ? 'text' : 'password'}
                        value={formData.investorPassword || ''}
                        onChange={(e) => handleChange('investorPassword', e.target.value)}
                        placeholder="Read-only password (optional)"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-12 text-white placeholder-gray-400 backdrop-blur-xl transition-all focus:border-white/20 focus:bg-white/10 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowInvestorPassword(!showInvestorPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-white"
                      >
                        {showInvestorPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-400">
                      For read-only access (view positions without trading)
                    </p>
                  </div>

                  {/* Account Type */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">
                      Account Type
                    </label>
                    <div className="flex gap-3">
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleChange('isRealAccount', true)}
                        className={`flex-1 rounded-xl border px-4 py-3 font-semibold transition-all ${
                          formData.isRealAccount
                            ? 'border-profit bg-profit/20 text-profit shadow-glow-sm'
                            : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        Real Account
                      </motion.button>

                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleChange('isRealAccount', false)}
                        className={`flex-1 rounded-xl border px-4 py-3 font-semibold transition-all ${
                          !formData.isRealAccount
                            ? 'border-purple-500 bg-purple-500/20 text-purple-400 shadow-glow-sm'
                            : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        Demo Account
                      </motion.button>
                    </div>
                  </div>

                  {/* Security Notice */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex gap-3 rounded-lg border border-blue-500/30 bg-blue-500/10 p-4"
                  >
                    <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />
                    <div className="text-sm text-blue-300">
                      <p className="font-semibold">Your credentials are secure</p>
                      <p className="mt-1 text-xs text-blue-400">
                        All credentials are encrypted with AES-256 before storage and never
                        exposed to the client.
                      </p>
                    </div>
                  </motion.div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex gap-3">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="flex-1 rounded-xl bg-white/10 px-4 py-3 font-semibold text-white backdrop-blur-xl transition-all hover:bg-white/20"
                  >
                    Cancel
                  </motion.button>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: isConnecting ? 1 : 1.02 }}
                    whileTap={{ scale: isConnecting ? 1 : 0.98 }}
                    disabled={isConnecting}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-signal px-4 py-3 font-semibold text-white shadow-glow-md transition-all hover:shadow-glow-lg disabled:opacity-50"
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>Connect {platform.toUpperCase()}</>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
