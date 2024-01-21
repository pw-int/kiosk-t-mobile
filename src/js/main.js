(function() {
    initFormValidation();
})();


/**
 * Validation
 */

function initFormValidation() {
    const forms = document.querySelectorAll('.needs-validation')
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => genericFormsValidation(event, form));
    })
}

function validateFormWithDismissibleAlerts(event, form) {
    event.preventDefault()
    event.stopPropagation()

    if (form.checkValidity()) {
        // TODO: send request to server

        // cleanup the data
        form.reset();
        form.classList.remove('was-validated');

        const confirmationModal = new bootstrap.Modal(document.getElementById('requestAcceptedModal'));
        if (confirmationModal) {
            confirmationModal.show();
        }
    } else {
        form.classList.add('was-validated');
    }
}

function genericFormsValidation(event, form) {
    if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
    }

    form.classList.add('was-validated')
}