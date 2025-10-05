document.addEventListener("DOMContentLoaded", function () {
    const signupForm = document.getElementById("signup-form");
    const errorMessage = document.getElementById("error-message");

    if (signupForm) {
        signupForm.addEventListener("submit", async (event) => {
            event.preventDefault(); // Prevent default form submission
            errorMessage.style.display = "none";

            const username = document.getElementById("username").value.trim();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;
            const confirmPassword = document.getElementById("confirmPassword").value;
            const submitButton = event.target.querySelector("button[type='submit']");

            // Check if all fields are filled
            if (!username || !email || !password || !confirmPassword) {
                displayError("All fields are required.");
                return;
            }

            // Validate email format
            if (!validateEmail(email)) {
                displayError("Please enter a valid email address.");
                return;
            }

            // Check if passwords match
            if (password !== confirmPassword) {
                displayError("Passwords do not match.");
                return;
            }

            try {
                submitButton.disabled = true;
                submitButton.innerHTML = "Processing...";

                const response = await fetch("/api/auth/signup", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, email, password }),
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.message || data.error || "Signup failed.");


                alert("Signup successful! Redirecting to login page...");
                window.location.href = "login.html"; // Redirect to login page
            } catch (error) {
                displayError(error.message);
            } finally {
                submitButton.disabled = false;
                submitButton.innerHTML = "Sign Up";
            }
        });
    }

    function displayError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = "block";
    }

    function validateEmail(email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    }

    window.togglePassword = function (fieldId, icon) {
        const passwordField = document.getElementById(fieldId);
        if (passwordField.type === "password") {
            passwordField.type = "text";
            icon.textContent = "🙈"; // Change icon to indicate password is visible
        } else {
            passwordField.type = "password";
            icon.textContent = "👁️"; // Change back to show password icon
        }

        
    };
});
