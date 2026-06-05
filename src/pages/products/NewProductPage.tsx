import { PageHeader } from "@/components/shared/page-header";
import { RichTextEditor, isRichTextEmpty } from "@/components/shared/rich-text-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGetCategoriesQuery } from "@/store/categoryApi";
import { useCreateProductMutation } from "@/store/productApi";
import { ArrowLeft, Loader2, PlusCircle, Upload, X } from "lucide-react";
import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const FLAG_OPTIONS = [
  "new",
  "popular",
  "trending",
  "limited edition",
  "featured",
  "best choice",
  "offer",
  "limited stock",
] as const;

type Flag = (typeof FLAG_OPTIONS)[number];

export default function NewProductPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useGetCategoriesQuery();
  const [createProduct, { isLoading }] = useCreateProductMutation();

  const categories = categoriesData?.data ?? [];

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("0");
  const [stock, setStock] = useState("");
  const [flag, setFlag] = useState<Flag>("new");
  const [gender, setGender] = useState("");
  const [weight, setWeight] = useState("");
  const [sizeInput, setSizeInput] = useState("");
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [pickedColor, setPickedColor] = useState("#000000");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedCategory = categories.find((c) => c._id === categoryId);
  const filteredServices = selectedCategory?.services ?? [];

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required";
    if (isRichTextEmpty(description)) e.description = "Description is required";
    if (!categoryId) e.category = "Category is required";
    if (!subCategoryId) e.sub_category = "Sub-category is required";
    if (!price || Number(price) <= 0) e.price = "Valid price is required";
    if (!stock || Number(stock) < 0) e.stock = "Valid stock is required";
    if (images.length === 0) e.img = "At least one image is required";
    if (Number(discount) < 0 || Number(discount) > 100) e.discount = "Discount must be 0–100";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const remaining = 8 - images.length;
    if (files.length > remaining) {
      toast.error(`You can upload at most 8 images (${remaining} remaining)`);
    }
    const toAdd = files.slice(0, remaining);
    setImages((prev) => [...prev, ...toAdd]);
    const newPreviews = toAdd.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...newPreviews]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeImage(i: number) {
    URL.revokeObjectURL(previews[i]);
    setImages((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => prev.filter((_, idx) => idx !== i));
  }

  function handleSizeInput(e: React.ChangeEvent<HTMLInputElement>) {
    setSizeInput(e.target.value);
    const parsed = e.target.value
      .split(" ")
      .map((s) => s.trim())
      .filter(Boolean);
    setSizes(parsed);
  }

  function addColor() {
    if (colors.includes(pickedColor)) { toast.error("Color already added"); return; }
    setColors((prev) => [...prev, pickedColor]);
  }

  function handleTagInput(e: React.ChangeEvent<HTMLInputElement>) {
    setTagInput(e.target.value);
    setTags(e.target.value.split(" ").map((s) => s.trim().toLowerCase()).filter(Boolean));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const fd = new FormData();
    fd.append("name", name.trim());
    fd.append("description", description.trim());
    fd.append("category", categoryId);
    fd.append("sub_category", subCategoryId);
    fd.append("price", price);
    fd.append("discount", discount || "0");
    fd.append("stock", stock);
    fd.append("flag", flag);
    if (gender.trim()) fd.append("gender", gender.trim());
    if (weight.trim()) fd.append("weight", weight.trim());
    if (sizes.length > 0) fd.append("size", JSON.stringify(sizes));
    if (colors.length > 0) fd.append("color", JSON.stringify(colors));
    if (tags.length > 0) fd.append("tag", JSON.stringify(tags));
    if (couponCode.trim()) fd.append("coupon_code", couponCode.trim());
    images.forEach((img) => fd.append("img", img));

    try {
      await createProduct(fd).unwrap();
      toast.success("Product created successfully");
      navigate("/products");
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? "Failed to create product";
      toast.error(msg);
    }
  }

  return (
    <div className="w-full space-y-5">
      <PageHeader
        title="New Product"
        actions={
          <Link to="/products">
            <Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4" />Back</Button>
          </Link>
        }
      />

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">

          {/* ── Left column: main fields ── */}
          <div className="xl:col-span-8 space-y-5">

            {/* Basic Info */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Basic Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="mb-1.5 block">Product Name *</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Retro Bee Graphic Tee" />
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                </div>
                <div>
                  <Label className="mb-1.5 block">Description *</Label>
                  <RichTextEditor
                    id="new-product-description-editor"
                    value={description}
                    onChange={setDescription}
                    placeholder="Describe your product..."
                    minHeightClassName="min-h-[220px]"
                  />
                  {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category */}
                  <div>
                    <Label className="mb-1.5 block">Category *</Label>
                    <Select
                      value={categoryId}
                      onValueChange={(v) => { setCategoryId(v); setSubCategoryId(""); }}
                      disabled={categoriesLoading}
                    >
                      <SelectTrigger className={errors.category ? "border-red-400" : ""}>
                        {categoriesLoading ? (
                          <span className="flex items-center gap-2 text-slate-400">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Loading categories…
                          </span>
                        ) : (
                          <SelectValue placeholder="Select category" />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        {categoriesError ? (
                          <div className="px-3 py-2 text-xs text-red-500">Failed to load categories</div>
                        ) : categories.length === 0 ? (
                          <div className="px-3 py-2 text-xs text-slate-400">No categories found</div>
                        ) : (
                          categories.map((c) => (
                            <SelectItem key={c._id} value={c._id}>
                              <span className="flex items-center gap-2">
                                {c.img && (
                                  <img
                                    src={`http://localhost:5000/${c.img}`}
                                    // src={`http://13.229.171.117:5000/${c.img}`}
                                    alt=""
                                    className="h-5 w-5 rounded object-cover shrink-0"
                                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                                  />
                                )}
                                {c.name}
                                {c.total_service !== undefined && (
                                  <span className="ml-auto text-xs text-slate-400">{c.total_service} sub</span>
                                )}
                              </span>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}
                  </div>

                  {/* Sub-category */}
                  <div>
                    <Label className="mb-1.5 block">Sub-category *</Label>
                    <Select
                      value={subCategoryId}
                      onValueChange={setSubCategoryId}
                      disabled={!categoryId || categoriesLoading}
                    >
                      <SelectTrigger className={errors.sub_category ? "border-red-400" : ""}>
                        <SelectValue
                          placeholder={
                            categoriesLoading
                              ? "Loading…"
                              : !categoryId
                                ? "Select category first"
                                : filteredServices.length === 0
                                  ? "No sub-categories"
                                  : "Select sub-category"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredServices.length === 0 ? (
                          <div className="px-3 py-2 text-xs text-slate-400">
                            {categoryId ? "No sub-categories for this category" : "Select a category first"}
                          </div>
                        ) : (
                          filteredServices.map((s) => (
                            <SelectItem key={s._id} value={s._id}>
                              {s.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {errors.sub_category && <p className="mt-1 text-xs text-red-500">{errors.sub_category}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-1.5 block">Gender</Label>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="others">Others</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-1.5 block">Weight</Label>
                    <Input value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 1 kg, 500g" />
                  </div>
                  <div>
                    <Label className="mb-1.5 block">Flag</Label>
                    <Select value={flag} onValueChange={(v) => setFlag(v as Flag)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {FLAG_OPTIONS.map((f) => (
                          <SelectItem key={f} value={f} className="capitalize">{f}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Product Images * <span className="font-normal text-slate-400">(max 8)</span></CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {previews.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {previews.map((src, i) => (
                      <div key={i} className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-square">
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {images.length < 8 && (
                  <div
                    className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-amber-400 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-600">Click to upload images</p>
                    <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 10 MB each — {8 - images.length} slot{8 - images.length !== 1 ? "s" : ""} remaining</p>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
                {errors.img && <p className="text-xs text-red-500">{errors.img}</p>}
              </CardContent>
            </Card>

            {/* Pricing & Stock */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Pricing & Stock</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label className="mb-1.5 block">Price (৳) *</Label>
                  <Input type="number" min={1} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" />
                  {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price}</p>}
                </div>
                <div>
                  <Label className="mb-1.5 block">Discount (%)</Label>
                  <Input type="number" min={0} max={100} value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="0" />
                  {errors.discount && <p className="mt-1 text-xs text-red-500">{errors.discount}</p>}
                </div>
                <div>
                  <Label className="mb-1.5 block">Stock *</Label>
                  <Input type="number" min={0} value={stock} onChange={(e) => setStock(e.target.value)} placeholder="0" />
                  {errors.stock && <p className="mt-1 text-xs text-red-500">{errors.stock}</p>}
                </div>
              </CardContent>
            </Card>

          </div>

          {/* ── Right column: attributes ── */}
          <div className="xl:col-span-4 space-y-5">

            {/* Sizes */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Sizes</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="mb-1.5 block">
                    Enter sizes <span className="text-slate-400 font-normal text-xs">(space-separated)</span>
                  </Label>
                  <Input value={sizeInput} onChange={handleSizeInput} placeholder="XS S M L XL XXL" />
                </div>
                {sizes.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {sizes.map((s) => (
                      <Badge key={s} className="bg-amber-100 text-amber-800 border border-amber-200 text-xs font-medium">
                        {s}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Colors */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Colors</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={pickedColor}
                    onChange={(e) => setPickedColor(e.target.value)}
                    className="h-9 w-12 rounded border border-slate-200 cursor-pointer p-0.5 shrink-0"
                  />
                  <span className="text-sm font-mono text-slate-600 flex-1">{pickedColor}</span>
                  <Button type="button" size="sm" variant="outline" onClick={addColor}>
                    <PlusCircle className="h-4 w-4" />Add
                  </Button>
                </div>
                {colors.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {colors.map((c) => (
                      <div key={c} className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                        <span className="h-4 w-4 rounded-full border border-slate-300 shrink-0" style={{ backgroundColor: c }} />
                        <span className="text-xs font-mono text-slate-600">{c}</span>
                        <button type="button" onClick={() => setColors((prev) => prev.filter((x) => x !== c))} className="text-slate-400 hover:text-red-500 ml-0.5">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Tags</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Input
                  value={tagInput}
                  onChange={handleTagInput}
                  placeholder="e.g. cotton summer beach…"
                />
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((t) => (
                      <Badge key={t} className="bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium">
                        {t}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Coupon */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Coupon Code <span className="font-normal text-slate-400">(optional)</span></CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="e.g. SAVE20"
                  className="uppercase"
                />
                <p className="text-xs text-slate-400">Leave empty if no coupon applies</p>
              </CardContent>
            </Card>

          </div>

          {/* ── Actions ── */}
          <div className="xl:col-span-12 flex items-center gap-3 justify-end pb-4">
            <Button type="button" variant="outline" onClick={() => navigate("/products")}>Cancel</Button>
            <Button type="submit" loading={isLoading}>Create Product</Button>
          </div>

        </div>
      </form>
    </div>
  );
}
