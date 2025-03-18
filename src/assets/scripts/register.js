const form = document.getElementById('registerForm');
const message = document.getElementById('message');

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('usuario').value;
    const userpass = document.getElementById('senha').value;  

    try {
        const requisition = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user: username,
                pass: userpass
            })
        });

        const data = await requisition.json();

        registerMessageError(data.message);
    }
    catch (error) {
        
    }
})