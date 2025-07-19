import { useEffect, useState } from "react";
// import { useSearchParams } from "react-router-dom"; // or use URLSearchParams
import { Client, Account } from "appwrite";

export const client = new Client();

client
  .setEndpoint("https://nyc.cloud.appwrite.io/v1")
  .setProject("686c91fd00382956557e"); // Replace with your project ID

export const account = new Account(client);
export { ID } from "appwrite";

export default function VerifyPage() {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const userId = searchParams.get("userId");
    const secret = searchParams.get("secret");

    const verifyUser = async () => {
      try {
        if (!userId || !secret) throw new Error("Missing parameters");
        await account.updateVerification(userId, secret);
        setStatus("success");
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("error");
      }
    };

    verifyUser();
  }, []);

  if (status === "loading") return <p>Verifying your email...</p>;
  if (status === "success") return <h2>Email Verified ✅</h2>;
  return <h2>Verification Failed ❌</h2>;
}
