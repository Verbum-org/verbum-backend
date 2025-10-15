import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

/**
 * Serviço de gerenciamento de webhooks
 * Adaptado para Supabase - implementação básica
 */
@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Registra evento de webhook recebido
   */
  async handleIncomingWebhook(source: string, eventType: string, payload: any): Promise<void> {
    const supabase = this.supabaseService.getClient();

    await supabase.from('webhook_events').insert({
      source,
      event_type: eventType,
      payload,
      status: 'pending',
    });

    this.logger.log(`Webhook recebido: ${source} - ${eventType}`);
  }

  /**
   * Lista eventos de webhook da organização
   */
  async findAll(organizationId: string, limit = 50): Promise<any[]> {
    const supabase = this.supabaseService.getClient();

    const { data } = await supabase
      .from('webhook_events')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(limit);

    return data || [];
  }
}
