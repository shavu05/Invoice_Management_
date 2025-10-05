document.addEventListener("DOMContentLoaded", function () {
    // Toggle password visibility function
    function togglePassword(inputId, iconId) {
        const passwordField = document.getElementById(inputId);
        const eyeIcon = document.getElementById(iconId);

        if (passwordField.type === 'password') {
            passwordField.type = 'text';
        } else {
            passwordField.type = 'password';
        }
    }

    document.getElementById('toggle-new-password').addEventListener('click', function () {
        togglePassword('new-password', 'toggle-new-password');
    });

    document.getElementById('toggle-confirm-password').addEventListener('click', function () {
        togglePassword('confirm-password', 'toggle-confirm-password');
    });

    // Get token and email from URL
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get("email");
    const token = urlParams.get("token");

    // Set the email and token values in the hidden inputs
    if (email) {
        document.getElementById('email').value = email;
    }
    if (token) {
        document.getElementById('token').value = token;
    }

    const resetPasswordForm = document.getElementById("reset-password-form");
    const errorMessage = document.getElementById("error-message");

    resetPasswordForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        errorMessage.style.display = "none";

        const newPassword = document.getElementById("new-password").value.trim();
        const confirmPassword = document.getElementById("confirm-password").value.trim();
        const submitButton = document.querySelector("button[type='submit']");

        if (!newPassword || !confirmPassword) {
            displayError("All fields are required.");
            return;
        }

        if (newPassword !== confirmPassword) {
            displayError("New password and confirm password do not match.");
            return;
        }

        if (!email || !token) {
            displayError("Missing email or token. Please use the link from your email.");
            return;
        }

        try {
            submitButton.disabled = true;
            submitButton.textContent = "Processing...";

            // Send the email, token, newPassword, and confirmPassword to the backend
            const response = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    token,
                    newPassword,
                    confirmPassword  // Include confirmPassword here
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Password reset failed.");
            }

            alert("Password reset successful! Redirecting to login...");
            window.location.href = "/html/login.html";

        } catch (error) {
            displayError(error.message);
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Reset Password";
        }
    });

    function displayError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = "block";
    }
});
