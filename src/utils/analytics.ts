// Centralized Analytics utility for Google Analytics 4 (GA4) and Meta Pixel (Facebook)

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }
}

const GA_ID = import.meta.env.VITE_GA_TRACKING_ID as string | undefined;
const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID as string | undefined;

let isInitialized = false;

/**
 * Initializes GA4 and Meta Pixel asynchronously.
 * Only injects scripts if the respective IDs are provided in environment variables.
 */
export const initAnalytics = (): void => {
  if (isInitialized || typeof window === 'undefined') return;

  // 1. Google Analytics 4
  if (GA_ID && GA_ID.trim() !== '') {
    try {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID.trim()}`;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      window.gtag = function () {
        window.dataLayer.push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', GA_ID.trim(), {
        send_page_view: true,
      });
      console.log('[Analytics] GA4 inicializado con ID:', GA_ID.trim());
    } catch (err) {
      console.warn('[Analytics] Error inicializando GA4:', err);
    }
  }

  // 2. Meta Pixel
  if (PIXEL_ID && PIXEL_ID.trim() !== '') {
    try {
      /* eslint-disable */
      (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      /* eslint-enable */

      if (window.fbq) {
        window.fbq('init', PIXEL_ID.trim());
        window.fbq('track', 'PageView');
        console.log('[Analytics] Meta Pixel inicializado con ID:', PIXEL_ID.trim());
      }
    } catch (err) {
      console.warn('[Analytics] Error inicializando Meta Pixel:', err);
    }
  }

  isInitialized = true;
};

/**
 * Tracks a form lead conversion (Google: generate_lead, Meta: Lead)
 */
export const trackLeadSubmission = (leadInfo?: { name?: string; email?: string }): void => {
  if (window.gtag && GA_ID) {
    window.gtag('event', 'generate_lead', {
      event_category: 'Engagement',
      event_label: 'Formulario de Contacto Landing',
    });
  }

  if (window.fbq && PIXEL_ID) {
    window.fbq('track', 'Lead', {
      content_name: 'Formulario de Contacto Landing',
      currency: 'PEN',
      value: 0,
    });
  }
};

/**
 * Tracks when a user clicks on "Elegir Plan" via WhatsApp
 */
export const trackPlanClick = (planName: string, price: string, currency: 'PEN' | 'USD'): void => {
  const numericPrice = parseFloat(price.replace(/,/g, '')) || 0;

  if (window.gtag && GA_ID) {
    window.gtag('event', 'select_item', {
      item_list_name: 'Planes de Desarrollo Web',
      items: [
        {
          item_name: planName,
          price: numericPrice,
          currency: currency,
        },
      ],
    });
    window.gtag('event', 'contact', {
      method: 'WhatsApp',
      plan_name: planName,
    });
  }

  if (window.fbq && PIXEL_ID) {
    window.fbq('track', 'Contact', {
      content_name: planName,
      currency: currency,
      value: numericPrice,
    });
    window.fbq('track', 'ViewContent', {
      content_name: `Plan ${planName}`,
      currency: currency,
      value: numericPrice,
    });
  }
};

/**
 * Tracks clicks on the general floating WhatsApp button
 */
export const trackFloatingWhatsAppClick = (): void => {
  if (window.gtag && GA_ID) {
    window.gtag('event', 'contact', {
      method: 'WhatsApp_Floating',
    });
  }

  if (window.fbq && PIXEL_ID) {
    window.fbq('track', 'Contact', {
      content_name: 'WhatsApp Flotante General',
    });
  }
};

/**
 * Tracks clicks on the custom enterprise banner
 */
export const trackCustomEnterpriseClick = (): void => {
  if (window.gtag && GA_ID) {
    window.gtag('event', 'contact', {
      method: 'WhatsApp_Enterprise',
      content_category: 'software_a_medida',
    });
  }

  if (window.fbq && PIXEL_ID) {
    window.fbq('track', 'Contact', {
      content_name: 'Software a Medida Enterprise',
    });
  }
};
