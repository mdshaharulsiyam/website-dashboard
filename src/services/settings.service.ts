import { apiClient } from "@/lib/api-client";

export const SETTING_PAGE_NAMES = ["about", "terms", "privacy", "contact"] as const;
export type SettingPageName = (typeof SETTING_PAGE_NAMES)[number];

export interface SocialMediaSettings {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
}

export interface AppearanceSettings {
  primary_color: string;
  secondary_color: string;
  theme: "light" | "dark";
}

export interface SeoSettings {
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
}

export interface CurrencySettings {
  symbol: string;
  code: string;
}

export interface TaxSettings {
  is_enabled: boolean;
  rate: number;
}

export interface ShippingSettings {
  free_shipping_threshold: number;
  standard_rate: number;
}

export interface SupportSettings {
  shipping_heading?: string;
  shipping_description?: string;
  support_heading?: string;
  support_description?: string;
  payment_heading?: string;
  payment_description?: string;
  refund_heading?: string;
  refund_description?: string;
}

export interface LocationSettings {
  type: "Point";
  coordinates: number[];
}

export interface WebSettings {
  logo?: string;
  favicon?: string;
  site_name?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  location?: LocationSettings;
  social_media?: SocialMediaSettings;
  appearance?: AppearanceSettings;
  seo?: SeoSettings;
  currency?: CurrencySettings;
  tax?: TaxSettings;
  shipping?: ShippingSettings;
  supports?: SupportSettings;
  maintenance_mode?: boolean;
  auto_approve_vendor?: boolean;
  auto_approve_product?: boolean;
  vendor_request?: boolean;
  make_admin?: boolean;
  delivery_and_returns?: string;
  confirm_order_text?: string;
  delivery_fee_in_dhaka?: number;
  delivery_fee_outside_dhaka?: number;
  [key: string]: unknown;
}

export interface ContentSetting {
  name: SettingPageName;
  desc: string;
}

export const settingsService = {
  getWebSettings: async (): Promise<{ message: string; data: WebSettings }> => {
    const { data } = await apiClient.get("/web-setting/get");
    return data;
  },

  updateWebSettings: async (
    payload: FormData
  ): Promise<{ message: string; data: WebSettings }> => {
    const { data } = await apiClient.patch("/web-setting/create", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  getSetting: async (name: SettingPageName): Promise<{ message: string; data: ContentSetting }> => {
    const { data } = await apiClient.get(`/setting/${name}`);
    return data;
  },

  getContentSettings: async (): Promise<ContentSetting[]> => {
    const responses = await Promise.all(
      SETTING_PAGE_NAMES.map((name) => settingsService.getSetting(name))
    );

    return responses.map((response) => response.data);
  },

  updateSetting: async (payload: ContentSetting): Promise<{ message: string }> => {
    const { data } = await apiClient.patch("/setting/create", payload);
    return data;
  },
};
