import { createClient } from "@supabase/supabase-js";
import "../css/signup.css";

const supabase = createClient(
  "https://qvpwuodxijbibpuwkzkp.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2cHd1b2R4aWpiaWJwdXdremtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNTk3MTcsImV4cCI6MjA2MjYzNTcxN30._TeD1I7CpXBFBBtWaZdQwgi6fmvWaQPLBQlYO2yfWfM"
);

document.getElementById("google-login").addEventListener("click", async () => {
  await supabase.auth.signInWithOAuth({ provider: "google" });
});

document.getElementById("github-login").addEventListener("click", async () => {
  await supabase.auth.signInWithOAuth({ provider: "github" });
});

document.getElementById("email-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const { error } = await supabase.auth.signInWithOtp({ email });

  if (error) alert("Failed to send magic link: " + error.message);
  else alert("Check your email for the login link!");
});
