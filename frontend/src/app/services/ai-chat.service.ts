import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

/** One message in the checkout copilot chat UI. */
export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

/** Body for POST /api/ai-chat — mirrors .NET AiChatRequest. */
export interface AiChatRequestPayload {
  cartItems: { title: string; price: number }[];
  totalAmount: number;
  deliveryType: string;
  savings: number;
  paymentMethod: string;
  userQuestion: string;
}

export interface AiChatReply {
  reply: string;
}

/**
 * Angular → .NET → Groq flow:
 * 1. User sends question from checkout chat UI
 * 2. This service POSTs cart context + question to /api/ai-chat
 * 3. AiChatController forwards to GroqChatService → Groq llama3-8b-8192
 * 4. Short reply returned and shown in chat bubbles
 */
@Injectable({
  providedIn: 'root'
})
export class AiChatService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  askCopilot(payload: AiChatRequestPayload) {
    return this.http.post<AiChatReply>(`${this.apiUrl}/ai-chat`, payload);
  }
}
