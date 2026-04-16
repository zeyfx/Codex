export interface DiscordUser {
  id: string;
  username: string;
  global_name: string | null;
  avatar: string | null;
  banner: string | null;
  email: string | null;
  locale: string | null;
  premium_type: number | null;
  verified: boolean;
}

export interface UserProfile {
  id: string; // auth.uid() do Supabase (para referências) -> mapeado do discord_id para o id do auth do supabase ou id da tabela profiles (profile.id)
  discordId: string;
  username: string;
  globalName: string | null;
  email: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  locale: string | null;
  premiumType: number | null;
  verified: boolean;
  supabaseId: string;
  plan: string;
  role: string; // Adicionado: admin | user
  joinedAt: string;
}

export interface LibraryItem {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  download_url: string;
  category: string;
  created_at: string;
}
