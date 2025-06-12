import { supabase } from "../supabase_client";

let accessToken = null;

async function signInWithProvider(provider) {
  try {
    if (!["google", "github"].includes(provider)) {
      throw new Error("Provider not supported");
    }
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `http://localhost:3000/auth/callback`,
      },
    });
    if (error) {
      console.error(`Error signing in with ${provider}:`, error.message);
      alert(`Failed to sign in with ${provider}: ${error.message}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Unexpected error:", err);
    alert("An unexpected error occurred. Please try again.");
    return false;
  }
}

async function signOut() {
  try {
    await supabase.auth.signOut();
    accessToken = null;
    return true;
  } catch (error) {
    console.error("Sign out error:", error.message);
    alert("Failed to sign out: " + error.message);
    return false;
  }
}

async function handleAuthCallback() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Error retrieving session:", error.message);
      alert("Failed to complete authentication: " + error.message);
      return false;
    }
    if (data.session) {
      accessToken = data.session.access_token;
      console.log("User authenticated:", data.session.user);
      return accessToken;
    } else {
      return false;
    }
  } catch (err) {
    console.error("Unexpected error:", err);
    alert("An unexpected error occurred during callback.");
    return false;
  }
}

function getAccessToken() {
  return accessToken;
}

export { signInWithProvider, signOut, handleAuthCallback, getAccessToken };
