document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("login-form");
    const errorMessage = document.getElementById("error-message");

    if (loginForm) {
        loginForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            errorMessage.style.display = "none";

            const username = document.getElementById("username").value.trim();
            const password = document.getElementById("password").value;
            const submitButton = document.querySelector("button[type='submit']");

            if (!username || !password) {
                displayError("Please enter both username and password.");
                return;
            }

            try {
                submitButton.disabled = true;
                submitButton.textContent = "Processing...";

                const response = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password }),
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.error || "Login failed.");

                //  Store user info in localStorage
                localStorage.setItem("user", JSON.stringify({
                    username: data.username,
                    role: data.role
                }));

                //  Redirect based on role
                if (data.role === "admin") {
                    window.location.href = "/html/dashboard.html";
                } else {
                    window.location.href = "/html/logindashboard.html";
                }

            } catch (error) {
                displayError(error.message);
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = "Login";
            }
        });
    }

    function displayError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = "block";
    }
});
