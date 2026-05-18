import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  OnInit,
  AfterViewChecked,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiChatService, ChatMessage } from '../../services/ai-chat.service';
import { CheckoutInsight } from '../../services/ai.service';

@Component({
  selector: 'app-ai-copilot-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-copilot-chat.html',
  styleUrls: ['./ai-copilot-chat.css']
})
export class AiCopilotChat implements OnInit, AfterViewChecked, AfterViewInit, OnChanges {
  @Input() cartItems: any[] = [];
  @Input() totalAmount = 0;
  @Input() insights: CheckoutInsight | null = null;
  @Input() disabled = false;
  @Input() expanded = true;
  @Input() inModal = false;
  @Input() active = false;

  @ViewChild('scrollArea') scrollArea?: ElementRef<HTMLDivElement>;
  @ViewChild('chatInput') chatInput?: ElementRef<HTMLInputElement>;

  messages: ChatMessage[] = [];
  userInput = '';
  isTyping = false;
  chatError: string | null = null;

  readonly quickPrompts = [
    'How can I save more?',
    'Best delivery option?',
    'Best payment method?',
    'Can I reduce total cost?',
    'Which option gives best value?'
  ];

  private shouldScroll = false;

  constructor(
    private aiChatService: AiChatService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.messages.push({
      role: 'assistant',
      text: 'SmartCheckout Copilot ready — I’ve reviewed your cart and can optimize savings, delivery speed, and payment choice to get you through checkout faster. What should we improve first?',
      timestamp: new Date()
    });
  }

  ngAfterViewInit(): void {
    this.focusInput();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['disabled'] && !this.disabled) {
      setTimeout(() => this.focusInput(), 100);
    }
    if (changes['active'] && this.active && !this.disabled) {
      setTimeout(() => this.focusInput(), 150);
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  sendMessage(text?: string): void {
    const question = (text ?? this.userInput).trim();
    if (!question || this.isTyping || this.disabled) return;

    if (this.cartItems.length === 0) {
      this.chatError = 'Add items to your cart before asking AI.';
      return;
    }

    this.chatError = null;
    this.userInput = '';

    this.messages.push({
      role: 'user',
      text: question,
      timestamp: new Date()
    });
    this.isTyping = true;
    this.shouldScroll = true;
    this.cdr.markForCheck();

    this.aiChatService
      .askCopilot({
        cartItems: this.cartItems.map(item => ({
          title: item.node?.title ?? 'Item',
          price: Number(item.node?.variants?.edges?.[0]?.node?.price?.amount ?? 0)
        })),
        totalAmount: this.totalAmount,
        deliveryType: this.insights?.estimatedDelivery ?? 'Standard',
        savings: this.insights?.savings ?? 0,
        paymentMethod: this.insights?.recommendedPayment ?? 'Credit Card',
        userQuestion: question
      })
      .subscribe({
        next: res => {
          this.messages.push({
            role: 'assistant',
            text: res.reply,
            timestamp: new Date()
          });
          this.isTyping = false;
          this.shouldScroll = true;
          this.cdr.markForCheck();
          this.focusInput();
        },
        error: () => {
          this.chatError = 'Could not reach AI. Check backend and Groq API key.';
          this.isTyping = false;
          this.cdr.markForCheck();
          this.focusInput();
        }
      });
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  useQuickPrompt(prompt: string): void {
    this.sendMessage(prompt);
  }

  private scrollToBottom(): void {
    const el = this.scrollArea?.nativeElement;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }

  private focusInput(): void {
    if (!this.disabled && this.chatInput?.nativeElement) {
      this.chatInput.nativeElement.focus();
    }
  }
}
