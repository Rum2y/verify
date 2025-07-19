import { useEffect, useState } from "react";
import { Client, Account } from "appwrite";

export const client = new Client();

client
  .setEndpoint("https://nyc.cloud.appwrite.io/v1")
  .setProject("686c91fd00382956557e"); // Replace with your project ID

export const account = new Account(client);
export { ID } from "appwrite";

export default function VerifyPage() {
  const [status, setStatus] = useState("");
  const [actionType, setActionType] = useState(""); // 'verify' or 'recovery'
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [userId, setUserId] = useState("");
  const [secret, setSecret] = useState("");

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const urlUserId = searchParams.get("userId");
    const urlSecret = searchParams.get("secret");
    const action = searchParams.get("mode");

    if (!urlUserId || !urlSecret) {
      setStatus("error");
      return;
    }

    setUserId(urlUserId);
    setSecret(urlSecret);

    // Determine if this is a verification or password recovery
    const determinedAction = action === "reset" ? "recovery" : "verify";
    setActionType(determinedAction);

    if (determinedAction === "verify") {
      verifyEmail(urlUserId, urlSecret);
    } else {
      // For recovery, just show the password form
      setStatus("ready-for-password");
    }
  }, []);

  const verifyEmail = async (userId, secret) => {
    try {
      await account.updateVerification(userId, secret);
      setStatus("success");
    } catch (error) {
      console.error("Verification error:", error);
      setStatus("error");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords don't match");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    try {
      await account.updateRecovery(userId, secret, newPassword, newPassword);
      setStatus("password-changed");
    } catch (error) {
      console.error("Password change error:", error);
      setStatus("password-error");
    }
  };

  if (status === "error") return <h2>Invalid or expired link ❌</h2>;

  if (actionType === "verify" && status === "success") {
    return (
      <div>
        <h2>Email Verified ✅</h2>
        <p>Your email address has been successfully verified.</p>
      </div>
    );
  }

  if (actionType === "recovery") {
    switch (status) {
      case "ready-for-password":
        return (
          <div style={{ maxWidth: "400px", margin: "0 auto" }}>
            <h2>Set New Password</h2>
            <form onSubmit={handlePasswordChange}>
              <div style={{ marginBottom: "1rem" }}>
                <label htmlFor="newPassword">New Password:</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  style={{ width: "100%", padding: "0.5rem" }}
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label htmlFor="confirmPassword">Confirm Password:</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={{ width: "100%", padding: "0.5rem" }}
                />
              </div>
              {passwordError && <p style={{ color: "red" }}>{passwordError}</p>}
              <button
                type="submit"
                style={{
                  padding: "0.5rem 1rem",
                  background: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Change Password
              </button>
            </form>
          </div>
        );
      case "password-changed":
        return (
          <div>
            <h2>Password Changed Successfully ✅</h2>
            <p>You can now log in with your new password.</p>
          </div>
        );
      case "password-error":
        return (
          <div>
            <h2>Password Change Failed ❌</h2>
            <p>There was an error updating your password. Please try again.</p>
          </div>
        );
      default:
        return <h2>Loading...</h2>;
    }
  }

  return <h2>Loading...</h2>;
}
