"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "primereact/button";
import LoginImg1 from "@/public/images/LoginImg1.png";
import AmbrosiaLogo from "@/public/images/AmbrosiaLogo.png";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function Login() {
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleLoginClick = async () => {
    setLoading(true);
    await signIn("auth0", { callbackUrl: "/menu" });
  };

  return (
    <div className="flex h-screen w-full">
      {/* Left Side - Background Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-black">
        <Image
          src={LoginImg1}
          alt="Luxury bar ambiance"
          fill
          className="object-cover object-center"
          priority
          quality={100}
          sizes="(min-width: 1024px) 50vw, 100vw"
        />
        {/* Optional Overlay for better text contrast if you ever add text here */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Right Side - Login Action */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white px-6 sm:px-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-12">
            <Image
              src={AmbrosiaLogo}
              alt="AMBROSIA Logo"
              width={300}
              height={100}
              className="h-auto"
              priority
            />
          </div>

          {/* Welcome Section */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-black mb-3">Welcome</h1>
            <p className="text-gray-600">
              Sign in to access the Ambrosia Employee Portal.
            </p>
          </div>

          {/* Login Button Container */}
          <div className="space-y-6">
            <Button
              onClick={handleLoginClick}
              disabled={loading}
              className="w-full bg-black text-white font-semibold py-4 rounded-md hover:bg-gray-800 transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              style={{
                backgroundColor: "#000",
                border: "none",
                borderRadius: "8px", // Slightly more modern radius
                fontSize: "16px",
                fontWeight: "600",
              }}
            >
              {loading ? (
                <>
                  <i
                    className="pi pi-spinner pi-spin"
                    style={{ fontSize: "18px", color: "white" }}
                  />
                  <span>Connecting to Secure Login...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <i
                    className="pi pi-arrow-right"
                    style={{ fontSize: "16px" }}
                  />
                </>
              )}
            </Button>

            <p className="text-center text-xs text-gray-400 mt-2">
              © 2026 Ambrosia Team
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
