import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Input } from "@/components/ui/input";
import { useGlobalContext } from "@/context/GlobalProvider";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

// API endpoints
const API_BASE = "http://localhost:4004";
const CLOUDINARY_UPLOAD_API = "http://localhost:4004/productsImage";

// Schema dùng Zod
const ProductSchema = z.object({
  name: z.string().min(1, { message: "Tên không được để trống." }),
  description: z.string().min(1, { message: "Mô tả không được để trống." }),
  brand: z.string().min(1, { message: "Thương hiệu không được để trống." }),
  category: z.string().min(1, { message: "Danh mục không được để trống." }),
  price: z.coerce
    .number({ invalid_type_error: "Giá phải là số." })
    .positive({ message: "Giá phải lớn hơn 0." }),
  discount: z.coerce.number().nonnegative({ message: "Discount không được âm." }),
  color: z.string().min(1, { message: "Màu sắc không được để trống." }),
  new: z.boolean(),
  stock: z.coerce.number().nonnegative({ message: "Số lượng tồn không được âm." }),
  rating: z.coerce
    .number()
    .min(0, { message: "Rating không được nhỏ hơn 0." })
    .max(5, { message: "Rating tối đa là 5." }),
  reviews: z.coerce.number().nonnegative({ message: "Reviews không được âm." }),
  image: z.string().optional(),
});

export default function ProductForm() {
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imageBase64, setImageBase64] = useState(null);

  // Lấy dữ liệu update từ global context
  const { productToUpdate, setProductToUpdate, setOpenForm } = useGlobalContext();

  const form = useForm({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      name: "",
      description: "",
      brand: "",
      category: "",
      price: 0,
      discount: 0,
      color: "",
      new: true,
      stock: 0,
      rating: 0,
      reviews: 0,
      image: "",
    },
  });

  // Khi có dữ liệu cần update, prefill form
  useEffect(() => {
    if (productToUpdate) {
      form.reset(productToUpdate);
      setPreview(productToUpdate.image);
    }
  }, [productToUpdate, form]);

  const onSubmit = async (data) => {
    setUploading(true);
    let imageUrl = data.image;
    if (imageBase64) {
      try {
        const response = await axios.post(CLOUDINARY_UPLOAD_API, { image: imageBase64 });
        imageUrl = response.data.url;
      } catch (error) {
        alert("Lỗi khi upload ảnh!");
        setUploading(false);
        return;
      }
    }
    const updatedProduct = { ...data, image: imageUrl };

    try {
      if (productToUpdate && productToUpdate._id) {
        // Cập nhật sản phẩm
        await axios.put(`${API_BASE}/product/${productToUpdate._id}`, updatedProduct);
        alert("Cập nhật sản phẩm thành công!");
      } else {
        // Tạo mới sản phẩm
        await axios.post(`${API_BASE}/create-product`, updatedProduct);
        alert("Thêm sản phẩm thành công!");
      }
      toast.success("Form submitted successfully.");
      form.reset();
      setPreview(null);
      setImageBase64(null);
      setProductToUpdate(null);
      setOpenForm(false);
    } catch (error) {
      if (productToUpdate && productToUpdate._id) {
        alert("Lỗi khi cập nhật sản phẩm!");
      } else {
        alert("Lỗi khi thêm sản phẩm!");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        form.setValue("image", reader.result);
        setImageBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        className="group mr-16 mt-8"
        onClick={() => {
          setOpenForm(false);
          setProductToUpdate(null);
        }}
      >
        <ArrowLeft className="group-hover:-translate-x-1 transition duration-500" />
        Back
      </Button>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
          {/* Dàn form theo grid 2 cột */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên sản phẩm</FormLabel>
                  <FormControl>
                    <Input placeholder="Tên sản phẩm" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Input placeholder="Mô tả" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thương hiệu</FormLabel>
                  <FormControl>
                    <Input placeholder="Thương hiệu" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Sử dụng select cho trường category */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Danh mục</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Custome Build">Custome Build</SelectItem>
                        <SelectItem value="MSI Laptop">MSI Laptop</SelectItem>
                        <SelectItem value="Desktops">Desktops</SelectItem>
                        <SelectItem value="Gaming Monitors">Gaming Monitors</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giá</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Giá" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="discount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discount</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Discount" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Màu sắc</FormLabel>
                  <FormControl>
                    <Input placeholder="Màu sắc" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số lượng tồn</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Stock" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Trường upload ảnh chiếm toàn bộ 2 cột */}
          <div className="col-span-2">
            <FormItem>
              <FormLabel>Hình ảnh</FormLabel>
              <FormControl>
                <Input type="file" accept="image/*" onChange={handleFileChange} />
              </FormControl>
              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="mt-2"
                  style={{ maxWidth: "200px" }}
                />
              )}
            </FormItem>
          </div>

          <Button type="submit" disabled={uploading}>
            {uploading ? "Đang tải..." : productToUpdate ? "Cập nhật" : "Submit"}
          </Button>
        </form>
      </Form>
    </>
  );
}
