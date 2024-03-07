/* Sidebar Navigation */
function toggleNav() {
    var sideNav = document.getElementById("sideNav");
    var mainContent = document.querySelector(".main-content");
    var hamburgerIcon = document.querySelector(".hamburger-icon");
    var eslLink = document.querySelector(".esl-link");
    var viewportWidth = window.innerWidth || document.documentElement.clientWidth;

    if (sideNav.style.width === "250px") {
        sideNav.style.width = "0";
        if (viewportWidth > 768) {
            mainContent.style.marginLeft = "0"; 
        }
        hamburgerIcon.style.left = "15px";
        hamburgerIcon.style.top = "15px";
        eslLink.style.left = "50px";
    } else {
        sideNav.style.width = "250px";
        if (viewportWidth > 768) {
            mainContent.style.marginLeft = "250px"; 
        }
        hamburgerIcon.style.left = "200px";
        hamburgerIcon.style.top = "15px";
        eslLink.style.left = "260px";
    }
}
 /* Handling the form and PDF */
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('customizationForm');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent the default form submission
        
        const formData = new FormData(form);
		console.log('Form Data:', formData);

        // Here, you might want to loop through formData and perform any necessary preprocessing
        // For now, we'll just send it as is

        fetch(form.action, {
            method: 'POST',
            body: formData,
        })
        .then(response => {
            if(response.ok) {
                return response.json(); // Read the JSON object from the response
            }
            throw new Error('Network response was not ok.');
        })
        .then(json => {
            const downloadUrl = json.downloadUrl; // Get the download URL from the JSON response
            // Create a link to download the PDF
            const downloadLink = document.createElement('a');
            downloadLink.href = downloadUrl;
            downloadLink.download = "customized_board_game.pdf"; // Set the file name
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);            
        })
        .catch(error => console.error('Error:', error));
    });
});
