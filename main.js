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
        e.preventDefault(); 
        
        const formData = new FormData(form);
        for (let pair of formData.entries()) {
            console.log(pair[0] + ': ' + pair[1]);
        }

        fetch(form.action, {
            method: 'POST',
            body: formData,
        })
        .then(response => {
            if(response.ok) {
                return response.json(); 
            }
            throw new Error('Network response was not ok.');
        })
        .then(json => {
            const downloadUrl = json.downloadUrl; 
            const downloadLink = document.createElement('a');
            downloadLink.href = downloadUrl;
            // Remove the download attribute to prevent automatic download
            // Set the target attribute to '_blank' to open in a new window/tab
            downloadLink.target = '_blank';
            document.body.appendChild(downloadLink);
            downloadLink.click(); // This will now open the URL in a new window/tab instead of downloading
            document.body.removeChild(downloadLink);
        })
        .catch(error => console.error('Error:', error));
    });
});

const addInputBtn = document.getElementById('addInputBtn');
function addNewInput() {
    const inputFields = document.querySelector('.input-fields');
    const inputCount = inputFields.childElementCount;

    const newInputGroup = document.createElement('div');
    newInputGroup.classList.add('input-group');

    const newInputLabel = document.createElement('label');
    newInputLabel.textContent = `Box ${inputCount + 1}:`;
    newInputLabel.htmlFor = `box${inputCount + 1}`;

    const newInput = document.createElement('input');
    newInput.type = 'text';
    newInput.id = `box${inputCount + 1}`;
    newInput.name = `box${inputCount + 1}`;

    newInputGroup.appendChild(newInputLabel);
    newInputGroup.appendChild(newInput);
    inputFields.appendChild(newInputGroup);
}

addInputBtn.addEventListener('click', addNewInput);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    const focusedElement = document.activeElement;
    if (focusedElement.tagName === 'INPUT' && focusedElement.parentElement.parentElement.lastElementChild === focusedElement.parentElement) {
      addNewInput();

      // Get a reference to the new input field
      const inputFields = document.querySelector('.input-fields');
      const lastInput = inputFields.lastElementChild.querySelector('input');

      // Focus on the new input field
      lastInput.focus();
    }
  }
});
