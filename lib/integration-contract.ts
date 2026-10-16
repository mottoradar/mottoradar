/** Shared contract for future source-specific adapters (API, XML/CSV feed, etc.). */
export type NormalizedMotorcycleListing = {
  externalId?: string;
  title: string;
  brand?: string;
  model?: string;
  version?: string;
  year?: number;
  mileageKm?: number;
  priceBrl?: number;
  city?: string;
  state?: string;
  url: string;
  publishedAt?: string;
  imageUrl?: string;
  condition?: 'new' | 'used' | 'unknown';
};

export type NormalizedProductListing = {
  externalId?: string;
  title: string;
  category: string;
  brand?: string;
  priceBrl: number;
  url: string;
  imageUrl?: string;
  inStock?: boolean;
};

export type NormalizedSourceBatch = {
  sourceName: string;
  sourceUrl?: string;
  listings?: NormalizedMotorcycleListing[];
  products?: NormalizedProductListing[];
};

/** An adapter should only access sources using documented, permitted methods. */
export interface SourceAdapter {
  readonly sourceName: string;
  fetchBatch(): Promise<NormalizedSourceBatch>;
}
