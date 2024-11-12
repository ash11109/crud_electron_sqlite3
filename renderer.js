// renderer.js

// Create User
async function createUser() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    await window.api.createUser({ name, email });
    loadUsers();
}

// Load Users
async function loadUsers() {
    const users = await window.api.readUsers();
    const userList = document.getElementById('userList');
    userList.innerHTML = '';
    users.forEach(user => {
        const userItem = document.createElement('li');
        userItem.textContent = `${user.name} (${user.email})`;
        const updateBtn = document.createElement('button');
        updateBtn.textContent = 'Update';
        updateBtn.onclick = () => updateUser(user.id);
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => deleteUser(user.id);
        userItem.appendChild(updateBtn);
        userItem.appendChild(deleteBtn);
        userList.appendChild(userItem);
    });
}

// Update User
async function updateUser(id) {
    const name = prompt('Enter new name:');
    const email = prompt('Enter new email:');
    await window.api.updateUser({ id, name, email });
    loadUsers();
}

// Delete User
async function deleteUser(id) {
    await window.api.deleteUser(id);
    loadUsers();
}

loadUsers();
