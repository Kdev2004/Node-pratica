const form = document.getElementById('loginForm');

form.addEventListener('submit', async(event) => {
    event.preventDefault();

    const username = document.getElementById('user').value;
    const userpass = document.getElementById('pass').value;

    try{
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user: username,
                pass: userpass
            })
        });

        const data = await response.json();

        if(response.status === 200){
            registerMessage.success(data.message)
            
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        }
        else
            registerMessage.error(data.message);
    }
    catch(error){
        registerMessage.error('Um erro inesperado ocorreu! tente novamente.');
    }
});