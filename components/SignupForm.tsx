"use client";

import Image from "next/image";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import LoginImg1 from "@/public/images/LoginImg1.png";
import AmbrosiaLogo from "@/public/images/AmbrosiaLogo.png";
import { Button } from "primereact/button";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { setAuthTokens } from "@/utils/authTokens";
import { fetchUserProfile } from "@/utils/userProfile";

export default function SigninForm() {
  const [loading, setLoading] = useState<boolean>(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleSigninSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setErrorMessage(payload?.message || "Login failed.");
        return;
      }
      if (!payload?.succeeded || !payload?.data?.access_token) {
        const errors = Array.isArray(payload?.errors)
          ? payload.errors.join(", ")
          : "";
        setErrorMessage(payload?.message || errors || "Login failed.");
        return;
      }

      setAuthTokens(payload.data);
      await fetchUserProfile();

      router.replace("/menu");
    } catch (error) {
      setErrorMessage("Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full">
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
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white px-6 sm:px-12">
        <div className="w-full max-w-md">
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

          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-black mb-3">Welcome</h1>
            <p className="text-gray-600">
              Sign in to access the Ambrosia Employee Portal.
            </p>
          </div>
          <form className="space-y-6" onSubmit={handleSigninSubmit}>
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-800"
              >
                Username
              </label>
              <InputText
                id="username"
                name="username"
                autoComplete="username"
                className="mt-2 w-full block p-[15px] border border-gray-300 rounded-md"
                placeholder="Enter your username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-800"
              >
                Password
              </label>
              <Password
                id="password"
                name="password"
                autoComplete="current-password"
                className="mt-2 w-full block"
                inputClassName="w-full p-[15px] border border-gray-300 rounded-md pr-12"
                placeholder="Enter your password"
                feedback={false}
                toggleMask
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            {errorMessage ? (
              <p
                className="text-sm text-center text-red-600"
                style={{ color: "#dc2626" }}
              >
                {errorMessage}
              </p>
            ) : null}

            <div className="space-y-6">
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white font-semibold py-[16px] rounded-md hover:bg-gray-800 transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                style={{
                  backgroundColor: "#000",
                  border: "none",
                  borderRadius: "8px",
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
                    <span>Signing you in...</span>
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

              <p className="text-center text-xs text-gray-400 mt-2 pt-2">
                © 2026 Ambrosia Team
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
