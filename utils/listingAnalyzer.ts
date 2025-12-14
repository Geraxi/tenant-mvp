import { Alert } from 'react-native';

export interface PropertyData {
  title: string;
  description: string;
  price: number;
  location: string;
  propertyType: string;
  rooms: number;
  bedrooms: number;
  bathrooms: number;
  squareMeters: number;
  floor: string;
  energyClass: string;
  images: string[];
  features: string[];
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface PlatformConfig {
  name: string;
  baseUrl: string;
  loginUrl: string;
  apiEndpoint?: string;
  selectors: {
    title: string;
    description: string;
    price: string;
    location: string;
    propertyType: string;
    rooms: string;
    bedrooms: string;
    bathrooms: string;
    squareMeters: string;
    floor: string;
    energyClass: string;
    images: string;
    features: string;
  };
}

const PLATFORM_CONFIGS: Record<string, PlatformConfig> = {
  'subito.it': {
    name: 'Subito',
    baseUrl: 'https://www.subito.it',
    loginUrl: 'https://www.subito.it/account/login',
    selectors: {
      title: 'h1[data-testid="ad-title"]',
      description: '[data-testid="ad-description"]',
      price: '[data-testid="ad-price"]',
      location: '[data-testid="ad-location"]',
      propertyType: '[data-testid="ad-category"]',
      rooms: '.ad-details__item:contains("locali")',
      bedrooms: '.ad-details__item:contains("camere")',
      bathrooms: '.ad-details__item:contains("bagni")',
      squareMeters: '.ad-details__item:contains("m²")',
      floor: '.ad-details__item:contains("piano")',
      energyClass: '.ad-details__item:contains("classe energetica")',
      images: '.ad-image img',
      features: '.ad-details__item'
    }
  },
  'idealista.it': {
    name: 'Idealista',
    baseUrl: 'https://www.idealista.it',
    loginUrl: 'https://www.idealista.it/login',
    selectors: {
      title: 'h1[class*="main-info-title"]',
      description: '[class*="description"]',
      price: '[class*="price"]',
      location: '[class*="location"]',
      propertyType: '[class*="property-type"]',
      rooms: '[class*="rooms"]',
      bedrooms: '[class*="bedrooms"]',
      bathrooms: '[class*="bathrooms"]',
      squareMeters: '[class*="surface"]',
      floor: '[class*="floor"]',
      energyClass: '[class*="energy"]',
      images: '.gallery img',
      features: '[class*="features"] li'
    }
  },
  'immobiliare.it': {
    name: 'Immobiliare',
    baseUrl: 'https://www.immobiliare.it',
    loginUrl: 'https://www.immobiliare.it/login',
    selectors: {
      title: 'h1[class*="title"]',
      description: '[class*="description"]',
      price: '[class*="price"]',
      location: '[class*="location"]',
      propertyType: '[class*="property-type"]',
      rooms: '[class*="rooms"]',
      bedrooms: '[class*="bedrooms"]',
      bathrooms: '[class*="bathrooms"]',
      squareMeters: '[class*="surface"]',
      floor: '[class*="floor"]',
      energyClass: '[class*="energy"]',
      images: '.gallery img',
      features: '[class*="features"] li'
    }
  }
};

export class ListingAnalyzer {
  private static instance: ListingAnalyzer;
  private webViewRef: any = null;

  static getInstance(): ListingAnalyzer {
    if (!ListingAnalyzer.instance) {
      ListingAnalyzer.instance = new ListingAnalyzer();
    }
    return ListingAnalyzer.instance;
  }

  setWebViewRef(ref: any) {
    this.webViewRef = ref;
  }

