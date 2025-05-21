import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { getUserRole } from "@/utils/getUserRole";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// Schema xác thực với Zod
const loginSchema = z.object({
    email: z.string().email({ message: "Email không hợp lệ." }),
    password: z.string().min(6, { message: "Mật khẩu phải ít nhất 6 ký tự." }),
});

function Login() {
    const navigate = useNavigate();

    const form = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    async function onSubmit(values) {
        try {
            const res = await axios.post(`${import.meta.env.VITE_APP_API_GATEWAY_URL}/auth/login`, values);

            const { accessToken, refreshToken, payload } = res.data;
            if (payload.role !== "admin") {
                alert("Chỉ tài khoản admin mới được đăng nhập!");
                return;
            }
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);


            alert("Đăng nhập thành công!");
            navigate("/");
        } catch (err) {
            alert(err.response?.data?.message || "Đăng nhập thất bại!");
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950">
            <div className="w-full max-w-md p-6 border rounded-xl shadow-xl bg-white dark:bg-gray-900">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">Đăng nhập</h2>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        {/* Email */}
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="you@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Mật khẩu */}
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mật khẩu</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="••••••••" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full">
                            Đăng nhập
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}

export default Login;
