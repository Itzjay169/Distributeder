"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Package,
  Plus,
  FileSpreadsheet,
  Download,
  Upload,
  Edit,
  Trash2,
  X,
  Check,
  AlertTriangle,
  Image as ImageIcon,
} from "lucide-react";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { useToast } from "@/components/providers/ToastProvider";

interface SellerProductsManagerProps {
  initialProducts: any[];
  categories: any[];
  storeSlug: string;
}

export default function SellerProductsManager({
  initialProducts,
  categories,
  storeSlug,
}: SellerProductsManagerProps) {
  const { formatPrice } = useCurrency();
  const { success, error, warning } = useToast();

  const [products, setProducts] = useState<any[]>(initialProducts);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Form State
  const [form, setForm] = useState({
    title: "",
    categoryId: categories[0]?.id || "",
    sku: "",
    price: "",
    compareAtPrice: "",
    stock: 100,
    moq: 1,
    description: "",
    imageUrl: "",
    wholesaleTiersJson: '[{"minQty": 10, "discountPercent": 10}, {"minQty": 50, "discountPercent": 20}]',
    variantsJson: '[{"name": "Spec", "options": ["Standard", "Heavy Duty"]}]',
  });

  const resetForm = () => {
    setForm({
      title: "",
      categoryId: categories[0]?.id || "",
      sku: "",
      price: "",
      compareAtPrice: "",
      stock: 100,
      moq: 1,
      description: "",
      imageUrl: "",
      wholesaleTiersJson: '[{"minQty": 10, "discountPercent": 10}, {"minQty": 50, "discountPercent": 20}]',
      variantsJson: '[{"name": "Spec", "options": ["Standard", "Heavy Duty"]}]',
    });
    setEditingProduct(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setProductModalOpen(true);
  };

  const handleOpenEdit = (p: any) => {
    setEditingProduct(p);
    let img = "";
    try {
      const arr = JSON.parse(p.images);
      img = arr[0] || "";
    } catch (e) {
      img = p.images;
    }

    setForm({
      title: p.title,
      categoryId: p.categoryId,
      sku: p.sku || "",
      price: String(p.price),
      compareAtPrice: p.compareAtPrice ? String(p.compareAtPrice) : "",
      stock: p.stock,
      moq: p.moq || 1,
      description: p.description || "",
      imageUrl: img,
      wholesaleTiersJson: p.wholesaleTiers || "",
      variantsJson: p.variants || "",
    });
    setProductModalOpen(true);
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setIsUploadingImage(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setForm((prev) => ({ ...prev, imageUrl: data.url }));
        success("Image uploaded to /public/uploads successfully!");
      } else {
        error(data.error || "Image upload failed");
      }
    } catch (err) {
      error("Failed to upload image");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        title: form.title,
        categoryId: form.categoryId,
        sku: form.sku,
        price: form.price,
        compareAtPrice: form.compareAtPrice,
        stock: form.stock,
        moq: form.moq,
        description: form.description,
        images: JSON.stringify([form.imageUrl || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"]),
        wholesaleTiers: form.wholesaleTiersJson || null,
        variants: form.variantsJson || null,
      };

      if (editingProduct) {
        // PUT update
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (res.ok) {
          success("Product inventory updated!");
          setProducts((prev) =>
            prev.map((p) => (p.id === editingProduct.id ? { ...p, ...data.product } : p))
          );
          setProductModalOpen(false);
        } else {
          error(data.error || "Failed to update product");
        }
      } else {
        // POST create
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (res.ok) {
          success("New product published to marketplace catalog!");
          setProducts([data.product, ...products]);
          setProductModalOpen(false);
        } else {
          error(data.error || "Failed to create product");
        }
      }
    } catch (err) {
      error("Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to remove this SKU from your warehouse catalog?")) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        success("SKU deleted.");
      } else {
        error("Failed to delete product");
      }
    } catch (err) {
      error("Network error");
    }
  };

  const handleImportCsv = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvText.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/seller/products/csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvData: csvText }),
      });

      const data = await res.json();
      if (res.ok) {
        success(data.message || "CSV inventory imported successfully!");
        setCsvModalOpen(false);
        setCsvText("");
        window.location.reload();
      } else {
        error(data.error || "Failed to import CSV");
      }
    } catch (err) {
      error("Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Inventory & SKU Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Maintain wholesale catalog listings, bulk tier pricing matrices, and warehouse stock.
          </p>
        </div>

        {/* Action Buttons: Add, Export CSV, Import CSV */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/api/seller/products/csv"
            download
            className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </a>

          <button
            onClick={() => setCsvModalOpen(true)}
            className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Add New SKU</span>
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Item & SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Base Price</th>
                <th className="py-3 px-4 text-center">MOQ</th>
                <th className="py-3 px-4 text-center">Warehouse Stock</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => {
                let img = "";
                try {
                  const arr = JSON.parse(p.images);
                  img = arr[0] || "";
                } catch (e) {
                  img = p.images;
                }

                const isLowStock = p.stock <= p.lowStockThreshold;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={img}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover border shrink-0"
                        />
                        <div>
                          <Link
                            href={`/products/${p.slug}`}
                            className="font-bold text-slate-900 hover:text-blue-600 transition line-clamp-1"
                          >
                            {p.title}
                          </Link>
                          <div className="text-[11px] text-slate-400 font-mono">
                            SKU: {p.sku || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-600">{p.category?.name || "General"}</td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {formatPrice(p.price)}
                    </td>

                    <td className="py-3 px-4 text-center font-bold">{p.moq || 1} units</td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isLowStock
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {p.stock} in stock
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.isActive
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {p.isActive ? "Active" : "Archived"}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit Product"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Product Modal */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingProduct ? "Edit Product SKU" : "Add New Wholesale SKU"}
              </h3>
              <button onClick={() => setProductModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Industrial Steel High-Pressure Ball Valve"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    SKU Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. APX-VLV-200"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Base Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="5349.00"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Compare Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="7049.00"
                    value={form.compareAtPrice}
                    onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    MOQ *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={form.moq}
                    onChange={(e) => setForm({ ...form, moq: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Stock Qty *
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Image Upload Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Product Image (Saved to /public/uploads or Web URL)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://... or upload below"
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <label className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 border border-slate-300">
                    <ImageIcon className="w-4 h-4" />
                    <span>{isUploadingImage ? "Uploading..." : "Upload File"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Wholesale Tiers JSON */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Wholesale Bulk Pricing Tiers (JSON Format)
                </label>
                <input
                  type="text"
                  value={form.wholesaleTiersJson}
                  onChange={(e) => setForm({ ...form, wholesaleTiersJson: e.target.value })}
                  placeholder='[{"minQty": 10, "discountPercent": 10}, {"minQty": 50, "discountPercent": 20}]'
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <span className="text-[10px] text-slate-400">
                  Example: 10+ units = 10% discount, 50+ units = 20% discount
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Technical Description & Warranty Terms
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow transition disabled:opacity-50"
                >
                  {isSubmitting ? "Saving SKU..." : "Save Product Listing"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import CSV Modal */}
      {csvModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-amber-600" />
                <span>Bulk CSV Inventory Import</span>
              </h3>
              <button onClick={() => setCsvModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleImportCsv} className="space-y-4 pt-4">
              <p className="text-xs text-slate-600">
                Paste your CSV content with headers: <code>title,sku,price,stock,moq,category,description,images</code>
              </p>

              <textarea
                required
                rows={8}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder={`title,sku,price,stock,moq,category,description,images\n"Precision Titanium Drill Bit Set","APX-DRL-09",45.0,200,5,"Industrial Supplies","Titanium coated bit set","https://images.unsplash.com/photo-1504148455328-c376907d081c"`}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCsvModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow transition disabled:opacity-50"
                >
                  {isSubmitting ? "Importing Inventory..." : "Run CSV Import"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
