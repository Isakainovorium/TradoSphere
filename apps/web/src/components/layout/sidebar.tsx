'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  TrendingUp,
  Trophy,
  BookOpen,
  Link as LinkIcon,
  Video,
  Brain,
  GraduationCap,
  Users,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Lock,
  Sparkles,
} from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { hasFeatureAccess } from '@/lib/utils/helpers';
import { MAIN_NAVIGATION, type NavItem } from '@/config/routes';

const iconMap = {
  LayoutDashboard,
  TrendingUp,
  Trophy,
  BookOpen,
  LinkIcon,
  Video,
  Brain,
  GraduationCap,
  Users,
  BarChart3,
  Sparkles,
};

export function Sidebar() {
  const pathname = usePathname();
  const { profile, tier } = useUser();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href) ? prev.filter((item) => item !== href) : [...prev, href],
    );
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === href;
    return pathname.startsWith(href);
  };

  const hasAccess = (requiredTier?: 'free' | 'tsgrow' | 'elite' | 'gladiator') => {
    if (!requiredTier) return true;
    return hasFeatureAccess(tier, requiredTier);
  };

  return (
    <>
      {/* Backdrop for mobile */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setIsCollapsed(true)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isCollapsed ? '80px' : '280px',
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`fixed left-0 top-0 z-50 h-screen border-r border-white/10 bg-gradient-dark-glass backdrop-blur-xl lg:relative ${
          isCollapsed ? 'px-3' : 'px-6'
        } py-6 overflow-hidden`}
      >
        {/* Logo */}
        <motion.div
          animate={{
            scale: isCollapsed ? 0.8 : 1,
          }}
          className="mb-8 flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-signal shadow-glow-md">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <h1 className="bg-gradient-signal bg-clip-text text-xl font-bold text-transparent">
                  TradoSphere
                </h1>
                <p className="text-xs text-gray-400">Trade. Compete. Grow.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Navigation */}
        <nav className="space-y-1 overflow-y-auto overflow-x-hidden" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {MAIN_NAVIGATION.map((item) => (
            <NavItemComponent
              key={item.href}
              item={item}
              isCollapsed={isCollapsed}
              isActive={isActive(item.href)}
              isExpanded={expandedItems.includes(item.href)}
              onToggleExpand={() => toggleExpanded(item.href)}
              hasAccess={hasAccess(item.requiredTier)}
              tier={tier}
            />
          ))}
        </nav>

        {/* Collapse Toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute bottom-6 left-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/5 backdrop-blur-sm transition-colors hover:bg-white/10"
        >
          <motion.div
            animate={{ rotate: isCollapsed ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </motion.div>
        </motion.button>
      </motion.aside>
    </>
  );
}

interface NavItemComponentProps {
  item: NavItem;
  isCollapsed: boolean;
  isActive: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  hasAccess: boolean;
  tier: string;
}

function NavItemComponent({
  item,
  isCollapsed,
  isActive,
  isExpanded,
  onToggleExpand,
  hasAccess,
  tier,
}: NavItemComponentProps) {
  const pathname = usePathname();
  const Icon = iconMap[item.icon as keyof typeof iconMap] || LayoutDashboard;
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div>
      {/* Main Item */}
      <motion.div whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}>
        {hasChildren ? (
          <button
            onClick={onToggleExpand}
            className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${
              isActive
                ? 'bg-gradient-signal text-white shadow-glow-md'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            {/* Active Indicator */}
            {isActive && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-white"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}

            {/* Icon with Glow */}
            <div className={`relative ${isActive ? 'animate-glow-pulse' : ''}`}>
              <Icon className="h-5 w-5 shrink-0" />
              {!hasAccess && (
                <div className="absolute -right-1 -top-1">
                  <Lock className="h-3 w-3 text-yellow-400" />
                </div>
              )}
            </div>

            {/* Label */}
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex-1 truncate text-left text-sm font-medium"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>

            {/* Badge */}
            {!isCollapsed && item.badge && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  item.badge === 'Hot'
                    ? 'bg-gradient-competition text-white'
                    : item.badge === 'AI'
                    ? 'bg-gradient-mentor text-white'
                    : 'bg-gradient-signal text-white'
                } shadow-glow-sm`}
              >
                {item.badge}
              </motion.span>
            )}

            {/* Expand Icon */}
            {!isCollapsed && hasChildren && (
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-4 w-4" />
              </motion.div>
            )}
          </button>
        ) : (
          <Link
            href={hasAccess ? item.href : '#'}
            className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${
              isActive
                ? 'bg-gradient-signal text-white shadow-glow-md'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            } ${!hasAccess ? 'cursor-not-allowed opacity-60' : ''}`}
            onClick={(e) => {
              if (!hasAccess) {
                e.preventDefault();
                // TODO: Show upgrade modal
              }
            }}
          >
            {/* Active Indicator */}
            {isActive && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-white"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}

            {/* Icon with Glow */}
            <div className={`relative ${isActive ? 'animate-glow-pulse' : ''}`}>
              <Icon className="h-5 w-5 shrink-0" />
              {!hasAccess && (
                <div className="absolute -right-1 -top-1">
                  <Lock className="h-3 w-3 text-yellow-400 animate-pulse-slow" />
                </div>
              )}
            </div>

            {/* Label */}
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex-1 truncate text-sm font-medium"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>

            {/* Badge */}
            {!isCollapsed && item.badge && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  item.badge === 'Hot'
                    ? 'bg-gradient-competition text-white'
                    : item.badge === 'AI'
                    ? 'bg-gradient-mentor text-white'
                    : item.badge === 'Elite'
                    ? 'bg-gradient-signal text-white'
                    : 'bg-gradient-signal text-white'
                } shadow-glow-sm animate-pulse-slow`}
              >
                {item.badge}
              </motion.span>
            )}
          </Link>
        )}
      </motion.div>

      {/* Children */}
      <AnimatePresence>
        {hasChildren && isExpanded && !isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="ml-6 mt-1 space-y-1 overflow-hidden border-l border-white/10 pl-3"
          >
            {item.children?.map((child) => {
              const ChildIcon = iconMap[child.icon as keyof typeof iconMap] || LayoutDashboard;
              const isChildActive = pathname === child.href;

              return (
                <motion.div
                  key={child.href}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -10, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  whileHover={{ x: 2 }}
                >
                  <Link
                    href={child.href}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all ${
                      isChildActive
                        ? 'bg-white/10 text-white'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <ChildIcon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{child.label}</span>
                    {child.badge && (
                      <span className="ml-auto rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] font-semibold">
                        {child.badge}
                      </span>
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
