import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseService.name);
  private supabase: SupabaseClient;
  private adminClient: SupabaseClient;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const supabaseUrl = this.configService.get<string>('supabase.url');
    const supabaseKey = this.configService.get<string>('supabase.anonKey');
    const supabaseServiceKey = this.configService.get<string>('supabase.serviceRoleKey');

    // Cliente público para operações normais
    this.supabase = createClient(supabaseUrl, supabaseKey);

    // Cliente admin para operações privilegiadas (deletar usuários, etc)
    if (supabaseServiceKey) {
      this.adminClient = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
    }

    this.logger.log('Supabase initialized successfully');
  }

  /**
   * Retorna o cliente Supabase público
   */
  getClient(): SupabaseClient {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized');
    }
    return this.supabase;
  }

  /**
   * Retorna o cliente Supabase admin (Service Role)
   */
  getAdminClient(): SupabaseClient {
    if (!this.adminClient) {
      throw new Error('Supabase admin client not initialized');
    }
    return this.adminClient;
  }

  /**
   * Verifica se o Supabase está configurado
   */
  isConfigured(): boolean {
    return !!this.supabase;
  }
}