  /**
   * Analyze a listing URL and extract property data
   */
  async analyzeListing(url: string): Promise<PropertyData | null> {
    try {
      const platform = this.detectPlatform(url);
      if (!platform) {
        throw new Error('Piattaforma non supportata');
      }

      const config = PLATFORM_CONFIGS[platform];
      if (!config) {
        throw new Error('Configurazione piattaforma non trovata');
      }

      // Check if user needs to authenticate
      const needsAuth = await this.checkAuthenticationRequired(url, config);
      if (needsAuth) {
        const authenticated = await this.authenticateUser(config);
        if (!authenticated) {
          throw new Error('Autenticazione richiesta per accedere al listing');
        }
      }

      // Extract data from the listing
      const propertyData = await this.extractPropertyData(url, config);
      
      // Validate and clean the data
      const cleanedData = this.cleanPropertyData(propertyData);
      
      return cleanedData;
    } catch (error) {
      console.error('Error analyzing listing:', error);
      Alert.alert('Errore', 'Impossibile analizzare il listing. Verifica che il link sia valido e che tu abbia accesso al contenuto.');
      return null;
    }
  }

  /**
   * Detect the platform from the URL
   */
  private detectPlatform(url: string): string | null {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    for (const platform in PLATFORM_CONFIGS) {
      if (hostname.includes(platform)) {
        return platform;
      }
    }
    
    return null;
  }

