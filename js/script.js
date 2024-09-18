function saveUserToLocalStorage(user) {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.display = 'block';

    // Hide the toast after 3 seconds
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}
function clearInputFields() {
    const inputs = document.querySelectorAll('#userInfo input');
    inputs.forEach(input => input.value = '');
}

function addUser() {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const firstname = document.getElementById('firstname').value;
    const lastname = document.getElementById('lastname').value;
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const emailExists = users.some(user => user.email === email);

    if (!username || !email || !password || !firstname || !lastname) {
        showToast('Fill all the details');
        return;
    }
    if (emailExists) {
        showToast('User already exists');
        return;
    } else{
    const user = {
        username: username,
        email: email,
        password: password,
        firstname: firstname,
        lastname: lastname
    };

    saveUserToLocalStorage(user);
    showToast('User added successfully');
    clearInputFields();
    displayUsers();
    }
}
function showConfirmationDialog(username) {
    const dialog = document.getElementById('confirmation-dialog');
    const message = document.querySelector('#confirmation-dialog .dialog-message');
    
    message.textContent = `Do you want to delete the User "${username}" ?`;
    dialog.style.display = 'block';

    document.querySelector('#confirmation-dialog .yes-button').addEventListener('click', () => {
        deleteUser(username);
        dialog.style.display = 'none';
        showToast('User Deleted Successfully'); // Ensure this message is correct
    });

    document.querySelector('#confirmation-dialog .no-button').addEventListener('click', () => {
        dialog.style.display = 'none';
    });
}

function deleteUser(username) {
    let users = JSON.parse(localStorage.getItem('users'));
    users = users.filter(user => user.username !== username);
    localStorage.setItem('users', JSON.stringify(users));
    displayUsers();
}
// Display users on the view user page
function displayUsers() {
    const userList = document.getElementById('userList');
    if (userList) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        userList.innerHTML = ''; // Clear the current list
    
        if (users.length === 0) {
            userList.innerHTML = '<div id="no-user-container"><p id="no-user-message">No User Available</p></div>';
        } else {
            users.forEach(user => {
                const listItem = document.createElement('li');
                const username = document.createElement('strong');
                username.textContent = user.username;
                listItem.appendChild(username);

                const buttonContainer = document.createElement('div');
                buttonContainer.className = 'button-container';

                const viewButton = document.createElement('button');
                viewButton.className = 'view-details';
                viewButton.textContent = 'View Details';
                buttonContainer.appendChild(viewButton);

                const editButton = document.createElement('button');
                editButton.className = 'edit';
                editButton.textContent = 'Edit';
                buttonContainer.appendChild(editButton);

                const deleteButton = document.createElement('button');
                deleteButton.className = 'delete';
                deleteButton.textContent = 'Delete';
                buttonContainer.appendChild(deleteButton);

                listItem.appendChild(buttonContainer);
                userList.appendChild(listItem);
                const detailsContainer = document.createElement('div');
                detailsContainer.className = 'user-details';
                detailsContainer.style.display = 'none';
                detailsContainer.innerHTML = `
                    <p><strong>Email:</strong> <span>${user.email}</span></p>
                    <p><strong>Password:</strong> <span>${user.password}</span></p>
                    <p><strong>First Name:</strong> <span>${user.firstname}</span></p>
                    <p><strong>Last Name:</strong> <span>${user.lastname}</span></p>
                    <button class="close-details">Close</button>
                `;
                listItem.appendChild(detailsContainer);

                viewButton.addEventListener('click', () => {
                    detailsContainer.style.display = 'block';
                });
                const closeButton = detailsContainer.querySelector('button.close-details');
                closeButton.addEventListener('click', () => {
                    detailsContainer.style.display = 'none';
                });
                deleteButton.addEventListener('click', () => {
                    showConfirmationDialog(user.username);
                });
                editButton.addEventListener('click', () => {
                    openEditPopup(user);
                });
            });
        }
    }
}
function openEditPopup(user) {
    document.getElementById('edit-popup').style.display = 'block';
    document.getElementById('edit-username').value = user.username;
    document.getElementById('edit-email').value = user.email;
    document.getElementById('edit-password').value = user.password;
    document.getElementById('edit-firstname').value = user.firstname;
    document.getElementById('edit-lastname').value = user.lastname;

    document.getElementById('save-edit').onclick = () => saveEdit(user.username);
    document.getElementById('cancel-edit').onclick = () => document.getElementById('edit-popup').style.display = 'none';
}

function saveEdit(originalUsername) {
    const username = document.getElementById('edit-username').value;
    const email = document.getElementById('edit-email').value;
    const password = document.getElementById('edit-password').value;
    const firstname = document.getElementById('edit-firstname').value;
    const lastname = document.getElementById('edit-lastname').value;

    if (!username || !email || !password || !firstname || !lastname) {
        showToast('Fill all the details');
        return;
    }

    let users = JSON.parse(localStorage.getItem('users')) || [];
    users = users.map(user => {
        if (user.username === originalUsername) {
            return {
                username: username,
                email: email,
                password: password,
                firstname: firstname,
                lastname: lastname
            };
        }
        return user;
    });

    localStorage.setItem('users', JSON.stringify(users));
    document.getElementById('edit-popup').style.display = 'none';
    displayUsers();
    showToast('User updated successfully');
}

// Check if we're on the viewuser.html page and display users
const userList = document.getElementById('userList');
if (userList) {
    displayUsers();
}

window.showToast = showToast;
window.addUser = addUser;
module.exports = { saveUserToLocalStorage,clearInputFields,displayUsers,showConfirmationDialog,deleteUser,openEditPopup,
    saveEdit};
