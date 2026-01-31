"use client";

import { HttpError } from "@/features/api";
import { forgotPassword, resetPassword } from "@/features/auth";
import { GameLayout, PixelButton, PixelCard } from "@/features/ui";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function ForgotPasswordPage(){
    const router = useRouter();
    const searchParams = useSearchParams();     
    const code = searchParams.get("code");
    
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false)
    const [submitting, setSubmitting] = useState(false);

    return (
        <GameLayout title="Forgot Password" backHref="/login"
            subtitle={
                !code
                ? "Enter your email and we’ll send you a reset link."
                : "Enter your new password to continue."
            }
        >
            <PixelCard>
                {error && (
                    <div className="pixel-frame mb-4 bg-[color:var(--pixel-panel-2)] p-3 text-xl text-[color:var(--game-danger)]">
                        {error}
                    </div>
                )}
                {!code && success && (
                    <div className="pixel-frame mb-4 bg-[color:var(--pixel-panel-2)] p-3 text-xl text-[color:var(--game-danger)]">
                        Reset email sent. Please check your inbox.
                    </div>
                )}
                {/* STEP 1: FORGOT PASSWORD */}
                {!code && !success && (
                    <form
                        className="flex flex-col gap-4"
                        onSubmit={async (e) =>{
                            e.preventDefault()
                            setSubmitting(true);
                            setError(null);
                            try {
                                await forgotPassword({email})
                                setSuccess(true)
                            }catch (err){
                                if(err instanceof HttpError) setError(err.message)
                                else setError("Failed to send reset email.");
                            }finally {
                                setSubmitting(false)
                            }
                        }}
                    >
                        <label className="flex flex-col gap-2">
                            <span className="pixel-text-title text-xs text-[color:var(--game-fg)]">
                                Email
                            </span>
                            <input
                            className="pixel-frame bg-[color:var(--pixel-panel-2)] px-3 py-3 text-2xl text-[color:var(--game-fg)] placeholder:text-[color:var(--game-muted)] focus:outline-none"
                                placeholder="hero@example.com"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </label>

                        <PixelButton size="lg" variant="primary" type="submit" loading={submitting}>
                            Send Reset Email
                        </PixelButton>
                    </form>
                )}
                {/* STEP 2: RESET PASSWORD */}
                {code && (
                    <form
                        className="flex flex-col gap-4"
                        onSubmit={async (e) =>{
                            e.preventDefault();
                            if (password !== confirmPassword) {
                                setError("Passwords do not match.");
                                return;
                            }
                            setSubmitting(true);
                            setError(null);
                            try {
                                await resetPassword({code, password, passwordConfirmation: confirmPassword})
                                router.replace("/login")
                            }catch (err){
                                if(err instanceof HttpError) setError(err.message)
                                else setError("Reset password failed.");
                            }finally {
                                setSubmitting(false)
                            }
                        }}
                    >
                        <label className="flex flex-col gap-2">
                            <span className="pixel-text-title text-xs text-[color:var(--game-fg)]">
                                New Password
                            </span>
                            <input
                                className="pixel-frame bg-[color:var(--pixel-panel-2)] px-3 py-3 text-2xl text-[color:var(--game-fg)] placeholder:text-[color:var(--game-muted)] focus:outline-none"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </label>

                        <label className="flex flex-col gap-2">
                            <span className="pixel-text-title text-xs text-[color:var(--game-fg)]">
                                Confirm Password
                            </span>
                            <input
                                className="pixel-frame bg-[color:var(--pixel-panel-2)] px-3 py-3 text-2xl text-[color:var(--game-fg)] placeholder:text-[color:var(--game-muted)] focus:outline-none"
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </label>

                        <PixelButton size="lg" variant="primary" type="submit" loading={submitting}>
                            Reset Password
                        </PixelButton>
                    </form>
                )}
            </PixelCard>
        </GameLayout>
    )
}