import { useParams, Navigate, Link } from "react-router-dom";
import { ArrowLeft, Package } from "lucide-react";
import { mockProducts } from "@/data/mock";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const product = mockProducts.find((p) => p.id === id);
  if (!product) return <Navigate to="/not-found" replace />;

  const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0);

  return (
    <div className="max-w-4xl space-y-5">
      <PageHeader
        title={product.name}
        description={`${product.category} · Created ${formatDate(product.createdAt)}`}
        actions={
          <Link to="/products">
            <Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4" />Back</Button>
          </Link>
        }
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Product Info</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="h-40 w-full rounded-xl bg-slate-100 flex items-center justify-center">
                <Package className="h-16 w-16 text-slate-300" />
              </div>
              <p className="text-slate-600">{product.description}</p>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((t) => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Variants</CardTitle></CardHeader>
            <CardContent className="pt-0">
              <div className="overflow-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left py-2 px-2 text-slate-500 font-medium">Size</th>
                      <th className="text-left py-2 px-2 text-slate-500 font-medium">Color</th>
                      <th className="text-left py-2 px-2 text-slate-500 font-medium">Stock</th>
                      <th className="text-left py-2 px-2 text-slate-500 font-medium">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.variants.map((v, i) => (
                      <tr key={i} className="border-b border-slate-50">
                        <td className="py-1.5 px-2 font-mono">{v.size}</td>
                        <td className="py-1.5 px-2">{v.color}</td>
                        <td className="py-1.5 px-2">
                          <Badge variant={v.stock === 0 ? "destructive" : v.stock < 5 ? "warning" : "success"} className="text-xs">{v.stock}</Badge>
                        </td>
                        <td className="py-1.5 px-2 font-medium">{formatCurrency(v.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Details</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Status</span>
                <Badge variant={product.status === "active" ? "success" : "warning"} className="capitalize">{product.status}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Base Price</span>
                <span className="font-semibold">{formatCurrency(product.basePrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cost Price</span>
                <span className="font-medium text-slate-700">{formatCurrency(product.costPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Stock</span>
                <span className={totalStock < 10 ? "text-red-600 font-semibold" : "font-medium"}>{totalStock} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Margin</span>
                <span className="text-emerald-600 font-medium">
                  {product.basePrice > 0 ? `${Math.round(((product.basePrice - product.costPrice) / product.basePrice) * 100)}%` : "—"}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 flex flex-col gap-2">
              <Button className="w-full">Edit Product</Button>
              <Button variant="outline" className="w-full">Duplicate</Button>
              <Button variant="destructive" className="w-full">Archive</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
