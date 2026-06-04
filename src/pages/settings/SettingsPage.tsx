import { useEffect, useRef, useState } from "react";
import {
  ImageIcon,
  Loader2,
  Save,
} from "lucide-react";
import { useContentSettings, useUpdateContentSettings, useUpdateWebSettings, useWebSettings } from "@/hooks/use-settings";
import { PageHeader } from "@/components/shared/page-header";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { imageUrl } from "@/lib/api-client";
import { SETTING_PAGE_NAMES, type SettingPageName } from "@/services/settings.service";

type WebFormState = {
  site_name: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  longitude: string;
  latitude: string;
  social_media: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
  };
  appearance: {
    primary_color: string;
    secondary_color: string;
    theme: "light" | "dark";
  };
  seo: {
    meta_title: string;
    meta_description: string;
    meta_keywords: string;
  };
  currency: {
    symbol: string;
    code: string;
  };
  tax: {
    is_enabled: boolean;
    rate: string;
  };
  shipping: {
    free_shipping_threshold: string;
    standard_rate: string;
  };
  delivery_fee_in_dhaka: string;
  delivery_fee_outside_dhaka: string;
  maintenance_mode: boolean;
  auto_approve_vendor: boolean;
  auto_approve_product: boolean;
  vendor_request: boolean;
  make_admin: boolean;
  supports: {
    shipping_heading: string;
    shipping_description: string;
    support_heading: string;
    support_description: string;
    payment_heading: string;
    payment_description: string;
    refund_heading: string;
    refund_description: string;
  };
  delivery_and_returns: string;
  confirm_order_text: string;
  affiliate_percentage: string;
  affiliate_policy: string;
};

type ContentFormState = Record<SettingPageName, string>;
type EditorPageName = Exclude<SettingPageName, "contact">;
type OperationToggleKey =
  | "maintenance_mode"
  | "auto_approve_vendor"
  | "auto_approve_product"
  | "vendor_request"
  | "make_admin";

const OPERATION_TOGGLES: { key: OperationToggleKey; label: string }[] = [
  { key: "maintenance_mode", label: "Maintenance Mode" },
  { key: "auto_approve_vendor", label: "Auto Approve Vendor" },
  { key: "auto_approve_product", label: "Auto Approve Product" },
  { key: "vendor_request", label: "Vendor Request" },
  { key: "make_admin", label: "Make Admin" },
];

const EDITOR_PAGE_NAMES: EditorPageName[] = ["about", "terms", "privacy"];

const EMPTY_WEB_FORM: WebFormState = {
  site_name: "",
  contact_email: "",
  contact_phone: "",
  address: "",
  longitude: "0",
  latitude: "0",
  social_media: {
    facebook: "",
    twitter: "",
    instagram: "",
    linkedin: "",
  },
  appearance: {
    primary_color: "#000000",
    secondary_color: "#FFFFFF",
    theme: "light",
  },
  seo: {
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
  },
  currency: {
    symbol: "TK",
    code: "BDT",
  },
  tax: {
    is_enabled: false,
    rate: "0",
  },
  shipping: {
    free_shipping_threshold: "0",
    standard_rate: "0",
  },
  delivery_fee_in_dhaka: "70",
  delivery_fee_outside_dhaka: "130",
  maintenance_mode: false,
  auto_approve_vendor: false,
  auto_approve_product: false,
  vendor_request: true,
  make_admin: true,
  supports: {
    shipping_heading: "",
    shipping_description: "",
    support_heading: "",
    support_description: "",
    payment_heading: "",
    payment_description: "",
    refund_heading: "",
    refund_description: "",
  },
  delivery_and_returns: "",
  confirm_order_text: "",
  affiliate_percentage: "4",
  affiliate_policy: "",
};

const EMPTY_CONTENT_FORM = SETTING_PAGE_NAMES.reduce((acc, name) => {
  acc[name] = "";
  return acc;
}, {} as ContentFormState);

