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
            downloadLink.target = '_blank';
            document.body.appendChild(downloadLink);
            downloadLink.click(); 
            document.body.removeChild(downloadLink);
        })
        .catch(error => console.error('Error:', error));
    });
});

const addInputBtn = document.getElementById('addInputBtn');
function disableOtherInput(targetInput, isImage) {
    if (isImage) {
        targetInput.previousElementSibling.disabled = targetInput.files.length > 0;
    } else {
        targetInput.nextElementSibling.disabled = targetInput.value.length > 0;
    }
}

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
    newInput.addEventListener('input', function (event) {
        disableOtherInput(event.target, false);
    });

    const newUploadButton = document.createElement('input');
    newUploadButton.type = 'file';
    newUploadButton.id = `image${inputCount + 1}`;
    newUploadButton.name = `box${inputCount + 1}`;
    newUploadButton.accept = 'image/*';
    newUploadButton.addEventListener('change', function (event) {
        disableOtherInput(event.target, true);
    });

    newInputGroup.appendChild(newInputLabel);
    newInputGroup.appendChild(newInput);
    newInputGroup.appendChild(newUploadButton);
    inputFields.appendChild(newInputGroup);
}

addInputBtn.addEventListener('click', addNewInput);
document.getElementById('box1').addEventListener('input', function (event) {
    disableOtherInput(event.target, false);
});

document.getElementById('image1').addEventListener('change', function (event) {
    disableOtherInput(event.target, true);
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    const focusedElement = document.activeElement;
    if (focusedElement.tagName === 'INPUT' && focusedElement.parentElement.parentElement.lastElementChild === focusedElement.parentElement) {
      addNewInput();

      const inputFields = document.querySelector('.input-fields');
      const lastInput = inputFields.lastElementChild.querySelector('input');
      lastInput.focus();
    }
  }
});
