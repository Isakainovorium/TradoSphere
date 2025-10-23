/**
 * Database Types
 * Generated from Supabase schema
 * Includes all tables, views, and functions
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      // =====================================================
      // USER & PROFILE TABLES
      // =====================================================
      profiles: {
        Row: {
          id: string;
          username: string;
          full_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          website: string | null;
          twitter_handle: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          website?: string | null;
          twitter_handle?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          website?: string | null;
          twitter_handle?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // =====================================================
      // RANKING & XP TABLES
      // =====================================================
      user_rankings: {
        Row: {
          id: string;
          user_id: string;
          current_xp: number;
          current_rank: string;
          rank_tier: number;
          total_competitions: number;
          wins: number;
          losses: number;
          win_rate: number;
          current_win_streak: number;
          current_loss_streak: number;
          best_win_streak: number;
          peak_xp: number;
          peak_rank: string;
          peak_rank_achieved_at: string | null;
          last_competition_at: string | null;
          days_active_this_week: number;
          last_active_date: string | null;
          season_id: number;
          season_xp: number;
          season_wins: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          current_xp?: number;
          current_rank?: string;
          rank_tier?: number;
          total_competitions?: number;
          wins?: number;
          losses?: number;
          win_rate?: number;
          current_win_streak?: number;
          current_loss_streak?: number;
          best_win_streak?: number;
          peak_xp?: number;
          peak_rank?: string;
          peak_rank_achieved_at?: string | null;
          last_competition_at?: string | null;
          days_active_this_week?: number;
          last_active_date?: string | null;
          season_id?: number;
          season_xp?: number;
          season_wins?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          current_xp?: number;
          current_rank?: string;
          rank_tier?: number;
          total_competitions?: number;
          wins?: number;
          losses?: number;
          win_rate?: number;
          current_win_streak?: number;
          current_loss_streak?: number;
          best_win_streak?: number;
          peak_xp?: number;
          peak_rank?: string;
          peak_rank_achieved_at?: string | null;
          last_competition_at?: string | null;
          days_active_this_week?: number;
          last_active_date?: string | null;
          season_id?: number;
          season_xp?: number;
          season_wins?: number;
          created_at?: string;
          updated_at?: string;
        };
      };

      xp_transactions: {
        Row: {
          id: string;
          user_id: string;
          competition_id: string | null;
          xp_change: number;
          xp_before: number;
          xp_after: number;
          reason: string;
          reason_details: Json;
          rank_before: string | null;
          rank_after: string | null;
          rank_up: boolean;
          rank_down: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          competition_id?: string | null;
          xp_change: number;
          xp_before: number;
          xp_after: number;
          reason: string;
          reason_details?: Json;
          rank_before?: string | null;
          rank_after?: string | null;
          rank_up?: boolean;
          rank_down?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          competition_id?: string | null;
          xp_change?: number;
          xp_before?: number;
          xp_after?: number;
          reason?: string;
          reason_details?: Json;
          rank_before?: string | null;
          rank_after?: string | null;
          rank_up?: boolean;
          rank_down?: boolean;
          created_at?: string;
        };
      };

      // =====================================================
      // COMPETITION TABLES
      // =====================================================
      competitions: {
        Row: {
          id: string;
          competition_type: string;
          is_ranked: boolean;
          is_custom: boolean;
          creator_id: string | null;
          name: string;
          description: string | null;
          duration_hours: number;
          start_time: string | null;
          end_time: string | null;
          entry_fee: number;
          max_participants: number;
          current_participants: number;
          allowed_symbols: string[] | null;
          min_rank: string | null;
          max_rank: string | null;
          prize_pool: number;
          prize_distribution: Json;
          status: string;
          avg_xp: number | null;
          xp_range_min: number | null;
          xp_range_max: number | null;
          auto_generated: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          competition_type: string;
          is_ranked?: boolean;
          is_custom?: boolean;
          creator_id?: string | null;
          name: string;
          description?: string | null;
          duration_hours: number;
          start_time?: string | null;
          end_time?: string | null;
          entry_fee?: number;
          max_participants: number;
          current_participants?: number;
          allowed_symbols?: string[] | null;
          min_rank?: string | null;
          max_rank?: string | null;
          prize_pool?: number;
          prize_distribution?: Json;
          status?: string;
          avg_xp?: number | null;
          xp_range_min?: number | null;
          xp_range_max?: number | null;
          auto_generated?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          competition_type?: string;
          is_ranked?: boolean;
          is_custom?: boolean;
          creator_id?: string | null;
          name?: string;
          description?: string | null;
          duration_hours?: number;
          start_time?: string | null;
          end_time?: string | null;
          entry_fee?: number;
          max_participants?: number;
          current_participants?: number;
          allowed_symbols?: string[] | null;
          min_rank?: string | null;
          max_rank?: string | null;
          prize_pool?: number;
          prize_distribution?: Json;
          status?: string;
          avg_xp?: number | null;
          xp_range_min?: number | null;
          xp_range_max?: number | null;
          auto_generated?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      competition_participants: {
        Row: {
          id: string;
          competition_id: string;
          user_id: string;
          team_id: string | null;
          joined_at: string;
          entry_fee_paid: number;
          total_trades: number;
          winning_trades: number;
          total_pnl: number;
          current_rank: number | null;
          final_rank: number | null;
          prize_amount: number;
          prize_paid: boolean;
          xp_before: number | null;
          xp_after: number | null;
          xp_gained: number | null;
        };
        Insert: {
          id?: string;
          competition_id: string;
          user_id: string;
          team_id?: string | null;
          joined_at?: string;
          entry_fee_paid?: number;
          total_trades?: number;
          winning_trades?: number;
          total_pnl?: number;
          current_rank?: number | null;
          final_rank?: number | null;
          prize_amount?: number;
          prize_paid?: boolean;
          xp_before?: number | null;
          xp_after?: number | null;
          xp_gained?: number | null;
        };
        Update: {
          id?: string;
          competition_id?: string;
          user_id?: string;
          team_id?: string | null;
          joined_at?: string;
          entry_fee_paid?: number;
          total_trades?: number;
          winning_trades?: number;
          total_pnl?: number;
          current_rank?: number | null;
          final_rank?: number | null;
          prize_amount?: number;
          prize_paid?: boolean;
          xp_before?: number | null;
          xp_after?: number | null;
          xp_gained?: number | null;
        };
      };

      matchmaking_queue: {
        Row: {
          id: string;
          user_id: string;
          format: string;
          duration_hours: number;
          current_xp: number;
          current_rank: string;
          xp_range_min: number;
          xp_range_max: number;
          search_started_at: string;
          search_expanded_count: number;
          status: string;
          matched_with: string[] | null;
          match_found_at: string | null;
          match_accepted_at: string | null;
          expires_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          format: string;
          duration_hours?: number;
          current_xp: number;
          current_rank: string;
          xp_range_min: number;
          xp_range_max: number;
          search_started_at?: string;
          search_expanded_count?: number;
          status?: string;
          matched_with?: string[] | null;
          match_found_at?: string | null;
          match_accepted_at?: string | null;
          expires_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          format?: string;
          duration_hours?: number;
          current_xp?: number;
          current_rank?: string;
          xp_range_min?: number;
          xp_range_max?: number;
          search_started_at?: string;
          search_expanded_count?: number;
          status?: string;
          matched_with?: string[] | null;
          match_found_at?: string | null;
          match_accepted_at?: string | null;
          expires_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };

      global_leaderboard: {
        Row: {
          id: string;
          user_id: string;
          global_rank: number;
          rank_tier: string;
          xp: number;
          total_wins: number;
          total_competitions: number;
          win_rate: number;
          season_id: number;
          snapshot_date: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          global_rank: number;
          rank_tier: string;
          xp: number;
          total_wins?: number;
          total_competitions?: number;
          win_rate?: number;
          season_id?: number;
          snapshot_date?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          global_rank?: number;
          rank_tier?: string;
          xp?: number;
          total_wins?: number;
          total_competitions?: number;
          win_rate?: number;
          season_id?: number;
          snapshot_date?: string;
        };
      };

      matchmaking_history: {
        Row: {
          id: string;
          user_id: string;
          opponent_id: string;
          competition_id: string | null;
          format: string;
          xp_diff: number | null;
          matched_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          opponent_id: string;
          competition_id?: string | null;
          format: string;
          xp_diff?: number | null;
          matched_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          opponent_id?: string;
          competition_id?: string | null;
          format?: string;
          xp_diff?: number | null;
          matched_at?: string;
        };
      };

      // =====================================================
      // SIGNALS & SOCIAL TABLES
      // =====================================================
      signals: {
        Row: {
          id: string;
          user_id: string;
          symbol: string;
          direction: 'long' | 'short';
          entry_price: number;
          stop_loss: number | null;
          take_profit: number | null;
          position_size: number | null;
          timeframe: string | null;
          description: string | null;
          image_url: string | null;
          status: 'active' | 'closed' | 'cancelled';
          exit_price: number | null;
          pnl: number | null;
          likes_count: number;
          comments_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          symbol: string;
          direction: 'long' | 'short';
          entry_price: number;
          stop_loss?: number | null;
          take_profit?: number | null;
          position_size?: number | null;
          timeframe?: string | null;
          description?: string | null;
          image_url?: string | null;
          status?: 'active' | 'closed' | 'cancelled';
          exit_price?: number | null;
          pnl?: number | null;
          likes_count?: number;
          comments_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          symbol?: string;
          direction?: 'long' | 'short';
          entry_price?: number;
          stop_loss?: number | null;
          take_profit?: number | null;
          position_size?: number | null;
          timeframe?: string | null;
          description?: string | null;
          image_url?: string | null;
          status?: 'active' | 'closed' | 'cancelled';
          exit_price?: number | null;
          pnl?: number | null;
          likes_count?: number;
          comments_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };

      // =====================================================
      // BROKER INTEGRATION TABLES
      // =====================================================
      broker_connections: {
        Row: {
          id: string;
          user_id: string;
          broker_name: string;
          broker_account_id: string;
          api_key_encrypted: string | null;
          api_secret_encrypted: string | null;
          access_token_encrypted: string | null;
          refresh_token_encrypted: string | null;
          connection_status: 'connected' | 'disconnected' | 'error';
          last_sync_at: string | null;
          error_message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          broker_name: string;
          broker_account_id: string;
          api_key_encrypted?: string | null;
          api_secret_encrypted?: string | null;
          access_token_encrypted?: string | null;
          refresh_token_encrypted?: string | null;
          connection_status?: 'connected' | 'disconnected' | 'error';
          last_sync_at?: string | null;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          broker_name?: string;
          broker_account_id?: string;
          api_key_encrypted?: string | null;
          api_secret_encrypted?: string | null;
          access_token_encrypted?: string | null;
          refresh_token_encrypted?: string | null;
          connection_status?: 'connected' | 'disconnected' | 'error';
          last_sync_at?: string | null;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      broker_trades: {
        Row: {
          id: string;
          user_id: string;
          broker_connection_id: string;
          broker_trade_id: string;
          symbol: string;
          direction: 'long' | 'short';
          quantity: number;
          entry_price: number;
          exit_price: number | null;
          stop_loss: number | null;
          take_profit: number | null;
          pnl: number | null;
          commission: number | null;
          status: 'open' | 'closed';
          opened_at: string;
          closed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          broker_connection_id: string;
          broker_trade_id: string;
          symbol: string;
          direction: 'long' | 'short';
          quantity: number;
          entry_price: number;
          exit_price?: number | null;
          stop_loss?: number | null;
          take_profit?: number | null;
          pnl?: number | null;
          commission?: number | null;
          status?: 'open' | 'closed';
          opened_at: string;
          closed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          broker_connection_id?: string;
          broker_trade_id?: string;
          symbol?: string;
          direction?: 'long' | 'short';
          quantity?: number;
          entry_price?: number;
          exit_price?: number | null;
          stop_loss?: number | null;
          take_profit?: number | null;
          pnl?: number | null;
          commission?: number | null;
          status?: 'open' | 'closed';
          opened_at?: string;
          closed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      calculate_rank_from_xp: {
        Args: {
          xp: number;
        };
        Returns: string;
      };
      calculate_rank_tier_from_xp: {
        Args: {
          xp: number;
        };
        Returns: number;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
