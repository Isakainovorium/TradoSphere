'use client';

import { motion } from 'framer-motion';
import { TrendingUp, ArrowLeft, Sparkles, Lock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CreateSignalForm } from '@/components/signals/create-signal-form';
import { useUser } from '@/hooks/use-user';

export default function CreateSignalPage() {
  const router = useRouter();
  const { user, profile, loading } = useUser();

  // Redirect to login if not authenticated
  if (!loading && !user) {
    router.push('/login?redirect=/signals/create');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-purple-950">
      {/* Header */}
      <div className="border-b border-white/10 bg-gradient-dark-glass backdrop-blur-xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/signals"
                className="mb-4 inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Feed
              </Link>

              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-signal shadow-glow-md">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Create Trading Signal</h1>
                  <p className="text-sm text-gray-400">
                    Share your trading setup with the community
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          {/* Premium Signal Info */}
          {profile && (profile.tier === 'elite' || profile.tier === 'gladiator') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-900/20 to-pink-900/20 p-6 backdrop-blur-xl"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20">
                  <Sparkles className="h-6 w-6 text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white">
                    Premium Signal Available
                  </h3>
                  <p className="mt-1 text-sm text-gray-300">
                    As an {profile.tier === 'elite' ? 'Elite' : 'Gladiator'} member, you
                    can mark this signal as premium. Premium signals are only visible to
                    paid subscribers and help you monetize your trading insights.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Free Tier Limitation */}
          {profile?.tier === 'free' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 overflow-hidden rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-900/20 to-cyan-900/20 p-6 backdrop-blur-xl"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20">
                  <Lock className="h-6 w-6 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white">
                    Upgrade to Create Premium Signals
                  </h3>
                  <p className="mt-1 text-sm text-gray-300">
                    Free tier members can create public signals. Upgrade to Grow ($5/mo)
                    or higher to create premium signals and monetize your expertise.
                  </p>
                  <Link href="/pricing">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="mt-3 rounded-lg bg-gradient-signal px-4 py-2 text-sm font-semibold text-white shadow-glow-sm"
                    >
                      View Pricing
                    </motion.button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tips Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 overflow-hidden rounded-2xl border border-white/10 bg-gradient-dark-glass p-6 backdrop-blur-xl"
          >
            <h3 className="mb-3 text-lg font-bold text-white">
              Tips for Quality Signals
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-blue-400">•</span>
                <span>
                  <strong className="text-white">Be specific:</strong> Include exact
                  entry, stop loss, and take profit levels
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-blue-400">•</span>
                <span>
                  <strong className="text-white">Explain your reasoning:</strong> Share
                  your analysis in the description
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-blue-400">•</span>
                <span>
                  <strong className="text-white">Add charts:</strong> Visual confirmation
                  helps traders understand your setup
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-blue-400">•</span>
                <span>
                  <strong className="text-white">Use tags:</strong> Help others discover
                  your signals with relevant tags
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-blue-400">•</span>
                <span>
                  <strong className="text-white">Update status:</strong> Edit your signal
                  when it hits TP/SL to build credibility
                </span>
              </li>
            </ul>
          </motion.div>

          {/* Create Signal Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <CreateSignalForm />
          </motion.div>

          {/* Community Guidelines */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
          >
            <h4 className="mb-3 text-sm font-semibold text-white">
              Community Guidelines
            </h4>
            <p className="text-xs text-gray-400">
              By posting a signal, you agree to our{' '}
              <Link href="/terms" className="text-blue-400 hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/community-guidelines" className="text-blue-400 hover:underline">
                Community Guidelines
              </Link>
              . Signals must be your own analysis and not financial advice. TradoSphere is
              not responsible for trading losses. Always do your own research.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
