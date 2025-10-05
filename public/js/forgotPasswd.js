document.addEventListener("DOMContentLoaded", function () {
    const forgotPasswordForm = document.getElementById("forgot-password-form");
    const errorMessage = document.getElementById("error-message");

    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            errorMessage.style.display = "none";

            const email = document.getElementById("email").value.trim();
            const submitButton = document.querySelector("button[type='submit']");

            if (!email) {
                displayError("Please enter your email.");
                return;
            }

            try {
                submitButton.disabled = true;
                submitButton.textContent = "Processing...";

                const response = await fetch("/api/auth/forgot-password", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email })
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.error || "Something went wrong.");

                alert("If this email is registered, you will receive a reset link with instructions.");

                // Clear input after successful submission
                document.getElementById("email").value = "";
            } catch (error) {
                displayError(error.message || "An unexpected error occurred. Please try again.");
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = "Continue";
            }
        });
    }

    function displayError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = "block";
    }
});
