'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Target, Shield, DollarSign, Tag, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useUser } from '@/hooks/use-user';

interface CreateSignalFormProps {
  onSuccess?: () => void;
}

export function CreateSignalForm({ onSuccess }: CreateSignalFormProps) {
  const router = useRouter();
  const { profile } = useUser();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [symbol, setSymbol] = useState('');
  const [direction, setDirection] = useState<'long' | 'short'>('long');
  const [entryPrice, setEntryPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [positionSize, setPositionSize] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [timeframe, setTimeframe] = useState('');
  const [marketType, setMarketType] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  // Calculate R:R ratio
  const calculateRR = () => {
    const entry = parseFloat(entryPrice);
    const sl = parseFloat(stopLoss);
    const tp = parseFloat(takeProfit);

    if (!entry || !sl || !tp) return null;

    const risk = Math.abs(entry - sl);
    const reward = Math.abs(tp - entry);

    if (risk === 0) return null;

    return (reward / risk).toFixed(2);
  };

  const riskReward = calculateRR();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/signals/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: symbol.toUpperCase(),
          direction,
          entryPrice: parseFloat(entryPrice),
          stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
          takeProfit: takeProfit ? parseFloat(takeProfit) : undefined,
          positionSize: positionSize ? parseFloat(positionSize) : undefined,
          title: title || undefined,
          description: description || undefined,
          tags: tags ? tags.split(',').map(t => t.trim()) : [],
          imageUrl: imageUrl || undefined,
          timeframe: timeframe || undefined,
          marketType: marketType || undefined,
          isPublic,
          isPremium: isPremium && profile?.isCreator,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create signal');
      }

      // Reset form
      setSymbol('');
      setEntryPrice('');
      setStopLoss('');
      setTakeProfit('');
      setPositionSize('');
      setTitle('');
      setDescription('');
      setTags('');
      setImageUrl('');

      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/signals');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create signal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-loss/10 border border-loss p-4"
        >
          <p className="text-sm text-loss">{error}</p>
        </motion.div>
      )}

      {/* Direction Toggle */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">Direction</label>
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setDirection('long')}
            className={`flex items-center justify-center gap-2 rounded-xl p-4 transition-all ${
              direction === 'long'
                ? 'bg-gradient-profit shadow-glow-profit'
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            <TrendingUp className="h-5 w-5" />
            <span className="font-semibold">Long</span>
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setDirection('short')}
            className={`flex items-center justify-center gap-2 rounded-xl p-4 transition-all ${
              direction === 'short'
                ? 'bg-gradient-loss shadow-glow-loss'
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            <TrendingDown className="h-5 w-5" />
            <span className="font-semibold">Short</span>
          </motion.button>
        </div>
      </div>

      {/* Symbol & Market Type */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="symbol" className="text-sm font-medium text-gray-300">
            Symbol *
          </label>
          <input
            id="symbol"
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="BTC, EURUSD, AAPL..."
            required
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 backdrop-blur-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="marketType" className="text-sm font-medium text-gray-300">
            Market Type
          </label>
          <select
            id="marketType"
            value={marketType}
            onChange={(e) => setMarketType(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white backdrop-blur-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="">Select market...</option>
            <option value="crypto">Crypto</option>
            <option value="forex">Forex</option>
            <option value="stocks">Stocks</option>
            <option value="futures">Futures</option>
            <option value="options">Options</option>
          </select>
        </div>
      </div>

      {/* Prices */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label htmlFor="entryPrice" className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <Target className="h-4 w-4" />
            Entry Price *
          </label>
          <input
            id="entryPrice"
            type="number"
            step="any"
            value={entryPrice}
            onChange={(e) => setEntryPrice(e.target.value)}
            placeholder="0.00"
            required
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 backdrop-blur-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="stopLoss" className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <Shield className="h-4 w-4" />
            Stop Loss
          </label>
          <input
            id="stopLoss"
            type="number"
            step="any"
            value={stopLoss}
            onChange={(e) => setStopLoss(e.target.value)}
            placeholder="0.00"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 backdrop-blur-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="takeProfit" className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <DollarSign className="h-4 w-4" />
            Take Profit
          </label>
          <input
            id="takeProfit"
            type="number"
            step="any"
            value={takeProfit}
            onChange={(e) => setTakeProfit(e.target.value)}
            placeholder="0.00"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 backdrop-blur-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
      </div>

      {/* R:R Display */}
      {riskReward && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-lg bg-gradient-signal p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white">Risk/Reward Ratio</span>
            <span className="text-2xl font-bold text-white">1:{riskReward}</span>
          </div>
        </motion.div>
      )}

      {/* Position Size & Timeframe */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="positionSize" className="text-sm font-medium text-gray-300">
            Position Size
          </label>
          <input
            id="positionSize"
            type="number"
            step="any"
            value={positionSize}
            onChange={(e) => setPositionSize(e.target.value)}
            placeholder="1.0"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 backdrop-blur-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="timeframe" className="text-sm font-medium text-gray-300">
            Timeframe
          </label>
          <select
            id="timeframe"
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white backdrop-blur-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="">Select timeframe...</option>
            <option value="1m">1 Minute</option>
            <option value="5m">5 Minutes</option>
            <option value="15m">15 Minutes</option>
            <option value="30m">30 Minutes</option>
            <option value="1h">1 Hour</option>
            <option value="4h">4 Hours</option>
            <option value="1d">1 Day</option>
            <option value="1w">1 Week</option>
          </select>
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium text-gray-300">
          Title (Optional)
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give your signal a catchy title..."
          maxLength={100}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 backdrop-blur-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium text-gray-300">
          Analysis (Optional)
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Share your analysis, reasoning, or strategy..."
          rows={4}
          maxLength={2000}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 backdrop-blur-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />
        <p className="text-xs text-gray-500">{description.length}/2000 characters</p>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <label htmlFor="tags" className="flex items-center gap-2 text-sm font-medium text-gray-300">
          <Tag className="h-4 w-4" />
          Tags (Optional)
        </label>
        <input
          id="tags"
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="scalping, breakout, support (comma-separated)"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 backdrop-blur-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />
      </div>

      {/* Image URL */}
      <div className="space-y-2">
        <label htmlFor="imageUrl" className="flex items-center gap-2 text-sm font-medium text-gray-300">
          <ImageIcon className="h-4 w-4" />
          Chart Image URL (Optional)
        </label>
        <input
          id="imageUrl"
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://example.com/chart.png"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 backdrop-blur-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />
      </div>

      {/* Visibility Options */}
      <div className="space-y-3 rounded-lg border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-300">Public Signal</p>
            <p className="text-sm text-gray-500">Visible to all users</p>
          </div>
          <button
            type="button"
            onClick={() => setIsPublic(!isPublic)}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              isPublic ? 'bg-blue-600' : 'bg-gray-600'
            }`}
          >
            <motion.div
              animate={{ x: isPublic ? 20 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute top-1 h-4 w-4 rounded-full bg-white"
            />
          </button>
        </div>

        {profile?.isCreator && (
          <div className="flex items-center justify-between border-t border-white/10 pt-3">
            <div>
              <p className="font-medium text-gray-300">Premium Content</p>
              <p className="text-sm text-gray-500">Only for your subscribers</p>
            </div>
            <button
              type="button"
              onClick={() => setIsPremium(!isPremium)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                isPremium ? 'bg-purple-600' : 'bg-gray-600'
              }`}
            >
              <motion.div
                animate={{ x: isPremium ? 20 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-1 h-4 w-4 rounded-full bg-white"
              />
            </button>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={loading}
        whileHover={{ scale: loading ? 1 : 1.02 }}
        whileTap={{ scale: loading ? 1 : 0.98 }}
        className="w-full rounded-xl bg-gradient-signal py-4 font-semibold text-white shadow-glow-md transition-all hover:shadow-glow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Creating Signal...
          </span>
        ) : (
          'Create Signal'
        )}
      </motion.button>
    </form>
  );
}