export default function SettingsPage() {
  const { data: webData, isLoading: webLoading, isError: webError, refetch: refetchWeb } = useWebSettings();
  const { data: contentData, isLoading: contentLoading, isError: contentError, refetch: refetchContent } = useContentSettings();
  const updateWeb = useUpdateWebSettings();
  const updateContent = useUpdateContentSettings();

  const [webForm, setWebForm] = useState<WebFormState>(EMPTY_WEB_FORM);
  const [contentForm, setContentForm] = useState<ContentFormState>(EMPTY_CONTENT_FORM);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const settings = webData?.data;

  useEffect(() => {
    if (!settings) return;

    setWebForm({
      site_name: String(settings.site_name ?? ""),
      contact_email: String(settings.contact_email ?? ""),
      contact_phone: String(settings.contact_phone ?? ""),
      address: String(settings.address ?? ""),
      longitude: String(settings.location?.coordinates?.[0] ?? 0),
      latitude: String(settings.location?.coordinates?.[1] ?? 0),
      social_media: {
        facebook: String(settings.social_media?.facebook ?? ""),
        twitter: String(settings.social_media?.twitter ?? ""),
        instagram: String(settings.social_media?.instagram ?? ""),
        linkedin: String(settings.social_media?.linkedin ?? ""),
      },
      appearance: {
        primary_color: String(settings.appearance?.primary_color ?? "#000000"),
        secondary_color: String(settings.appearance?.secondary_color ?? "#FFFFFF"),
        theme: settings.appearance?.theme === "dark" ? "dark" : "light",
      },
      seo: {
        meta_title: String(settings.seo?.meta_title ?? ""),
        meta_description: String(settings.seo?.meta_description ?? ""),
        meta_keywords: (settings.seo?.meta_keywords ?? []).join(", "),
      },
      currency: {
        symbol: String(settings.currency?.symbol ?? "TK"),
        code: String(settings.currency?.code ?? "BDT"),
      },
      tax: {
        is_enabled: Boolean(settings.tax?.is_enabled),
        rate: String(settings.tax?.rate ?? 0),
      },
      shipping: {
        free_shipping_threshold: String(settings.shipping?.free_shipping_threshold ?? 0),
        standard_rate: String(settings.shipping?.standard_rate ?? 0),
      },
      delivery_fee_in_dhaka: String(settings.delivery_fee_in_dhaka ?? 70),
      delivery_fee_outside_dhaka: String(settings.delivery_fee_outside_dhaka ?? 130),
      maintenance_mode: Boolean(settings.maintenance_mode),
      auto_approve_vendor: Boolean(settings.auto_approve_vendor),
      auto_approve_product: Boolean(settings.auto_approve_product),
      vendor_request: settings.vendor_request !== false,
      make_admin: settings.make_admin !== false,
      supports: {
        shipping_heading: String(settings.supports?.shipping_heading ?? ""),
        shipping_description: String(settings.supports?.shipping_description ?? ""),
        support_heading: String(settings.supports?.support_heading ?? ""),
        support_description: String(settings.supports?.support_description ?? ""),
        payment_heading: String(settings.supports?.payment_heading ?? ""),
        payment_description: String(settings.supports?.payment_description ?? ""),
        refund_heading: String(settings.supports?.refund_heading ?? ""),
        refund_description: String(settings.supports?.refund_description ?? ""),
      },
      delivery_and_returns: String(settings.delivery_and_returns ?? ""),
      confirm_order_text: String(settings.confirm_order_text ?? ""),
      affiliate_percentage: String(settings.affiliate_percentage ?? 4),
      affiliate_policy: String(settings.affiliate_policy ?? ""),
    });
  }, [settings]);

  useEffect(() => {
    if (!contentData) return;

    setContentForm((previous) => {
      const next = { ...previous };
      contentData.forEach((setting) => {
        next[setting.name] = setting.desc ?? "";
      });
      return next;
    });
  }, [contentData]);

  function updateField<K extends keyof WebFormState>(key: K, value: WebFormState[K]) {
    setWebForm((previous) => ({ ...previous, [key]: value }));
  }

  function updateBooleanField(key: OperationToggleKey, value: boolean) {
    setWebForm((previous) => ({ ...previous, [key]: value }));
  }

  function updateNestedField<T extends keyof WebFormState>(
    group: T,
    key: string,
    value: string | boolean
  ) {
    setWebForm((previous) => ({
      ...previous,
      [group]: {
        ...(previous[group] as Record<string, unknown>),
        [key]: value,
      },
    }));
  }

  function onImageChange(
    event: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<File | null>>,
    previewSetter: React.Dispatch<React.SetStateAction<string | null>>
  ) {
    const file = event.target.files?.[0];
    if (!file) return;
    setter(file);
    previewSetter(URL.createObjectURL(file));
  }

  async function handleSaveWebSettings() {
    const payload = new FormData();
    payload.append("site_name", webForm.site_name);
    payload.append("contact_email", webForm.contact_email);
    payload.append("contact_phone", webForm.contact_phone);
    payload.append("address", webForm.address);
    payload.append("social_media", JSON.stringify(webForm.social_media));
    payload.append("appearance", JSON.stringify(webForm.appearance));
    payload.append(
      "seo",
      JSON.stringify({
        meta_title: webForm.seo.meta_title,
        meta_description: webForm.seo.meta_description,
        meta_keywords: webForm.seo.meta_keywords
          .split(",")
          .map((keyword) => keyword.trim())
          .filter(Boolean),
      })
    );
    payload.append("currency", JSON.stringify(webForm.currency));
    payload.append("tax", JSON.stringify(webForm.tax));
    payload.append("shipping", JSON.stringify(webForm.shipping));
    payload.append(
      "location",
      JSON.stringify({
        type: "Point",
        coordinates: [Number(webForm.longitude) || 0, Number(webForm.latitude) || 0],
      })
    );
    payload.append("supports", JSON.stringify(webForm.supports));
    payload.append("delivery_and_returns", webForm.delivery_and_returns);
    payload.append("confirm_order_text", webForm.confirm_order_text);
    payload.append("delivery_fee_in_dhaka", webForm.delivery_fee_in_dhaka);
    payload.append("delivery_fee_outside_dhaka", webForm.delivery_fee_outside_dhaka);
    payload.append("maintenance_mode", String(webForm.maintenance_mode));
    payload.append("auto_approve_vendor", String(webForm.auto_approve_vendor));
    payload.append("auto_approve_product", String(webForm.auto_approve_product));
    payload.append("vendor_request", String(webForm.vendor_request));
    payload.append("make_admin", String(webForm.make_admin));
    payload.append("affiliate_percentage", webForm.affiliate_percentage);
    payload.append("affiliate_policy", webForm.affiliate_policy);

    if (logoFile) payload.append("logo", logoFile);
    if (faviconFile) payload.append("favicon", faviconFile);

    await updateWeb.mutateAsync(payload);
    setLogoFile(null);
    setFaviconFile(null);
    setLogoPreview(null);
    setFaviconPreview(null);
  }

  async function handleSaveContentSettings() {
    await updateContent.mutateAsync(
      SETTING_PAGE_NAMES.map((name) => ({
        name,
        desc: contentForm[name],
      }))
    );
  }

  if (webLoading || contentLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (webError || contentError) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white">
        <p className="text-sm font-medium text-red-500">Unable to load settings.</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            void refetchWeb();
            void refetchContent();
          }}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader title="Settings" description="Website, commerce, support, and page content" />

      <Tabs defaultValue="web" className="space-y-5">
        <TabsList className="h-auto flex-wrap justify-start">
          <TabsTrigger value="web">Web Settings</TabsTrigger>
          <TabsTrigger value="content">Content Pages</TabsTrigger>
        </TabsList>

        <TabsContent value="web" className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Brand & Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex flex-wrap gap-6">
                <div>
                  <Label className="mb-1 block">Logo</Label>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo preview" className="h-full w-full object-contain" />
                      ) : settings?.logo ? (
                        <img src={imageUrl(String(settings.logo))} alt="Logo" className="h-full w-full object-contain" />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-slate-300" />
                      )}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => logoInputRef.current?.click()}>
                      Change Logo
                    </Button>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => onImageChange(event, setLogoFile, setLogoPreview)}
                    />
                  </div>
                </div>

                <div>
                  <Label className="mb-1 block">Favicon</Label>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center">
                      {faviconPreview ? (
                        <img src={faviconPreview} alt="Favicon preview" className="h-full w-full object-contain" />
                      ) : settings?.favicon ? (
                        <img src={imageUrl(String(settings.favicon))} alt="Favicon" className="h-full w-full object-contain" />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-slate-300" />
                      )}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => faviconInputRef.current?.click()}>
                      Change Favicon
                    </Button>
                    <input
                      ref={faviconInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => onImageChange(event, setFaviconFile, setFaviconPreview)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label className="mb-1 block">Site Name</Label>
                  <Input value={webForm.site_name} onChange={(event) => updateField("site_name", event.target.value)} />
                </div>
                <div>
                  <Label className="mb-1 block">Contact Email</Label>
                  <Input
                    type="email"
                    value={webForm.contact_email}
                    onChange={(event) => updateField("contact_email", event.target.value)}
                  />
                </div>
                <div>
                  <Label className="mb-1 block">Contact Phone</Label>
                  <Input value={webForm.contact_phone} onChange={(event) => updateField("contact_phone", event.target.value)} />
                </div>
                <div>
                  <Label className="mb-1 block">Address</Label>
                  <Input value={webForm.address} onChange={(event) => updateField("address", event.target.value)} />
                </div>
                <div>
                  <Label className="mb-1 block">Longitude</Label>
                  <Input value={webForm.longitude} onChange={(event) => updateField("longitude", event.target.value)} />
                </div>
                <div>
                  <Label className="mb-1 block">Latitude</Label>
                  <Input value={webForm.latitude} onChange={(event) => updateField("latitude", event.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">SEO & Social</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="mb-1 block">Meta Title</Label>
                  <Input value={webForm.seo.meta_title} onChange={(event) => updateNestedField("seo", "meta_title", event.target.value)} />
                </div>
                <div>
                  <Label className="mb-1 block">Meta Description</Label>
                  <Textarea
                    value={webForm.seo.meta_description}
                    onChange={(event) => updateNestedField("seo", "meta_description", event.target.value)}
                    rows={3}
                  />
                </div>
                <div>
                  <Label className="mb-1 block">Meta Keywords</Label>
                  <Input value={webForm.seo.meta_keywords} onChange={(event) => updateNestedField("seo", "meta_keywords", event.target.value)} />
                </div>
                {(["facebook", "instagram", "twitter", "linkedin"] as const).map((platform) => (
                  <div key={platform}>
                    <Label className="mb-1 block capitalize">{platform}</Label>
                    <Input
                      value={webForm.social_media[platform]}
                      onChange={(event) => updateNestedField("social_media", platform, event.target.value)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Appearance & Commerce</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="mb-1 block">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        className="h-9 w-12 p-1"
                        value={webForm.appearance.primary_color}
                        onChange={(event) => updateNestedField("appearance", "primary_color", event.target.value)}
                      />
                      <Input
                        value={webForm.appearance.primary_color}
                        onChange={(event) => updateNestedField("appearance", "primary_color", event.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="mb-1 block">Secondary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        className="h-9 w-12 p-1"
                        value={webForm.appearance.secondary_color}
                        onChange={(event) => updateNestedField("appearance", "secondary_color", event.target.value)}
                      />
                      <Input
                        value={webForm.appearance.secondary_color}
                        onChange={(event) => updateNestedField("appearance", "secondary_color", event.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="mb-1 block">Theme</Label>
                  <Select value={webForm.appearance.theme} onValueChange={(value) => updateNestedField("appearance", "theme", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="mb-1 block">Currency Symbol</Label>
                    <Input value={webForm.currency.symbol} onChange={(event) => updateNestedField("currency", "symbol", event.target.value)} />
                  </div>
                  <div>
                    <Label className="mb-1 block">Currency Code</Label>
                    <Input value={webForm.currency.code} onChange={(event) => updateNestedField("currency", "code", event.target.value)} />
                  </div>
                  <div>
                    <Label className="mb-1 block">Free Shipping Threshold</Label>
                    <Input
                      type="number"
                      value={webForm.shipping.free_shipping_threshold}
                      onChange={(event) => updateNestedField("shipping", "free_shipping_threshold", event.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="mb-1 block">Standard Shipping Rate</Label>
                    <Input
                      type="number"
                      value={webForm.shipping.standard_rate}
                      onChange={(event) => updateNestedField("shipping", "standard_rate", event.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="mb-1 block">Dhaka Delivery Fee</Label>
                    <Input
                      type="number"
                      value={webForm.delivery_fee_in_dhaka}
                      onChange={(event) => updateField("delivery_fee_in_dhaka", event.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="mb-1 block">Outside Dhaka Fee</Label>
                    <Input
                      type="number"
                      value={webForm.delivery_fee_outside_dhaka}
                      onChange={(event) => updateField("delivery_fee_outside_dhaka", event.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                  <Label>Tax Enabled</Label>
                  <Switch checked={webForm.tax.is_enabled} onCheckedChange={(checked) => updateNestedField("tax", "is_enabled", checked)} />
                </div>
                <div>
                  <Label className="mb-1 block">Tax Rate</Label>
                  <Input type="number" value={webForm.tax.rate} onChange={(event) => updateNestedField("tax", "rate", event.target.value)} />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Operations</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {OPERATION_TOGGLES.map((toggle) => (
                <div key={toggle.key} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                  <Label>{toggle.label}</Label>
                  <Switch
                    checked={webForm[toggle.key]}
                    onCheckedChange={(checked) => updateBooleanField(toggle.key, checked)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Support & Checkout Text</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {([
                  ["shipping_heading", "Shipping Heading"],
                  ["support_heading", "Support Heading"],
                  ["payment_heading", "Payment Heading"],
                  ["refund_heading", "Refund Heading"],
                ] as const).map(([key, label]) => (
                  <div key={key}>
                    <Label className="mb-1 block">{label}</Label>
                    <Input value={webForm.supports[key]} onChange={(event) => updateNestedField("supports", key, event.target.value)} />
                  </div>
                ))}
              </div>
              {([
                ["shipping_description", "Shipping Description"],
                ["support_description", "Support Description"],
                ["payment_description", "Payment Description"],
                ["refund_description", "Refund Description"],
              ] as const).map(([key, label]) => (
                <div key={key}>
                  <Label className="mb-1 block">{label}</Label>
                  <Textarea value={webForm.supports[key]} onChange={(event) => updateNestedField("supports", key, event.target.value)} rows={3} />
                </div>
              ))}
              <div>
                <Label className="mb-1 block">Delivery & Returns</Label>
                <Textarea
                  value={webForm.delivery_and_returns}
                  onChange={(event) => updateField("delivery_and_returns", event.target.value)}
                  rows={4}
                />
              </div>
              <div>
                <Label className="mb-1 block">Confirm Order Text</Label>
                <Textarea
                  value={webForm.confirm_order_text}
                  onChange={(event) => updateField("confirm_order_text", event.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <Label className="mb-1 block">Affiliate Percentage (%)</Label>
                <Input
                  type="number"
                  value={webForm.affiliate_percentage}
                  onChange={(event) => updateField("affiliate_percentage", event.target.value)}
                />
              </div>
              <div>
                <Label className="mb-1 block">Affiliate Policy</Label>
                <div className="rounded-md border border-slate-200">
                  <RichTextEditor
                    id="affiliate-policy-editor"
                    value={webForm.affiliate_policy}
                    onChange={(val) => updateField("affiliate_policy", val)}
                    placeholder="Enter affiliate policy terms..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={() => void handleSaveWebSettings()} loading={updateWeb.isPending}>
              <Save className="h-4 w-4" />
              Save Web Settings
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Content Pages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {EDITOR_PAGE_NAMES.map((name) => (
                <div key={name}>
                  <Label className="mb-1 block capitalize">{name}</Label>
                  <RichTextEditor
                    id={`${name}-editor`}
                    value={contentForm[name]}
                    onChange={(html) => setContentForm((previous) => ({ ...previous, [name]: html }))}
                  />
                </div>
              ))}
              <div>
                <Label className="mb-1 block capitalize">contact</Label>
                <Textarea
                  value={contentForm.contact}
                  onChange={(event) => setContentForm((previous) => ({ ...previous, contact: event.target.value }))}
                  rows={7}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={() => void handleSaveContentSettings()} loading={updateContent.isPending}>
              <Save className="h-4 w-4" />
              Save Page Settings
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
