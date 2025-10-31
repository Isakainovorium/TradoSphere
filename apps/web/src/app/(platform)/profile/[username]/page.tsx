'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  MapPin,
  Globe,
  Calendar,
  Settings,
  Shield,
  Crown,
  Users,
  TrendingUp,
  Sparkles,
  ExternalLink,
  Twitter,
  MessageCircle,
  Send,
  Check,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SignalCard } from '@/components/signals/signal-card';
import { StatsDashboard } from '@/components/profile/stats-dashboard';
import { useUser } from '@/hooks/use-user';

interface ProfileUser {
  id: string;
  username: string;
  email?: string;
  tier: string;
  isCreator: boolean;
  isVerified: boolean;
  isPremiumCreator: boolean;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  location?: string;
  website?: string;
  twitterHandle?: string;
  discordHandle?: string;
  telegramHandle?: string;
  tradingStyle?: string;
  favoriteMarkets?: string[];
  yearsExperience?: number;
  followersCount: number;
  followingCount: number;
  signalCount: number;
  subscriberCount: number;
  profileViews: number;
  createdAt: string;
  lastActiveAt?: string;
  isFollowing?: boolean;
}

export default function UserProfilePage({ params }: { params: { username: string } }) {
  const router = useRouter();
  const { user: currentUser, profile: currentProfile } = useUser();
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [signals, setSignals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'signals' | 'stats'>('signals');

  const isOwnProfile = currentProfile?.username === params.username;

  useEffect(() => {
    fetchProfile();
    fetchSignals();
  }, [params.username]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${params.username}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 404) {
          router.push('/404');
          return;
        }
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfile(data.profile);
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSignals = async () => {
    try {
      const response = await fetch(`/api/users/${params.username}/signals?limit=10`, {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to fetch signals');

      const data = await response.json();
      setSignals(data.signals || []);
    } catch (error) {
      console.error('Error fetching signals:', error);
    }
  };

  const handleFollow = async () => {
    if (!currentUser || !profile) return;

    try {
      setFollowLoading(true);

      const response = await fetch(`/api/users/${profile.id}/follow`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to follow user');

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              isFollowing: true,
              followersCount: prev.followersCount + 1,
            }
          : null
      );
    } catch (error) {
      console.error('Error following user:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleUnfollow = async () => {
    if (!currentUser || !profile) return;

    try {
      setFollowLoading(true);

      const response = await fetch(`/api/users/${profile.id}/follow`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to unfollow user');

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              isFollowing: false,
              followersCount: Math.max(0, prev.followersCount - 1),
            }
          : null
      );
    } catch (error) {
      console.error('Error unfollowing user:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  const getTierBadge = (tier: string) => {
    const badges: Record<string, { color: string; label: string; icon: any }> = {
      gladiator: { color: 'bg-tier-gladiator', label: 'Gladiator', icon: Crown },
      elite: { color: 'bg-tier-elite', label: 'Elite', icon: Sparkles },
      grow: { color: 'bg-tier-grow', label: 'Grow', icon: TrendingUp },
      free: { color: 'bg-gray-500', label: 'Free', icon: User },
    };

    const badge = badges[tier] || badges.free;
    const Icon = badge.icon;

    return (
      <div
        className={`inline-flex items-center gap-1.5 rounded-full ${badge.color} px-3 py-1 text-xs font-semibold text-white shadow-glow-sm`}
      >
        <Icon className="h-3.5 w-3.5" />
        {badge.label}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-950 via-blue-950 to-purple-950">
        <Loader2 className="h-12 w-12 animate-spin text-blue-400" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-950 via-blue-950 to-purple-950">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">User not found</h1>
          <Link
            href="/signals"
            className="mt-4 inline-block text-blue-400 hover:underline"
          >
            Back to Feed
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-purple-950">
      {/* Banner */}
      <div
        className="relative h-64 bg-cover bg-center"
        style={{
          backgroundImage: profile.bannerUrl
            ? `url(${profile.bannerUrl})`
            : 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-950/80" />
      </div>

      {/* Profile Content */}
      <div className="container mx-auto px-4">
        <div className="relative -mt-24">
          {/* Avatar & Info */}
          <div className="mb-6 flex flex-col items-start gap-6 sm:flex-row sm:items-end">
            {/* Avatar */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative"
            >
              <div className="h-40 w-40 overflow-hidden rounded-3xl border-4 border-gray-950 bg-gradient-signal shadow-glow-lg">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.username}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <User className="h-20 w-20 text-white" />
                  </div>
                )}
              </div>

              {/* Verified Badge */}
              {profile.isVerified && (
                <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 shadow-glow-md">
                  <Shield className="h-5 w-5 text-white" />
                </div>
              )}
            </motion.div>

            {/* User Info */}
            <div className="flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold text-white">{profile.username}</h1>
                {getTierBadge(profile.tier)}
                {profile.isPremiumCreator && (
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-streaming px-3 py-1 text-xs font-semibold text-white shadow-glow-sm">
                    <Sparkles className="h-3.5 w-3.5" />
                    Premium Creator
                  </div>
                )}
              </div>

              {profile.bio && (
                <p className="mb-4 max-w-2xl text-gray-300">{profile.bio}</p>
              )}

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                {profile.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {profile.location}
                  </div>
                )}

                {profile.tradingStyle && (
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4" />
                    {profile.tradingStyle.replace('_', ' ')}
                  </div>
                )}

                {profile.yearsExperience && profile.yearsExperience > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {profile.yearsExperience}+ years experience
                  </div>
                )}

                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  Joined {new Date(profile.createdAt).toLocaleDateString()}
                </div>
              </div>

              {/* Social Links */}
              <div className="mt-3 flex flex-wrap items-center gap-3">
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-blue-400 transition-colors hover:text-blue-300"
                  >
                    <Globe className="h-4 w-4" />
                    Website
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}

                {profile.twitterHandle && (
                  <a
                    href={`https://twitter.com/${profile.twitterHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-blue-400 transition-colors hover:text-blue-300"
                  >
                    <Twitter className="h-4 w-4" />
                    @{profile.twitterHandle}
                  </a>
                )}

                {profile.telegramHandle && (
                  <a
                    href={`https://t.me/${profile.telegramHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-blue-400 transition-colors hover:text-blue-300"
                  >
                    <Send className="h-4 w-4" />
                    {profile.telegramHandle}
                  </a>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {isOwnProfile ? (
                <Link href="/settings/profile">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 rounded-xl bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur-xl transition-all hover:bg-white/20"
                  >
                    <Settings className="h-5 w-5" />
                    Edit Profile
                  </motion.button>
                </Link>
              ) : (
                <>
                  {profile.isFollowing ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleUnfollow}
                      disabled={followLoading}
                      className="flex items-center gap-2 rounded-xl bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur-xl transition-all hover:bg-white/20 disabled:opacity-50"
                    >
                      {followLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Check className="h-5 w-5" />
                      )}
                      Following
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleFollow}
                      disabled={followLoading}
                      className="flex items-center gap-2 rounded-xl bg-gradient-signal px-6 py-3 font-semibold text-white shadow-glow-md transition-all hover:shadow-glow-lg disabled:opacity-50"
                    >
                      {followLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Users className="h-5 w-5" />
                      )}
                      Follow
                    </motion.button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Stats Overview */}
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-gradient-dark-glass p-4 text-center backdrop-blur-xl">
              <div className="text-2xl font-bold text-white">
                {profile.signalCount.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Signals</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-gradient-dark-glass p-4 text-center backdrop-blur-xl">
              <div className="text-2xl font-bold text-white">
                {profile.followersCount.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Followers</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-gradient-dark-glass p-4 text-center backdrop-blur-xl">
              <div className="text-2xl font-bold text-white">
                {profile.followingCount.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Following</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-gradient-dark-glass p-4 text-center backdrop-blur-xl">
              <div className="text-2xl font-bold text-white">
                {profile.profileViews.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Views</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-4 border-b border-white/10">
            <button
              onClick={() => setActiveTab('signals')}
              className={`pb-3 text-sm font-semibold transition-colors ${
                activeTab === 'signals'
                  ? 'border-b-2 border-blue-400 text-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Signals ({profile.signalCount})
            </button>

            <button
              onClick={() => setActiveTab('stats')}
              className={`pb-3 text-sm font-semibold transition-colors ${
                activeTab === 'stats'
                  ? 'border-b-2 border-blue-400 text-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Statistics
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'signals' && (
            <div className="grid gap-6">
              {signals.length > 0 ? (
                signals.map((signal) => (
                  <SignalCard
                    key={signal.id}
                    signal={signal}
                    onLike={() => {}}
                    onUnlike={() => {}}
                    onComment={() => {}}
                    onShare={() => {}}
                  />
                ))
              ) : (
                <div className="rounded-2xl border border-white/10 bg-gradient-dark-glass p-12 text-center backdrop-blur-xl">
                  <TrendingUp className="mx-auto h-12 w-12 text-gray-600" />
                  <p className="mt-4 text-gray-400">
                    {isOwnProfile
                      ? "You haven't posted any signals yet."
                      : `${profile.username} hasn't posted any signals yet.`}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'stats' && (
            <StatsDashboard stats={stats} isOwnProfile={isOwnProfile} />
          )}
        </div>
      </div>
    </div>
  );
}
