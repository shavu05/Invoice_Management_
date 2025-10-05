document.addEventListener("DOMContentLoaded", function () {
    // Mobile menu toggle
    document.querySelector('.mobile-menu').addEventListener('click', function () {
        document.getElementById('nav-menu').classList.toggle('show');
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });

            // Close mobile menu after clicking
            if (document.getElementById('nav-menu').classList.contains('show')) {
                document.getElementById('nav-menu').classList.remove('show');
            }
        });
    });

    // Form submission handling
    document.getElementById('contactForm').addEventListener('submit', function (e) {
        e.preventDefault();
        alert('Thank you for your message! We will get back to you soon.');
        this.reset();
    });
});
document.addEventListener("DOMContentLoaded", function() {
    const signupBtn = document.getElementById("signupBtn");
    const signupOptions = document.getElementById("signupOptions");

    const loginBtn = document.getElementById("loginBtn");
    const loginOptions = document.getElementById("loginOptions");

    // Toggle Signup Dropdown
    signupBtn.addEventListener("click", function(event) {
        event.preventDefault();
        signupOptions.style.display = (signupOptions.style.display === "block") ? "none" : "block";
    });

    // Toggle Login Dropdown
    loginBtn.addEventListener("click", function(event) {
        event.preventDefault();
        loginOptions.style.display = (loginOptions.style.display === "block") ? "none" : "block";
    });

    // Hide dropdowns when clicking outside
    window.onclick = function(event) {
        if (!signupBtn.contains(event.target) && !signupOptions.contains(event.target)) {
            signupOptions.style.display = "none";
        }
        if (!loginBtn.contains(event.target) && !loginOptions.contains(event.target)) {
            loginOptions.style.display = "none";
        }
    };
});
