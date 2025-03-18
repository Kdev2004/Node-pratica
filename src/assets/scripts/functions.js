const registerMessageError = (error) => {
    const messageError = document.getElementById('message');

    messageError.innerHTML = error;
    messageError.style.display = 'block';
}

window.registerMessageError = registerMessageError;