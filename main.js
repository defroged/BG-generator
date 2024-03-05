function toggleNav() {
    var sideNav = document.getElementById("sideNav");
    var mainContent = document.querySelector(".main-content");
    var hamburgerIcon = document.querySelector(".hamburger-icon");
    var eslLink = document.querySelector(".esl-link"); // Get the reference to the site logo
    var viewportWidth = window.innerWidth || document.documentElement.clientWidth;

    if (sideNav.style.width === "250px") {
        sideNav.style.width = "0";
        // Only adjust marginLeft if not on mobile
        if (viewportWidth > 768) {
            mainContent.style.marginLeft = "0";
        }
        hamburgerIcon.style.left = "15px";
        hamburgerIcon.style.top = "15px";
        eslLink.style.left = "50px"; // Move the site logo back
    } else {
        sideNav.style.width = "250px";
        // Only adjust marginLeft if not on mobile
        if (viewportWidth > 768) {
            mainContent.style.marginLeft = "250px";
        }
        hamburgerIcon.style.left = "200px";
        hamburgerIcon.style.top = "15px";
        eslLink.style.left = "260px"; // Move the site logo to the right
    }
}
