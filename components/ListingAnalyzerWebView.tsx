import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  Modal,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PropertyData } from '../utils/listingAnalyzer';

interface ListingAnalyzerWebViewProps {
  visible: boolean;
  url: string;
  onClose: () => void;
  onDataExtracted: (data: PropertyData) => void;
  onError: (error: string) => void;
  autoExtract?: boolean;
  onAutoExtracted?: () => void;
}

export default function ListingAnalyzerWebView({
  visible,
  url,
  onClose,
  onDataExtracted,
  onError,
  autoExtract = false,
  onAutoExtracted,
}: ListingAnalyzerWebViewProps) {
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState(url);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const autoExtractedRef = useRef(false);

  useEffect(() => {
    if (!visible) {
      autoExtractedRef.current = false;
      return;
    }
    if (autoExtract && !loading && !autoExtractedRef.current) {
      autoExtractedRef.current = true;
      extractData();
      onAutoExtracted?.();
    }
  }, [autoExtract, loading, visible, onAutoExtracted]);

  const handleLoadStart = () => {
    setLoading(true);
  };

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleNavigationStateChange = (navState: any) => {
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);
    setCurrentUrl(navState.url);
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'extract_data') {
        if (data.success) {
          onDataExtracted(data.propertyData);
          onClose();
        } else {
          onError(data.error || 'Errore durante l\'estrazione dei dati');
        }
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  const extractData = () => {
    const extractionScript = `
      (function() {
        try {
          const data = {};
          
          // Extract title
          const titleSelectors = [
            'h1[data-testid="ad-title"]',
            'h1[class*="title"]',
            'h1[class*="main-info-title"]',
            '.ad-title',
            '.property-title'
          ];
          
          for (const selector of titleSelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent?.trim()) {
              data.title = element.textContent.trim();
              break;
            }
          }
          
          // Extract description
          const descSelectors = [
            '[data-testid="ad-description"]',
            '[class*="description"]',
            '.ad-description',
            '.property-description'
          ];
          
          for (const selector of descSelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent?.trim()) {
              data.description = element.textContent.trim();
              break;
            }
          }
          
          // Extract price
          const priceSelectors = [
            '[data-testid="ad-price"]',
            '[class*="price"]',
            '.ad-price',
            '.property-price'
          ];
          
          for (const selector of priceSelectors) {
            const element = document.querySelector(selector);
            if (element) {
              const priceText = element.textContent?.trim() || '';
              const priceMatch = priceText.match(/[\\d.,]+/);
              if (priceMatch) {
                data.price = parseFloat(priceMatch[0].replace(/[.,]/g, '').replace(',', '.'));
                break;
              }
            }
          }
          
          // Extract location
          const locationSelectors = [
            '[data-testid="ad-location"]',
            '[class*="location"]',
            '.ad-location',
            '.property-location'
          ];
          
          for (const selector of locationSelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent?.trim()) {
              data.location = element.textContent.trim();
              break;
            }
          }
          
          // Extract property type
          const typeSelectors = [
            '[data-testid="ad-category"]',
            '[class*="property-type"]',
            '.ad-category',
            '.property-type'
          ];
          
          for (const selector of typeSelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent?.trim()) {
              data.propertyType = element.textContent.trim();
              break;
            }
          }
          
          // Extract numeric details
          const extractNumber = (selectors, keyword) => {
            for (const selector of selectors) {
              const elements = document.querySelectorAll(selector);
              for (const element of elements) {
                const text = element.textContent || '';
                if (text.toLowerCase().includes(keyword.toLowerCase())) {
                  const match = text.match(/\\d+/);
                  if (match) return parseInt(match[0]);
                }
              }
            }
            return null;
          };
          
          const detailSelectors = [
            '.ad-details__item',
            '[class*="details"] li',
            '.property-details li',
            '.ad-info li'
          ];
          
          data.rooms = extractNumber(detailSelectors, 'locali') || 0;
          data.bedrooms = extractNumber(detailSelectors, 'camere') || 0;
          data.bathrooms = extractNumber(detailSelectors, 'bagni') || 0;
          data.squareMeters = extractNumber(detailSelectors, 'm²') || 0;
          
          // Extract floor
          const floorText = extractNumber(detailSelectors, 'piano');
          data.floor = floorText ? floorText.toString() : '';
          
          // Extract energy class
          const energyText = extractNumber(detailSelectors, 'classe energetica');
          data.energyClass = energyText ? energyText.toString() : '';
          
          // Extract images
          const imageSelectors = [
            '.ad-image img',
            '.gallery img',
            '[class*="gallery"] img',
            '.property-images img',
            '.ad-photos img'
          ];
          
          data.images = [];
          for (const selector of imageSelectors) {
            const images = document.querySelectorAll(selector);
            for (const img of images) {
              const src = img.src || img.getAttribute('data-src') || img.getAttribute('data-lazy');
              if (src && !src.includes('watermark') && !src.includes('logo')) {
                data.images.push(src);
              }
            }
            if (data.images.length > 0) break;
          }
          
          // Extract features
          data.features = [];
          for (const selector of detailSelectors) {
            const elements = document.querySelectorAll(selector);
            for (const element of elements) {
              const text = element.textContent?.trim();
              if (text && text.length > 0) {
                data.features.push(text);
              }
            }
            if (data.features.length > 0) break;
          }
          
          // Get coordinates if available
          const mapSelectors = [
            '[data-lat]',
            '[data-latitude]',
            '.map',
            '[class*="map"]'
          ];
          
          for (const selector of mapSelectors) {
            const element = document.querySelector(selector);
            if (element) {
              const lat = element.getAttribute('data-lat') || element.getAttribute('data-latitude');
              const lng = element.getAttribute('data-lng') || element.getAttribute('data-longitude');
              if (lat && lng) {
                data.coordinates = {
                  latitude: parseFloat(lat),
                  longitude: parseFloat(lng)
                };
                break;
              }
            }
          }
          
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'extract_data',
            success: true,
            propertyData: data
          }));
        } catch (error) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'extract_data',
            success: false,
            error: error.message
          }));
        }
      })();
    `;

    webViewRef.current?.injectJavaScript(extractionScript);
  };

  const goBack = () => {
    webViewRef.current?.goBack();
  };

  const goForward = () => {
    webViewRef.current?.goForward();
  };

  const reload = () => {
    webViewRef.current?.reload();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={onClose} style={styles.headerButton}>
              <MaterialIcons name="close" size={24} color="white" />
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>Analizza Listing</Text>
            
            <TouchableOpacity onPress={extractData} style={styles.headerButton}>
              <MaterialIcons name="check" size={24} color="white" />
            </TouchableOpacity>
          </View>
          
          {/* Navigation Controls */}
          <View style={styles.navigationControls}>
            <TouchableOpacity
              onPress={goBack}
              disabled={!canGoBack}
              style={[styles.navButton, !canGoBack && styles.navButtonDisabled]}
            >
              <MaterialIcons name="arrow-back" size={20} color={canGoBack ? "white" : "#ccc"} />
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={goForward}
              disabled={!canGoForward}
              style={[styles.navButton, !canGoForward && styles.navButtonDisabled]}
            >
              <MaterialIcons name="arrow-forward" size={20} color={canGoForward ? "white" : "#ccc"} />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={reload} style={styles.navButton}>
              <MaterialIcons name="refresh" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* WebView */}
        <View style={styles.webViewContainer}>
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#667eea" />
              <Text style={styles.loadingText}>Caricamento...</Text>
            </View>
          )}
          
          <WebView
            ref={webViewRef}
            source={{ uri: currentUrl }}
            style={styles.webView}
            onLoadStart={handleLoadStart}
            onLoadEnd={handleLoadEnd}
            onNavigationStateChange={handleNavigationStateChange}
            onMessage={handleMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scalesPageToFit={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  navigationControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  navButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  navButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  webViewContainer: {
    flex: 1,
    position: 'relative',
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});
