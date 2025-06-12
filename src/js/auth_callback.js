import "../css/signup.css";
import { handleAuthCallback } from "./services/auth_service";

window.addEventListener("load", () => {
  handleAuthCallback().then((token) => {
    if (token) {
      window.location.href = "/homepage.html";
    }
  });
});
