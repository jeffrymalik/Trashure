"use client";

import React, { useState } from "react";
import { User, Lock, Eye, EyeOff, LogIn, Leaf } from "lucide-react";
import { useRouter } from "next/navigation";
import AlertModal from "./AlertModal";

export default function LoginForm() {
  const router = useRouter();

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; message: string }>({
    isOpen: false,
    message: "",
  });
  const [successModal, setSuccessModal] = useState<{ isOpen: boolean; message: string }>({
    isOpen: false,
    message: "",
  });
  const [infoModal, setInfoModal] = useState<{ isOpen: boolean; title: string; message: string }>({
    isOpen: false,
    title: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorModal({ isOpen: false, message: "" });
    setSuccessModal({ isOpen: false, message: "" });

    if (!login.trim() || !password) {
      setErrorModal({
        isOpen: true,
        message: "Silakan isi email/username dan password.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
      const response = await fetch(`${apiUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          login: login.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          (data.errors
            ? Object.values(data.errors).flat().join(" ")
            : "Login gagal. Silakan periksa kembali akun Anda.")
        );
      }

      // Save token and user details to localStorage & Cookies
      if (data.token) {
        localStorage.setItem("trashure_token", data.token);
        localStorage.setItem("trashure_user", JSON.stringify(data.user));
        const role = data.user?.role || "warga";
        const maxAge = data.expires_in || 86400;
        document.cookie = `trashure_token=${data.token}; path=/; max-age=${maxAge}; SameSite=Lax`;
        document.cookie = `trashure_role=${role}; path=/; max-age=${maxAge}; SameSite=Lax`;
      }

      setSuccessModal({
        isOpen: true,
        message: "Login berhasil! Mengalihkan...",
      });

      // Redirect after brief delay
      setTimeout(() => {
        const role = data.user?.role || "warga";
        // Default role routing (can be adjusted as needed)
        if (role === "admin") {
          router.push("/admin/dashboard");
        } else if (role === "petugas") {
          router.push("/petugas/dashboard");
        } else if (role === "pengepul") {
          router.push("/pengepul/dashboard");
        } else {
          router.push("/warga/dashboard");
        }
      }, 900);
    } catch (err: unknown) {
      setErrorModal({
        isOpen: true,
        message:
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan koneksi ke server. Pastikan backend aktif.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[450px] lg:max-w-[470px] bg-white rounded-[28px] sm:rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-gray-100/90 p-7 sm:p-9 relative z-10 transition-all">
      {/* Top Logo Badge — Green squircle with white Leaf icon */}
      <div className="flex justify-center mb-3.5">
        <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#16a34a] shadow-md shadow-green-200/80 flex items-center justify-center">
          <Leaf className="w-6 h-6 sm:w-7 sm:h-7 text-white" strokeWidth={2.4} />
        </div>
      </div>

      {/* Header Titles */}
      <div className="text-center mb-5 sm:mb-6">
        <h2 className="text-2xl sm:text-[26px] font-bold text-gray-900 tracking-tight">
          Selamat Datang
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Masuk untuk mengakses akun Anda
        </p>
      </div>

      {/* Error Alert */}
      {errorModal.isOpen && (
        <AlertModal
          isOpen={errorModal.isOpen}
          onClose={() => setErrorModal({ isOpen: false, message: "" })}
          type="error"
          title="Gagal"
          message={errorModal.message}
        />
      )}

      {/* Success Alert */}
      {successModal.isOpen && (
        <AlertModal
          isOpen={successModal.isOpen}
          onClose={() => setSuccessModal({ isOpen: false, message: "" })}
          type="success"
          title="Berhasil"
          message={successModal.message}
        />
      )}

      {/* Info Modal - Lupa Password & Hubungi Admin */}
      {infoModal.isOpen && (
        <AlertModal
          isOpen={infoModal.isOpen}
          onClose={() => setInfoModal({ isOpen: false, title: "", message: "" })}
          type="info"
          title={infoModal.title}
          message={infoModal.message}
        />
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email / Username Field */}
        <div>
          <label
            htmlFor="loginInput"
            className="block text-xs sm:text-[13px] font-semibold text-gray-700 mb-1.5"
          >
            Email atau Username
          </label>
          <div className="relative flex items-center">
            <User className="w-4 h-4 text-gray-400 absolute left-4 pointer-events-none" />
            <input
              id="loginInput"
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="Masukkan email atau username"
              autoComplete="username"
              required
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#16a34a] focus:ring-4 focus:ring-[#16a34a]/10 transition-all"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label
            htmlFor="passwordInput"
            className="block text-xs sm:text-[13px] font-semibold text-gray-700 mb-1.5"
          >
            Password
          </label>
          <div className="relative flex items-center">
            <Lock className="w-4 h-4 text-gray-400 absolute left-4 pointer-events-none" />
            <input
              id="passwordInput"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              autoComplete="current-password"
              required
              className="w-full pl-11 pr-11 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#16a34a] focus:ring-4 focus:ring-[#16a34a]/10 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              className="absolute right-3.5 text-gray-400 hover:text-gray-600 focus:outline-none p-1 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Lupa Password Link */}
        <div className="flex justify-end pt-0.5">
          <a
            href="#lupa-password"
            onClick={(e) => {
              e.preventDefault();
              setInfoModal({
                isOpen: true,
                title: "Lupa Password?",
                message: "Silakan hubungi administrator bank sampah Trashure di 088213448685 untuk me-reset password akun Anda.",
              });
            }}
            className="text-xs sm:text-[13px] font-medium text-[#15803d] hover:underline transition-colors"
          >
            Lupa Password?
          </a>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 sm:py-3.5 px-4 bg-[#15803d] hover:bg-[#166534] active:scale-[0.99] disabled:opacity-75 disabled:cursor-not-allowed text-white font-semibold text-sm sm:text-base rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Memproses...</span>
              </div>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Masuk</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Belum punya akun note */}
      <div className="mt-5 text-center text-xs sm:text-[13px] text-gray-500">
        Belum punya akun?{" "}
        <a
          href="#hubungi-admin"
          onClick={(e) => {
            e.preventDefault();
            setInfoModal({
              isOpen: true,
              title: "Hubungi Admin",
              message: "Silakan hubungi administrator bank sampah Trashure di 088213448685 untuk pendaftaran akun.",
            });
          }}
          className="font-semibold text-[#15803d] hover:underline cursor-pointer"
        >
          Hubungi admin
        </a>
      </div>
    </div>
  );
}
