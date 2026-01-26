import { Component, Input, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
import { PaymentService } from '../../../../../core/services/ecommerce/payment.service';

/**
 * Componente de pago con Stripe Elements
 * Maneja la integración completa con Stripe para procesar pagos
 *
 * Uso:
 * <app-stripe-payment
 *   [amount]="totalAmount"
 *   [orderId]="orderNumber"
 *   (paymentSuccess)="onPaymentSuccess($event)"
 *   (paymentError)="onPaymentError($event)">
 * </app-stripe-payment>
 */
@Component({
  selector: 'app-stripe-payment',
  templateUrl: './stripe-payment.component.html',
  styleUrls: ['./stripe-payment.component.scss']
})
export class StripePaymentComponent implements OnInit {
  @Input() amount: number = 0;
  @Input() orderId?: string;
  @Output() paymentSuccess = new EventEmitter<PaymentResult>();
  @Output() paymentError = new EventEmitter<string>();

  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;
  private cardElement: StripeCardElement | null = null;

  processing = signal(false);
  errorMessage = signal<string>('');
  clientSecret = signal<string>('');



  constructor(private paymentService: PaymentService) {}

  async ngOnInit() {
    await this.initializeStripe();
  }

  /**
   * Inicializa Stripe y crea los elementos de tarjeta
   */
  private async initializeStripe() {
    try {
      // Obtener la publishable key del backend
      const config = await this.paymentService.getConfigStripe().toPromise();
      const publishableKey = config.publishableKey;

      // Inicializar Stripe
      this.stripe = await loadStripe(publishableKey);

      if (!this.stripe) {
        throw new Error('Failed to load Stripe');
      }

      // Crear elementos
      this.elements = this.stripe.elements();

      // Crear el elemento de tarjeta con estilo personalizado
      this.cardElement = this.elements.create('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#32325d',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            '::placeholder': {
              color: '#aab7c4'
            },
            padding: '12px'
          },
          invalid: {
            color: '#fa755a',
            iconColor: '#fa755a'
          }
        },
        hidePostalCode: true
      });

      // Montar el elemento en el DOM
      this.cardElement.mount('#card-element');

      // Escuchar cambios en el elemento
      this.cardElement.on('change', (event) => {
        if (event.error) {
          this.errorMessage.set(event.error.message);
        } else {
          this.errorMessage.set('');
        }
      });

      console.log('Stripe initialized successfully');
    } catch (error: any) {
      console.error('Error initializing Stripe:', error);
      this.errorMessage.set('Error al inicializar el sistema de pagos');
      this.paymentError.emit('Error al inicializar Stripe');
    }
  }

  /**
   * Procesa el pago cuando el usuario hace submit
   */
  async processPayment() {
    if (!this.stripe || !this.cardElement) {
      this.errorMessage.set('Sistema de pagos no inicializado');
      return;
    }

    if (this.amount <= 0) {
      this.errorMessage.set('Monto inválido');
      return;
    }

    this.processing.set(true);
    this.errorMessage.set('');

    try {
      // Paso 1: Crear PaymentIntent en el backend
      const paymentIntent = await this.createPaymentIntent();
      this.clientSecret.set(paymentIntent.clientSecret);

      // Paso 2: Confirmar el pago con Stripe
      const { error, paymentIntent: confirmedIntent } = await this.stripe.confirmCardPayment(
        paymentIntent.clientSecret,
        {
          payment_method: {
            card: this.cardElement,
            billing_details: {
              // Puedes agregar información adicional aquí
            }
          }
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      if (confirmedIntent?.status === 'succeeded') {
        console.log('Payment successful:', confirmedIntent.id);

        const result: PaymentResult = {
          paymentIntentId: confirmedIntent.id,
          amount: this.amount,
          status: confirmedIntent.status,
          orderId: this.orderId
        };

        this.paymentSuccess.emit(result);
        this.errorMessage.set('');
      } else {
        throw new Error('El pago no se completó correctamente');
      }

    } catch (error: any) {
      console.error('Payment error:', error);
      const errorMsg = error.message || 'Error al procesar el pago';
      this.errorMessage.set(errorMsg);
      this.paymentError.emit(errorMsg);
    } finally {
      this.processing.set(false);
    }
  }

  /**
   * Crea un PaymentIntent en el backend
   */
  private async createPaymentIntent(): Promise<{ clientSecret: string }> {
    const response = await this.paymentService.createPaymentIntent({
        amount: this.amount,
        description: this.orderId ? `Order #${this.orderId}` : 'AngieBraids Order'
      }
    ).toPromise();

    return response;
  }

  /**
   * Limpia el formulario
   */
  reset() {
    this.cardElement?.clear();
    this.errorMessage.set('');
    this.processing.set(false);
  }
}

export interface PaymentResult {
  paymentIntentId: string;
  amount: number;
  status: string;
  orderId?: string;
}
