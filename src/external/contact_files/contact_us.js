function check_attachment_size(event) {
    let input = document.getElementById('contact_us_attachments')
    if (input.files.length > 0) {
        let totalSize = Array.from(input.files).reduce((sum, file) => sum += file.size, 0)
        if (totalSize > input.getAttribute('data-file-max-size') * 1024 * 1024) {
            input.setCustomValidity(input.getAttribute('data-file-max-size-message'));
            input.reportValidity();
            event.preventDefault();
        }
    }
}

function clearHTML5validation(object) {
    object.setCustomValidity('');
    object.reportValidity();
}
