document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('contact-form');
    const thankYouMessage = document.getElementById('thank-you-message');

    form.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent the default form submission
        
        const formData = new FormData(form);

        fetch(form.action, {
            method: form.method,
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        }).then(response => {
            if (response.ok) {
                form.reset();
                thankYouMessage.style.display = 'block';
            } else {
                response.json().then(data => {
                    if (Object.hasOwn(data, 'errors')) {
                        alert(data["errors"].map(error => error["message"]).join(", "));
                    } else {
                        alert('Oops! There was a problem submitting your form');
                    }
                });
            }
        }).catch(error => {
            alert('Oops! There was a problem submitting your form');
        });
    });
});