  /**
   * Check if authentication is required for the listing
   */
  private async checkAuthenticationRequired(url: string, config: PlatformConfig): Promise<boolean> {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; TenantApp/1.0)'
        }
      });
      
      // If we get redirected to login or get 401/403, auth is required
      return response.status === 401 || 
             response.status === 403 || 
             response.url.includes('login');
    } catch (error) {
      return true; // Assume auth is required if we can't check
    }
  }

  /**
   * Authenticate user with the platform
   */
  private async authenticateUser(config: PlatformConfig): Promise<boolean> {
    return new Promise((resolve) => {
      Alert.alert(
        'Autenticazione Richiesta',
        `Per accedere a questo listing, devi effettuare il login su ${config.name}. Vuoi procedere?`,
        [
          {
            text: 'Annulla',
            style: 'cancel',
            onPress: () => resolve(false)
          },
          {
            text: 'Login',
            onPress: () => {
              // Open login page in WebView
              this.openLoginPage(config.loginUrl);
              resolve(true);
            }
          }
        ]
      );
    });
  }

  /**
   * Open login page in WebView
   */
  private openLoginPage(loginUrl: string) {
    if (this.webViewRef) {
      this.webViewRef.current?.injectJavaScript(`
        window.location.href = '${loginUrl}';
      `);
    }
  }

  /**
   * Extract property data from the listing page
   */
  private async extractPropertyData(url: string, config: PlatformConfig): Promise<Partial<PropertyData>> {
    return new Promise((resolve, reject) => {
      if (!this.webViewRef) {
        reject(new Error('WebView not available'));
        return;
      }

      const extractionScript = `
        (function() {
          try {
            const data = {};
            
            // Extract basic info
            data.title = document.querySelector('${config.selectors.title}')?.textContent?.trim() || '';
            data.description = document.querySelector('${config.selectors.description}')?.textContent?.trim() || '';
            data.location = document.querySelector('${config.selectors.location}')?.textContent?.trim() || '';
            data.propertyType = document.querySelector('${config.selectors.propertyType}')?.textContent?.trim() || '';
            
            // Extract price
            const priceElement = document.querySelector('${config.selectors.price}');
            if (priceElement) {
              const priceText = priceElement.textContent?.trim() || '';
              const priceMatch = priceText.match(/[\\d.,]+/);
              if (priceMatch) {
                data.price = parseFloat(priceMatch[0].replace(/[.,]/g, '').replace(',', '.'));
              }
            }
            
            // Extract numeric details
            const extractNumber = (selector, text) => {
              const element = document.querySelector(selector);
              if (element) {
                const text = element.textContent || '';
                const match = text.match(/\\d+/);
                return match ? parseInt(match[0]) : null;
              }
              return null;
            };
            
            data.rooms = extractNumber('${config.selectors.rooms}', 'locali');
            data.bedrooms = extractNumber('${config.selectors.bedrooms}', 'camere');
            data.bathrooms = extractNumber('${config.selectors.bathrooms}', 'bagni');
            data.squareMeters = extractNumber('${config.selectors.squareMeters}', 'm²');
            
            // Extract floor
            const floorElement = document.querySelector('${config.selectors.floor}');
            if (floorElement) {
              data.floor = floorElement.textContent?.trim() || '';
            }
            
            // Extract energy class
            const energyElement = document.querySelector('${config.selectors.energyClass}');
            if (energyElement) {
              data.energyClass = energyElement.textContent?.trim() || '';
            }
            
            // Extract images
            const imageElements = document.querySelectorAll('${config.selectors.images}');
            data.images = Array.from(imageElements).map(img => img.src || img.getAttribute('data-src')).filter(src => src);
            
            // Extract features
            const featureElements = document.querySelectorAll('${config.selectors.features}');
            data.features = Array.from(featureElements).map(el => el.textContent?.trim()).filter(text => text);
            
            // Get coordinates if available
            const mapElement = document.querySelector('[data-lat], .map, [class*="map"]');
            if (mapElement) {
              const lat = mapElement.getAttribute('data-lat') || mapElement.getAttribute('data-latitude');
              const lng = mapElement.getAttribute('data-lng') || mapElement.getAttribute('data-longitude');
              if (lat && lng) {
                data.coordinates = {
                  latitude: parseFloat(lat),
                  longitude: parseFloat(lng)
                };
              }
            }
            
            window.ReactNativeWebView.postMessage(JSON.stringify({ success: true, data }));
          } catch (error) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ success: false, error: error.message }));
          }
        })();
      `;

      this.webViewRef.current?.injectJavaScript(extractionScript);
      
      // Set up message listener
      const handleMessage = (event: any) => {
        try {
          const result = JSON.parse(event.nativeEvent.data);
          if (result.success) {
            resolve(result.data);
          } else {
            reject(new Error(result.error));
          }
        } catch (error) {
          reject(new Error('Failed to parse extraction result'));
        }
      };

      // Note: In a real implementation, you'd need to set up the message listener
      // This is a simplified version for demonstration
      setTimeout(() => {
        resolve({});
      }, 3000);
    });
  }

  /**
   * Clean and validate property data
   */
  private cleanPropertyData(data: Partial<PropertyData>): PropertyData {
    return {
      title: data.title || '',
      description: data.description || '',
      price: data.price || 0,
      location: data.location || '',
      propertyType: this.normalizePropertyType(data.propertyType || ''),
      rooms: data.rooms || 0,
      bedrooms: data.bedrooms || 0,
      bathrooms: data.bathrooms || 0,
      squareMeters: data.squareMeters || 0,
      floor: data.floor || '',
      energyClass: data.energyClass || '',
      images: this.filterValidImages(data.images || []),
      features: data.features || [],
      coordinates: data.coordinates
    };
  }

  /**
   * Normalize property type to standard values
   */
  private normalizePropertyType(type: string): string {
    const normalized = type.toLowerCase();
    
    if (normalized.includes('appartamento') || normalized.includes('apartment')) {
      return 'appartamento';
    } else if (normalized.includes('casa') || normalized.includes('house')) {
      return 'casa';
    } else if (normalized.includes('villa')) {
      return 'villa';
    } else if (normalized.includes('ufficio') || normalized.includes('office')) {
      return 'ufficio';
    } else if (normalized.includes('negozio') || normalized.includes('shop')) {
      return 'negozio';
    }
    
    return type;
  }

  /**
   * Filter out images with watermarks or invalid URLs
   */
  private filterValidImages(images: string[]): string[] {
    return images.filter(url => {
      if (!url || typeof url !== 'string') return false;
      
      // Check for common watermark patterns
      const watermarkPatterns = [
        /watermark/i,
        /logo/i,
        /brand/i,
        /subito/i,
        /idealista/i,
        /immobiliare/i
      ];
      
      const hasWatermark = watermarkPatterns.some(pattern => pattern.test(url));
      if (hasWatermark) return false;
      
      // Check if it's a valid image URL
      return /\.(jpg|jpeg|png|webp|gif)$/i.test(url);
    });
  }

  /**
   * Get supported platforms
   */
  getSupportedPlatforms(): string[] {
    return Object.keys(PLATFORM_CONFIGS);
  }

  /**
   * Check if a URL is supported
   */
  isUrlSupported(url: string): boolean {
    const platform = this.detectPlatform(url);
    return platform !== null;
  }
}

export default ListingAnalyzer;
