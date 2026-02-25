"use client";

import { useResendVerification, useVerifyEmail } from "@/utils/api";
import routes from "@/utils/routes";
import { Button } from "@mantine/core";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

// Import the generated hooks from Orval

const VerifyPage = () => {
  const params = useSearchParams();
  const token = params.get("token");

  const [email, setEmail] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [resendSuccess, setResendSuccess] = useState(false);

  // Orval hook for verifying email
  const verifyMutation = useVerifyEmail({
    token: token as string,
  });

  // Orval hook for resending verification
  const resendMutation = useResendVerification({
    mutation: {
      onSuccess: () => setResendSuccess(true),
      onError: (error) => {
        setResendSuccess(false);
        console.error(error);
      },
    },
  });

  // trigger verifying only once
  useEffect(() => {
    if (token) {
      verifyMutation.refetch();
    }
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ maxWidth: 400, margin: "0 auto", padding: 32 }}>
      <h1>Email Verification</h1>
      {verifyMutation.isLoading && <p>Verifying...</p>}

      {/* Success */}
      {verifyMutation.isSuccess && !verificationError && (
        <div>
          <p>Your email has been verified. You can now log in.</p>
        </div>
      )}

      {/* Error / Expired */}
      {verificationError && (
        <div>
          <p style={{ color: "red" }}>{verificationError}</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              resendMutation.mutate({ params: { email: email } });
            }}
          >
            <label>
              Enter your email to resend verification:
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ marginLeft: 8 }}
              />
            </label>
            <button type="submit" style={{ marginLeft: 8 }} disabled={resendMutation.isPending}>
              {resendMutation.isPending ? "Sending..." : "Resend Email"}
            </button>
          </form>
          {resendSuccess && <p style={{ color: "green" }}>Verification email sent!</p>}
        </div>
      )}
      <Button component={Link} href={routes.LOGIN}>
        Back to Login page
      </Button>
    </div>
  );
};

export default VerifyPage;
