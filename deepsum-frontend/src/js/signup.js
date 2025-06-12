import "../css/signup.css";
import { signInWithProvider } from "./services/auth_service";

document.getElementById("google-login").addEventListener("click", () => {
  signInWithProvider("google").then((success) => {
    if (success) {
      console.log("Redirecting to Google OAuth...");
    }
  });
});

document.getElementById("github-login").addEventListener("click", () => {
  signInWithProvider("github").then((success) => {
    if (success) {
      console.log("Redirecting to GitHub OAuth...");
    }
  });
});
