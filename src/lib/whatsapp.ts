/**
 * WhatsApp Cloud API Service
 * Handles sending messages via Meta WhatsApp Business API
 */

interface WhatsAppMessagePayload {
    messaging_product: 'whatsapp';
    to: string;
    type: 'text' | 'template' | 'image' | 'document';
    text?: { body: string };
    template?: {
        name: string;
        language: { code: string };
        components?: Array<{
            type: 'body' | 'header';
            parameters: Array<{
                type: 'text' | 'image' | 'document';
                text?: string;
                image?: { link: string };
            }>;
        }>;
    };
}

interface WhatsAppResponse {
    messaging_product: string;
    contacts: Array<{ wa_id: string }>;
    messages: Array<{ id: string }>;
}

interface WhatsAppErrorResponse {
    error: {
        message: string;
        type: string;
        code: number;
        error_subcode?: number;
        fbtrace_id: string;
    };
}

class WhatsAppService {
    private apiToken: string;
    private phoneNumberId: string;
    private businessAccountId: string;
    private apiVersion: string;
    private baseUrl: string;

    constructor() {
        this.apiToken = (process.env.WHATSAPP_API_TOKEN || '').trim();
        this.phoneNumberId = (process.env.WHATSAPP_PHONE_NUMBER_ID || '').trim();
        this.businessAccountId = (process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '').trim();
        this.apiVersion = process.env.WHATSAPP_API_VERSION || 'v21.0';
        this.baseUrl = `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}`;
    }

    /**
     * Check if WhatsApp is configured
     */
    isConfigured(): boolean {
        return !!(this.apiToken && this.phoneNumberId);
    }

    /**
     * Format phone number for WhatsApp API
     * @param phone - Phone number (can include +, spaces, dashes)
     * @returns Formatted phone number (only digits, with country code)
     */
    formatPhoneNumber(phone: string): string {
        // Remove all non-digit characters
        let cleaned = phone.replace(/\D/g, '');

        // If it starts with 0, remove it
        if (cleaned.startsWith('0')) {
            cleaned = cleaned.substring(1);
        }

        // Add India country code (91) if it's a 10-digit number
        if (cleaned.length === 10) {
            cleaned = '91' + cleaned;
        }

        // Ensure it has at least 11 digits (minimal country code + 10 digits)
        // This is a basic check, we assume 91 is the default if only 10 digits

        return cleaned;
    }

    /**
     * Replace variables like {{name}} in content
     */
    replaceVariables(content: string, variables: Record<string, string>): string {
        let result = content;
        for (const [key, value] of Object.entries(variables)) {
            const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
            result = result.replace(regex, value);
        }
        return result;
    }

    /**
     * Send a text message
     */
    async sendTextMessage(phone: string, message: string, variables?: Record<string, string>): Promise<{ success: boolean; messageId?: string; error?: string }> {
        if (!this.isConfigured()) {
            return { success: false, error: 'WhatsApp API not configured' };
        }

        const formattedPhone = this.formatPhoneNumber(phone);
        const finalMessage = variables ? this.replaceVariables(message, variables) : message;

        const payload: WhatsAppMessagePayload = {
            messaging_product: 'whatsapp',
            to: formattedPhone,
            type: 'text',
            text: { body: finalMessage },
        };

        try {
            const response = await fetch(`${this.baseUrl}/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                const errorData = data as WhatsAppErrorResponse;
                console.error('WhatsApp API Error:', errorData);
                return { success: false, error: errorData.error?.message || 'Failed to send message' };
            }

            const successData = data as WhatsAppResponse;
            if (successData.messages && successData.messages.length > 0) {
                return { success: true, messageId: successData.messages[0].id };
            }

            return { success: false, error: 'Meta API returned success but no message ID was found' };
        } catch (error) {
            console.error('WhatsApp API Error:', error);
            return { success: false, error: 'Failed to connect to WhatsApp API' };
        }
    }

    /**
     * Send a template message (for marketing/notifications)
     */
    async sendTemplateMessage(
        phone: string,
        templateName: string,
        languageCode: string = 'en',
        parameters?: Array<{ type: 'text'; text: string }>
    ): Promise<{ success: boolean; messageId?: string; error?: string }> {
        if (!this.isConfigured()) {
            return { success: false, error: 'WhatsApp API not configured' };
        }

        const formattedPhone = this.formatPhoneNumber(phone);

        const payload: WhatsAppMessagePayload = {
            messaging_product: 'whatsapp',
            to: formattedPhone,
            type: 'template',
            template: {
                name: templateName,
                language: { code: languageCode },
                ...(parameters && parameters.length > 0 ? {
                    components: [{
                        type: 'body',
                        parameters: parameters,
                    }],
                } : {}),
            },
        };

        try {
            const response = await fetch(`${this.baseUrl}/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                const errorData = data as WhatsAppErrorResponse;
                console.error('WhatsApp API Error:', errorData);
                return { success: false, error: errorData.error?.message || 'Failed to send template message' };
            }

            const successData = data as WhatsAppResponse;
            if (successData.messages && successData.messages.length > 0) {
                return { success: true, messageId: successData.messages[0].id };
            }

            return { success: false, error: 'Meta API returned success but no message ID was found' };
        } catch (error) {
            console.error('WhatsApp API Error:', error);
            return { success: false, error: 'Failed to connect to WhatsApp API' };
        }
    }

    /**
     * Get registered templates from WhatsApp Business Account
     */
    async getTemplates(): Promise<{ success: boolean; templates?: any[]; error?: string }> {
        if (!this.isConfigured()) {
            return { success: false, error: 'WhatsApp API not configured' };
        }

        if (!this.businessAccountId) {
            return { success: false, error: 'WABA ID not configured' };
        }

        try {
            const response = await fetch(
                `https://graph.facebook.com/${this.apiVersion}/${this.businessAccountId}/message_templates`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiToken}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                console.error('WhatsApp API Error:', data);
                return { success: false, error: data.error?.message || 'Failed to fetch templates' };
            }

            return { success: true, templates: data.data || [] };
        } catch (error) {
            console.error('WhatsApp API Error:', error);
            return { success: false, error: 'Failed to connect to WhatsApp API' };
        }
    }
}

// Export singleton instance
export const whatsappService = new WhatsAppService();
export default whatsappService;
