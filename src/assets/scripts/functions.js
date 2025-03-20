const registerMessage = {
    success: (success) => {
        const messageSucess = document.getElementById('messageSuccess');
        const messageError = document.getElementById('messageError');

        messageSucess.innerHTML = success;
        messageSucess.style.display = 'block';
        messageError.style.display = 'none';
    },
    
    error: (error) => {
        const messageError = document.getElementById('messageError');
        const messageSucess = document.getElementById('messageSuccess');

        messageError.innerHTML = error;
        messageError.style.display = 'block';
        messageSucess.style.display = 'none';
    }
};

window.registerMessage = registerMessage;