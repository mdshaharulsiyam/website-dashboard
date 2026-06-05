import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Upload, X, PlusCircle, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { RichTextEditor, isRichTextEmpty } from "@/components/shared/rich-text-editor";
import { Card, Button, Input, Select, Tag } from "antd";
import { toast } from "sonner";
import { useGetCategoriesQuery } from "@/store/categoryApi";
import {
  useGetProductQuery,
  useUpdateProductMutation,
} from "@/store/productApi";

const { Option } = Select;

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
// const BASE_URL = import.meta.env.VITE_API_URL ?? "http://13.229.171.117:5000";

function assetUrl(path: string) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${BASE_URL}/${path.replace(/\\/g, "/")}`;
}

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

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const originalImgsRef = useRef<string[]>([]);

  const { data: productData, isLoading: productLoading } = useGetProductQuery(id!);
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useGetCategoriesQuery();
  const [updateProduct, { isLoading: saving }] = useUpdateProductMutation();

  const categories = categoriesData?.data ?? [];
  const product = productData?.data;

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
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [existingImgs, setExistingImgs] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function parseStoredArray(arr: string[] | undefined): string[] {
    if (!arr || arr.length === 0) return [];
    if (arr.length === 1) {
      try {
        const parsed = JSON.parse(arr[0]);
        if (Array.isArray(parsed)) return parsed.map(String);
      } catch { }
    }
    return arr;
  }

  useEffect(() => {
    if (!product) return;
    setName(product.name ?? "");
    setDescription(product.description ?? "");
    setCategoryId(product.category_id ?? "");
    setSubCategoryId(product.sub_category_id ?? "");
    setPrice(String(product.price ?? ""));
    setDiscount(String(product.discount ?? "0"));
    setStock(String(product.stock ?? ""));
    if (product.flag && (FLAG_OPTIONS as readonly string[]).includes(product.flag)) {
      setFlag(product.flag as Flag);
    }
    setGender(product.gender?.toLowerCase() ?? "");
    setWeight(product.weight ?? "");

    const sz = product.size ?? [];
    setSizes(sz);
    setSizeInput(sz.join(" "));

    const parsedColors = parseStoredArray(product.color);
    setColors(parsedColors);

    const parsedTags = parseStoredArray(product.tag);
    setTags(parsedTags);
    setTagInput(parsedTags.join(" "));

    const coupon = product.coupon as { coupon_code?: string } | undefined;
    setCouponCode(coupon?.coupon_code ?? "");

    const imgs = Array.isArray(product.img)
      ? product.img
      : product.img
        ? [product.img]
        : [];
    setExistingImgs(imgs as string[]);
    originalImgsRef.current = imgs as string[];
  }, [product?._id]);

  const selectedCategory = categories.find((c) => c._id === categoryId);
  const filteredServices = selectedCategory?.services ?? [];
  const totalImages = existingImgs.length + newImages.length;

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required";
    if (isRichTextEmpty(description)) e.description = "Description is required";
    if (!categoryId) e.category = "Category is required";
    if (!subCategoryId) e.sub_category = "Sub-category is required";
    if (!price || Number(price) <= 0) e.price = "Valid price is required";
    if (Number(discount) < 0 || Number(discount) > 100)
      e.discount = "Discount must be 0–100";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const remaining = 8 - totalImages;
    if (files.length > remaining)
      toast.error(`Only ${remaining} more image${remaining !== 1 ? "s" : ""} allowed`);
    const toAdd = files.slice(0, remaining);
    setNewImages((prev) => [...prev, ...toAdd]);
    setNewPreviews((prev) => [...prev, ...toAdd.map((f) => URL.createObjectURL(f))]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeNewImage(i: number) {
    URL.revokeObjectURL(newPreviews[i]);
    setNewImages((prev) => prev.filter((_, idx) => idx !== i));
    setNewPreviews((prev) => prev.filter((_, idx) => idx !== i));
  }

  function handleSizeInput(e: React.ChangeEvent<HTMLInputElement>) {
    setSizeInput(e.target.value);
    setSizes(
      e.target.value
        .split(" ")
        .map((s) => s.trim())
        .filter(Boolean),
    );
  }

  function addColor() {
    if (colors.includes(pickedColor)) {
      toast.error("Color already added");
      return;
    }
    setColors((prev) => [...prev, pickedColor]);
  }

  function handleTagInput(e: React.ChangeEvent<HTMLInputElement>) {
    setTagInput(e.target.value);
    setTags(
      e.target.value
        .split(" ")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean),
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;

    const deletedImgs = originalImgsRef.current.filter(
      (src) => !existingImgs.includes(src),
    );

    const fd = new FormData();
    fd.append("name", name.trim());
    fd.append("description", description.trim());
    fd.append("category", categoryId);
    fd.append("sub_category", subCategoryId);
    fd.append("price", price);
    fd.append("discount", discount || "0");
    if (stock) fd.append("stock", stock);
    fd.append("flag", flag);
    if (gender) fd.append("gender", gender);
    if (weight.trim()) fd.append("weight", weight.trim());
    if (sizes.length > 0) fd.append("size", JSON.stringify(sizes));
    if (colors.length > 0) fd.append("color", JSON.stringify(colors));
    if (tags.length > 0) fd.append("tag", JSON.stringify(tags));
    if (couponCode.trim()) fd.append("coupon_code", couponCode.trim());
    fd.append("retained_images", JSON.stringify(existingImgs));
    fd.append("deleted_images", JSON.stringify(deletedImgs));
    newImages.forEach((img) => fd.append("img", img));

    try {
      await updateProduct({ id: id!, body: fd }).unwrap();
      toast.success("Product updated successfully");
      navigate("/products");
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ?? "Failed to update product";
      toast.error(msg);
    }
  }

  if (productLoading || categoriesLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 text-slate-500">
        <p>Product not found.</p>
        <Link to="/products">
          <Button size="small">Back to Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full space-y-5">
      <PageHeader
        title="Edit Product"
        description={product.name}
        actions={
          <Link to="/products">
            <Button size="small" icon={<ArrowLeft className="h-4 w-4" />}>
              Back
            </Button>
          </Link>
        }
      />

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
          {/* ── Left column ── */}
          <div className="xl:col-span-8 space-y-5">
            {/* Basic Info */}
            <Card
              title={<span className="text-sm font-semibold">Basic Information</span>}
              size="small"
            >
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Product Name *</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Product name"
                    status={errors.name ? "error" : ""}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">Description</label>
                  <RichTextEditor
                    id="edit-product-description-editor"
                    value={description}
                    onChange={setDescription}
                    placeholder="Describe your product…"
                    minHeightClassName="min-h-[220px]"
                  />
                  {errors.description && (
                    <p className="mt-1 text-xs text-red-500">{errors.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Category *</label>
                    <Select
                      value={categoryId || undefined}
                      onChange={(v) => {
                        setCategoryId(v);
                        setSubCategoryId("");
                      }}
                      disabled={categoriesLoading}
                      placeholder={categoriesLoading ? "Loading…" : "Select category"}
                      className="w-full"
                      status={errors.category ? "error" : undefined}
                      loading={categoriesLoading}
                      optionLabelProp="label"
                    >
                      {categoriesError ? (
                        <Option value="" disabled label="Error">
                          <span className="text-red-500">Failed to load categories</span>
                        </Option>
                      ) : (
                        categories.map((c) => (
                          <Option key={c._id} value={c._id} label={c.name}>
                            <span className="flex items-center gap-2">
                              {c.img && (
                                <img
                                  src={`${BASE_URL}/${c.img}`}
                                  alt=""
                                  className="h-5 w-5 rounded object-cover shrink-0"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).style.display = "none";
                                  }}
                                />
                              )}
                              {c.name}
                            </span>
                          </Option>
                        ))
                      )}
                    </Select>
                    {errors.category && (
                      <p className="mt-1 text-xs text-red-500">{errors.category}</p>
                    )}
                  </div>

                  {/* Sub-category */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Sub-category *</label>
                    <Select
                      value={subCategoryId || undefined}
                      onChange={setSubCategoryId}
                      disabled={!categoryId || categoriesLoading}
                      placeholder={
                        !categoryId
                          ? "Select category first"
                          : filteredServices.length === 0
                            ? "No sub-categories"
                            : "Select sub-category"
                      }
                      className="w-full"
                      status={errors.sub_category ? "error" : undefined}
                    >
                      {filteredServices.map((s) => (
                        <Option key={s._id} value={s._id}>
                          {s.name}
                        </Option>
                      ))}
                    </Select>
                    {errors.sub_category && (
                      <p className="mt-1 text-xs text-red-500">{errors.sub_category}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Gender</label>
                    <Select
                      value={gender || undefined}
                      onChange={setGender}
                      placeholder="Select gender"
                      className="w-full"
                    >
                      <Option value="male">Male</Option>
                      <Option value="female">Female</Option>
                      <Option value="others">Others</Option>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Weight</label>
                    <Input
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="e.g. 1 kg, 500g"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Flag</label>
                    <Select
                      value={flag}
                      onChange={(v) => setFlag(v as Flag)}
                      className="w-full"
                    >
                      {FLAG_OPTIONS.map((f) => (
                        <Option key={f} value={f}>
                          <span className="capitalize">{f}</span>
                        </Option>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>
            </Card>

            {/* Images */}
            <Card
              title={
                <span className="text-sm font-semibold">
                  Product Images{" "}
                  <span className="font-normal text-slate-400">(max 8)</span>
                </span>
              }
              size="small"
            >
              <div className="space-y-3">
                {existingImgs.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-400 mb-2">Existing images</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {existingImgs.map((src, i) => (
                        <div
                          key={i}
                          className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-square"
                        >
                          <img src={assetUrl(src)} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() =>
                              setExistingImgs((prev) => prev.filter((_, idx) => idx !== i))
                            }
                            className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {newPreviews.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-400 mb-2">New images to upload</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {newPreviews.map((src, i) => (
                        <div
                          key={i}
                          className="relative group rounded-xl overflow-hidden border border-amber-200 aspect-square"
                        >
                          <img src={src} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeNewImage(i)}
                            className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {totalImages < 8 && (
                  <div
                    className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-amber-400 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-600">Click to upload images</p>
                    <p className="text-xs text-slate-400 mt-1">
                      PNG, JPG up to 10 MB — {8 - totalImages} slot
                      {8 - totalImages !== 1 ? "s" : ""} remaining
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
            </Card>

            {/* Pricing & Stock */}
            <Card
              title={<span className="text-sm font-semibold">Pricing & Stock</span>}
              size="small"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Price (৳) *</label>
                  <Input
                    type="number"
                    min={1}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0"
                    status={errors.price ? "error" : ""}
                  />
                  {errors.price && (
                    <p className="mt-1 text-xs text-red-500">{errors.price}</p>
                  )}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Discount (%)</label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    placeholder="0"
                    status={errors.discount ? "error" : ""}
                  />
                  {errors.discount && (
                    <p className="mt-1 text-xs text-red-500">{errors.discount}</p>
                  )}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Stock</label>
                  <Input
                    type="number"
                    min={0}
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* ── Right column ── */}
          <div className="xl:col-span-4 space-y-5">
            {/* Sizes */}
            <Card title={<span className="text-sm font-semibold">Sizes</span>} size="small">
              <div className="space-y-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Enter sizes{" "}
                    <span className="text-slate-400 font-normal text-xs">(space-separated)</span>
                  </label>
                  <Input
                    value={sizeInput}
                    onChange={handleSizeInput}
                    placeholder="XS S M L XL XXL"
                  />
                </div>
                {sizes.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {sizes.map((s) => (
                      <Tag
                        key={s}
                        className="bg-amber-100 text-amber-800 border-amber-200 text-xs font-medium"
                      >
                        {s}
                      </Tag>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Colors */}
            <Card title={<span className="text-sm font-semibold">Colors</span>} size="small">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={pickedColor}
                    onChange={(e) => setPickedColor(e.target.value)}
                    className="h-9 w-12 rounded border border-slate-200 cursor-pointer p-0.5 shrink-0"
                  />
                  <span className="text-sm font-mono text-slate-600 flex-1">{pickedColor}</span>
                  <Button size="small" onClick={addColor} icon={<PlusCircle className="h-4 w-4" />}>
                    Add
                  </Button>
                </div>
                {colors.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {colors.map((c) => {
                      const isHex = /^#[0-9a-fA-F]{3,6}$/.test(c.trim());
                      return (
                        <div
                          key={c}
                          className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1"
                        >
                          {isHex && (
                            <span
                              className="h-4 w-4 rounded-full border border-slate-300 shrink-0"
                              style={{ backgroundColor: c }}
                            />
                          )}
                          <span className="text-xs font-mono text-slate-600">{c}</span>
                          <button
                            type="button"
                            onClick={() => setColors((prev) => prev.filter((x) => x !== c))}
                            className="text-slate-400 hover:text-red-500 ml-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>

            {/* Tags */}
            <Card title={<span className="text-sm font-semibold">Tags</span>} size="small">
              <div className="space-y-3">
                <Input
                  value={tagInput}
                  onChange={handleTagInput}
                  placeholder="e.g. cotton summer beach…"
                />
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((t) => (
                      <Tag
                        key={t}
                        className="bg-slate-100 text-slate-700 border-slate-200 text-xs font-medium"
                      >
                        {t}
                      </Tag>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Coupon */}
            <Card
              title={
                <span className="text-sm font-semibold">
                  Coupon Code{" "}
                  <span className="font-normal text-slate-400">(optional)</span>
                </span>
              }
              size="small"
            >
              <div className="space-y-2">
                <Input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="e.g. SAVE20"
                  className="uppercase"
                />
                <p className="text-xs text-slate-400">Leave empty if no coupon applies</p>
              </div>
            </Card>
          </div>

          {/* ── Actions ── */}
          <div className="xl:col-span-12 flex items-center gap-3 justify-end pb-4">
            <Button onClick={() => navigate("/products")}>Cancel</Button>
            <Button htmlType="submit" loading={saving} type="primary">
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
