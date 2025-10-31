'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  MapPin,
  Globe,
  Twitter,
  Send,
  TrendingUp,
  Sparkles,
  Loader2,
  Save,
  Camera,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { useAuth } from '@/contexts/auth-context';
import { getTierDisplayName, getTierBadgeColor } from '@/lib/utils/helpers';

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { profile, loading: userLoading } = useUser();
  const { refreshProfile } = useAuth();

  // Form state
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [twitterHandle, setTwitterHandle] = useState('');
  const [telegramHandle, setTelegramHandle] = useState('');
  const [tradingStyle, setTradingStyle] = useState('');
  const [yearsExperience, setYearsExperience] = useState(0);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
      setBio(profile.bio || '');
      setAvatarUrl(profile.avatarUrl || '');
      setBannerUrl(profile.bannerUrl || '');
      setLocation(profile.location || '');
      setWebsite(profile.website || '');
      setTwitterHandle(profile.twitterHandle || '');
      setTelegramHandle(profile.telegramHandle || '');
      setTradingStyle(profile.tradingStyle || '');
      setYearsExperience(profile.yearsExperience || 0);
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username,
          bio,
          avatar_url: avatarUrl || null,
          banner_url: bannerUrl || null,
          location: location || null,
          website: website || null,
          twitter_handle: twitterHandle || null,
          telegram_handle: telegramHandle || null,
          trading_style: tradingStyle || null,
          years_experience: yearsExperience || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update profile');
      }

      setSuccess('Profile updated successfully!');
      await refreshProfile();

      // Redirect to profile page after 1.5 seconds
      setTimeout(() => {
        router.push(`/profile/${username}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (userLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-950 via-blue-950 to-purple-950">
        <Loader2 className="h-12 w-12 animate-spin text-blue-400" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-950 via-blue-950 to-purple-950">
        <div className="rounded-2xl border border-red-500/30 bg-red-900/20 p-6 text-center backdrop-blur-xl">
          <p className="text-red-400">Failed to load profile. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-purple-950 py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-signal shadow-glow-md">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
              <p className="text-gray-400">Customize your public profile and trading identity</p>
            </div>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-green-500/30 bg-green-900/20 p-4 backdrop-blur-xl"
            >
              <p className="text-green-400">{success}</p>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-red-500/30 bg-red-900/20 p-4 backdrop-blur-xl"
            >
              <p className="text-red-400">{error}</p>
            </motion.div>
          )}

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="rounded-2xl border border-white/10 bg-gradient-dark-glass p-6 backdrop-blur-xl">
              <h2 className="mb-6 text-xl font-bold text-white">Basic Information</h2>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Username *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white backdrop-blur-xl transition-all focus:border-white/20 focus:bg-white/10 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself and your trading experience..."
                    rows={4}
                    maxLength={500}
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-white backdrop-blur-xl transition-all focus:border-white/20 focus:bg-white/10 focus:outline-none"
                  />
                  <p className="mt-1 text-xs text-gray-400">{bio.length}/500 characters</p>
                </div>
              </div>
            </div>

            {/* Appearance */}
            <div className="rounded-2xl border border-white/10 bg-gradient-dark-glass p-6 backdrop-blur-xl">
              <h2 className="mb-6 text-xl font-bold text-white">Appearance</h2>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Avatar URL
                  </label>
                  <div className="relative">
                    <Camera className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white backdrop-blur-xl transition-all focus:border-white/20 focus:bg-white/10 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Banner URL
                  </label>
                  <div className="relative">
                    <Camera className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="url"
                      value={bannerUrl}
                      onChange={(e) => setBannerUrl(e.target.value)}
                      placeholder="https://example.com/banner.jpg"
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white backdrop-blur-xl transition-all focus:border-white/20 focus:bg-white/10 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Trading Information */}
            <div className="rounded-2xl border border-white/10 bg-gradient-dark-glass p-6 backdrop-blur-xl">
              <h2 className="mb-6 text-xl font-bold text-white">Trading Information</h2>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Trading Style
                  </label>
                  <select
                    value={tradingStyle}
                    onChange={(e) => setTradingStyle(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-white backdrop-blur-xl transition-all focus:border-white/20 focus:bg-white/10 focus:outline-none"
                  >
                    <option value="">Select your style...</option>
                    <option value="day_trader">Day Trader</option>
                    <option value="swing_trader">Swing Trader</option>
                    <option value="scalper">Scalper</option>
                    <option value="position_trader">Position Trader</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    value={yearsExperience}
                    onChange={(e) => setYearsExperience(parseInt(e.target.value) || 0)}
                    min="0"
                    max="50"
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-white backdrop-blur-xl transition-all focus:border-white/20 focus:bg-white/10 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Location & Social */}
            <div className="rounded-2xl border border-white/10 bg-gradient-dark-glass p-6 backdrop-blur-xl">
              <h2 className="mb-6 text-xl font-bold text-white">Location & Social Links</h2>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="New York, USA"
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white backdrop-blur-xl transition-all focus:border-white/20 focus:bg-white/10 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Website
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://yourwebsite.com"
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white backdrop-blur-xl transition-all focus:border-white/20 focus:bg-white/10 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Twitter Handle
                  </label>
                  <div className="relative">
                    <Twitter className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={twitterHandle}
                      onChange={(e) => setTwitterHandle(e.target.value)}
                      placeholder="yourusername"
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white backdrop-blur-xl transition-all focus:border-white/20 focus:bg-white/10 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Telegram Handle
                  </label>
                  <div className="relative">
                    <Send className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={telegramHandle}
                      onChange={(e) => setTelegramHandle(e.target.value)}
                      placeholder="yourusername"
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white backdrop-blur-xl transition-all focus:border-white/20 focus:bg-white/10 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.back()}
                className="rounded-xl bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur-xl transition-all hover:bg-white/20"
              >
                Cancel
              </motion.button>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.05 }}
                whileTap={{ scale: loading ? 1 : 0.95 }}
                className="flex items-center gap-2 rounded-xl bg-gradient-signal px-6 py-3 font-semibold text-white shadow-glow-md transition-all hover:shadow-glow-lg disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Save Changes
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
