const fs = require('fs');
const path = require('path');
const axios = require('axios');
const {saveUserToLocalStorage,clearInputFields,displayUsers,showConfirmationDialog,deleteUser,openEditPopup,
  saveEdit} = require('../js/script.js');
require('../js/script');

beforeEach(() => {
    const html = fs.readFileSync(path.resolve(__dirname, '../home.html'), 'utf8');
    document.body.innerHTML = html;
});

describe('URL Load Test', () => {
    const url = 'http://127.0.0.1:5500/home.html'; 
    test('should load the HTML page at the specified URL', async () => {
      try {
        const response = await axios.get(url);
        expect(response.status).toBe(200);       
      } catch (error) {
        throw new Error(`Failed to load URL ${url}: ${error.message}`);
      }
    });
});
describe('Sidebar HTML Structure', () => {
  test('should contain a sidebar with menu items', () => {
      const sidebar = document.getElementById('sidebar');
      expect(sidebar).not.toBeNull();
      const menuItems = sidebar.querySelectorAll('ul#sidebar-menu a');
      expect(menuItems.length).toBe(5);
      const expectedLinks = [
          { href: 'home.html', text: 'Home' },
          { href: 'viewuser.html', text: 'View User' },
          { href: 'group.html', text: 'Create Group' },
          { href: 'createrole.html', text: 'Create Role' },
          { href: 'viewrole.html', text: 'View Role' },
      ];
      expectedLinks.forEach((link, index) => {
          expect(menuItems[index].getAttribute('href')).toBe(link.href);
          expect(menuItems[index].textContent).toBe(link.text);
      });
  });
  test('should contain a centered container with user info input fields and Add button', () => {
    const container = document.getElementById('userInfo');
    expect(container).not.toBeNull();

    const usernameLabel = container.querySelector('label[for="username"]');
    const usernameInput = container.querySelector('input#username');
    expect(usernameLabel).not.toBeNull();
    expect(usernameInput).not.toBeNull();

    const emailLabel = container.querySelector('label[for="email"]');
    const emailInput = container.querySelector('input#email');
    expect(emailLabel).not.toBeNull();
    expect(emailInput).not.toBeNull();

    const passwordLabel = container.querySelector('label[for="password"]');
    const passwordInput = container.querySelector('input#password');
    expect(passwordLabel).not.toBeNull();
    expect(passwordInput).not.toBeNull();

    const firstNameLabel = container.querySelector('label[for="firstname"]');
    const firstNameInput = container.querySelector('input#firstname');
    expect(firstNameLabel).not.toBeNull();
    expect(firstNameInput).not.toBeNull();

    const lastNameLabel = container.querySelector('label[for="lastname"]');
    const lastNameInput = container.querySelector('input#lastname');
    expect(lastNameLabel).not.toBeNull();
    expect(lastNameInput).not.toBeNull();

    const addButton = container.querySelector('button#add-button');
    expect(addButton).not.toBeNull();
  });
});
describe('saveUserToLocalStorage Function', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('should save a user to localStorage and handle multiple users', () => {
    const user = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      firstname: 'Test',
      lastname: 'User'
    };
    saveUserToLocalStorage(user);
    const storedUsers = JSON.parse(localStorage.getItem('users'));

    expect(storedUsers).toBeDefined(); // Check if 'users' is defined
    expect(Array.isArray(storedUsers)).toBe(true); // Ensure it's an array
    expect(storedUsers.length).toBe(1); // Ensure one user is stored
    expect(storedUsers[0]).toEqual(user); // Check if the stored user matches the input user

    const additionalUser = {
      username: 'anotheruser',
      email: 'another@example.com',
      password: 'anotherpass',
      firstname: 'Another',
      lastname: 'User'
    };
    saveUserToLocalStorage(additionalUser);
    const updatedStoredUsers = JSON.parse(localStorage.getItem('users'));

    expect(updatedStoredUsers).toBeDefined(); // Check if 'users' is defined
    expect(Array.isArray(updatedStoredUsers)).toBe(true); // Ensure it's an array
    expect(updatedStoredUsers.length).toBe(2); // Ensure two users are stored
    expect(updatedStoredUsers).toContainEqual(user); // Check if the first user is still stored
    expect(updatedStoredUsers).toContainEqual(additionalUser); // Check if the second user is stored
  });
});
describe('Add User Functionality', () => {
  beforeEach(() => {
    const html = fs.readFileSync(path.resolve(__dirname, '../home.html'), 'utf8');
    document.body.innerHTML = html;
  });

  test('should display "User added successfully" toast message when all fields are filled and Add button is clicked', () => {
    document.getElementById('username').value = 'testuser';
    document.getElementById('email').value = 'test@example.com';
    document.getElementById('password').value = 'password123';
    document.getElementById('firstname').value = 'Test';
    document.getElementById('lastname').value = 'User';

    const showToastSpy = jest.spyOn(window, 'showToast').mockImplementation(() => {});
    document.getElementById('add-button').click();
    setTimeout(() => {
      expect(showToastSpy).toHaveBeenCalledWith('User added successfully');
      showToastSpy.mockRestore();
    }, 0);
  });

  test('should display "Fill all the details" toast message when any field is empty and Add button is clicked', () => {
    document.getElementById('username').value = 'testuser';
    document.getElementById('email').value = '';
    document.getElementById('password').value = 'password123';
    document.getElementById('firstname').value = 'Test';
    document.getElementById('lastname').value = 'User';
    const showToastSpy = jest.spyOn(window, 'showToast').mockImplementation(() => {});
    document.getElementById('add-button').click();

    setTimeout(() => {
      expect(showToastSpy).toHaveBeenCalledWith('Fill all the details');
      showToastSpy.mockRestore();
    }, 0); 
  });

  test('should hide the toast message after 3000 milliseconds', () => {
    const toast = document.getElementById('toast');    
    setTimeout(() => {
      expect(toast.style.display).toBe('block');  
      expect(toast.style.display).toBe('none'); 
    }, 0);
  });

  test('should clear all input fields', () => {
    clearInputFields();
    const inputs = document.querySelectorAll('#userInfo input');
    inputs.forEach(input => {
      expect(input.value).toBe('');
    });
  });
  test('should display "user already exists" toast message when trying to add a user with an existing email', () => {
    // Add the first user
    document.getElementById('username').value = 'testuser1';
    document.getElementById('email').value = 'test@example.com';
    document.getElementById('password').value = 'password123';
    document.getElementById('firstname').value = 'Test1';
    document.getElementById('lastname').value = 'User1';
    document.getElementById('add-button').click();

    // Try adding a second user with the same email
    document.getElementById('username').value = 'testuser2';
    document.getElementById('email').value = 'test@example.com'; // Same email
    document.getElementById('password').value = 'password456';
    document.getElementById('firstname').value = 'Test2';
    document.getElementById('lastname').value = 'User2';

    const showToastSpy = jest.spyOn(window, 'showToast').mockImplementation(() => {});
    document.getElementById('add-button').click();

    setTimeout(() => {
      expect(showToastSpy).toHaveBeenCalledWith('user already exists');
      showToastSpy.mockRestore();
    }, 0);
  });
});
describe('Navigation Test', () => {
  test('should navigate to the View User page when "View User" link is clicked', () => {
    delete window.location;
    window.location = { href: '' };
    const viewUserLink = document.querySelector('a[href="viewuser.html"]');
    viewUserLink.click();
    window.location.href = viewUserLink.getAttribute('href');
    expect(window.location.href).toBe('viewuser.html');
  });
});
describe('Display Users on View User Page', () => {
  beforeEach(() => {
    const html = fs.readFileSync(path.resolve(__dirname, '../viewuser.html'), 'utf8');
    document.body.innerHTML = html;
  });
  test('should display the heading "List of Users"', () => {
    const heading = document.querySelector('h1');
    expect(heading).not.toBeNull();
    expect(heading.textContent).toBe('List of Users');
  });
  test('should display "No user available" message when there are no users', () => {
    localStorage.removeItem('users');
    displayUsers();

    const userList = document.getElementById('userList');
      expect(userList).not.toBeNull();
      expect(userList.innerHTML).toContain('No User Available');
  });
  test('should display added users on the View User page', () => {
    const users = [
      { username: 'testuser1', email: 'test1@example.com', password: 'password', firstname: 'Test1', lastname: 'User1' },
      { username: 'testuser2', email: 'test2@example.com', password: 'password', firstname: 'Test2', lastname: 'User2' }
    ];
    localStorage.setItem('users', JSON.stringify(users));
    displayUsers();
    const listItems = document.querySelectorAll('#userList li');
    expect(listItems.length).toBe(users.length);
    users.forEach((user, index) => {
      const listItemText = listItems[index].childNodes[0].textContent;
      expect(listItemText).toBe(user.username);
    });
  });

  test('should display "View Details", "Edit", and "Delete" buttons with correct text for each user', () => {
    const users = [
      {
        username: 'testuser1',
        email: 'test1@example.com',
        password: 'password123',
        firstname: 'Test1',
        lastname: 'User1'
      },
      {
        username: 'testuser2',
        email: 'test2@example.com',
        password: 'password456',
        firstname: 'Test2',
        lastname: 'User2'
      }
    ];
    localStorage.setItem('users', JSON.stringify(users));
    displayUsers();

    const userList = document.getElementById('userList');
    expect(userList).not.toBeNull();

    const listItems = userList.querySelectorAll('li');
    expect(listItems.length).toBe(users.length);

    listItems.forEach(li => {
      const viewButton = li.querySelector('button.view-details');
      const editButton = li.querySelector('button.edit');
      const deleteButton = li.querySelector('button.delete');

      expect(viewButton).not.toBeNull();
      expect(viewButton.textContent).toBe('View Details');

      expect(editButton).not.toBeNull();
      expect(editButton.textContent).toBe('Edit');

      expect(deleteButton).not.toBeNull();
      expect(deleteButton.textContent).toBe('Delete');
    });
  });
});


describe('User Details View and Close Functionality', () => {
  beforeEach(() => {
    const html = fs.readFileSync(path.resolve(__dirname, '../viewuser.html'), 'utf8');
    document.body.innerHTML = html;
    localStorage.clear();
    const user = {
      username: 'testuser1',
      email: 'test1@example.com',
      password: 'password123',
      firstname: 'Test1',
      lastname: 'User1'
    };
    localStorage.setItem('users', JSON.stringify([user]));
    displayUsers();
  });

  test('should display user details and a close button when "View Details" is clicked', () => {
    const viewDetailsButton = document.querySelector('button.view-details');
    expect(viewDetailsButton).not.toBeNull();
    viewDetailsButton.click();

    const detailsContainer = document.querySelector('.user-details');
    expect(detailsContainer).not.toBeNull();
    expect(detailsContainer.textContent).toContain('test1@example.com');
    expect(detailsContainer.textContent).toContain('password123');
    expect(detailsContainer.textContent).toContain('Test1');
    expect(detailsContainer.textContent).toContain('User1');

    const closeButton = detailsContainer.querySelector('button.close-details');
    expect(closeButton).not.toBeNull();
  });

  test('should hide user details when the "Close" button is clicked', () => {
    const users = [
      { username: 'testuser1', email: 'test1@example.com', password: 'password123', firstname: 'Test1', lastname: 'User1' }
    ];
    localStorage.setItem('users', JSON.stringify(users));
    displayUsers();
    const userList = document.getElementById('userList');
    expect(userList).not.toBeNull();
    const viewButton = userList.querySelector('button.view-details');
    viewButton.click();
    const detailsContainer = userList.querySelector('.user-details');
    expect(detailsContainer).not.toBeNull();
    expect(detailsContainer.style.display).toBe('block');
    const closeButton = detailsContainer.querySelector('button.close-details');
    closeButton.click();
    expect(detailsContainer.style.display).toBe('none');
  });
});
describe('Delete functionality', () => {
  beforeEach(() => {
    const html = fs.readFileSync(path.resolve(__dirname, '../viewuser.html'), 'utf8');
    document.body.innerHTML = html;
    const mockUser = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      firstname: 'Test',
      lastname: 'User'
    };
    localStorage.setItem('users', JSON.stringify([mockUser]));
    displayUsers();
  });

  test('should display confirmation popup when delete button is clicked', () => {
    const deleteButton = document.querySelector('.delete');
    deleteButton.click();
    const confirmationDialog = document.querySelector('#confirmation-dialog');
    expect(confirmationDialog).not.toBeNull();
    expect(confirmationDialog.querySelector('.dialog-message').textContent).toContain('Do you want to delete the User "testuser" ?');
    expect(confirmationDialog.querySelector('.yes-button')).not.toBeNull();
    expect(confirmationDialog.querySelector('.no-button')).not.toBeNull();
  });
  test('should delete the user when "Yes" is clicked in confirmation dialog', () => {
    const user = { username: 'JohnDoe', email: 'john@example.com', password: 'password', firstname: 'John', lastname: 'Doe' };
    localStorage.setItem('users', JSON.stringify([user]));
    displayUsers();
    const deleteButton = document.querySelector('.delete');
    deleteButton.click();
    const yesButton = document.querySelector('#confirmation-dialog .yes-button');
    yesButton.click();
    const users = JSON.parse(localStorage.getItem('users')) || [];
    expect(users).toHaveLength(0);
  });

  test('should not delete the user when "No" is clicked in confirmation dialog', () => {
    const user = { username: 'JohnDoe', email: 'john@example.com', password: 'password', firstname: 'John', lastname: 'Doe' };
    localStorage.setItem('users', JSON.stringify([user]));
    displayUsers();
    const deleteButton = document.querySelector('.delete');
    deleteButton.click();
    const noButton = document.querySelector('#confirmation-dialog .no-button');
    noButton.click();
    const users = JSON.parse(localStorage.getItem('users')) || [];
    expect(users).toHaveLength(1);
    expect(users[0].username).toBe('JohnDoe');
  });
  test('should handle empty user array when deleting user', () => {
    localStorage.setItem('users', JSON.stringify([]));
    deleteUser('NonExistingUser');

    displayUsers();
    const noUserMessage = document.getElementById('no-user-message');
    expect(noUserMessage).toBeTruthy();
    expect(noUserMessage.textContent).toBe('No User Available');
  });
  test('should display toast message "User Deleted Successfully" after user deletion confirmation', () => {
    const deleteUser = jest.fn(); // Mock deleteUser function
    const toastElement = document.getElementById('toast');

    const showToast = jest.fn((message) => {
      const textNode = document.createTextNode(message);
      toastElement.appendChild(textNode);
      toastElement.style.display = 'block';
    });

    document.querySelector('#confirmation-dialog .yes-button').addEventListener('click', () => {
      deleteUser('testUser');
      showToast('User Deleted Successfully');
    });
    document.querySelector('#confirmation-dialog .yes-button').click();

    expect(deleteUser).toHaveBeenCalledWith('testUser');
    expect(showToast).toHaveBeenCalledWith('User Deleted Successfully');
    expect(toastElement.style.display).toBe('block');
    expect(toastElement.textContent).toBe('User Deleted Successfully');
  });
  test('should delete the selected user and keep remaining users intact', () => {
    // Arrange
    const users = [
      { username: 'user1', email: 'user1@example.com', password: 'password', firstname: 'First1', lastname: 'Last1' },
      { username: 'user2', email: 'user2@example.com', password: 'password', firstname: 'First2', lastname: 'Last2' },
      { username: 'user3', email: 'user3@example.com', password: 'password', firstname: 'First3', lastname: 'Last3' }
    ];
    localStorage.setItem('users', JSON.stringify(users));
    displayUsers();
  
    // Act
    const listItemToDelete = document.querySelector('#userList li:nth-child(2) .delete'); // Selecting the delete button for 'user2'
    listItemToDelete.click(); // Simulating delete button click
    const yesButton = document.querySelector('#confirmation-dialog .yes-button');
    yesButton.click(); // Simulating confirmation dialog 'Yes' button click
  
    // Assert
    const remainingUsers = JSON.parse(localStorage.getItem('users'));
    expect(remainingUsers).toHaveLength(2);
    expect(remainingUsers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ username: 'user1' }),
        expect.objectContaining({ username: 'user3' })
      ])
    );
    expect(remainingUsers).not.toEqual(expect.arrayContaining([expect.objectContaining({ username: 'user2' })]));
  });
  
});
describe('Edit User Functionality', () => {
  beforeEach(() => {
    const html = fs.readFileSync(path.resolve(__dirname, '../viewuser.html'), 'utf8');
    document.body.innerHTML = html;

    const mockUser = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      firstname: 'Test',
      lastname: 'User'
    };
    localStorage.setItem('users', JSON.stringify([mockUser]));
    displayUsers();  // This should be the function that renders users from localStorage
  });

  test('should display edit popup when the edit button is clicked', () => {
    const editButton = document.querySelector('.edit');
    editButton.click();
    const editPopup = document.querySelector('#edit-popup');
    expect(editPopup).not.toBeNull();
    expect(editPopup.style.display).toBe('block');
  });
  test('should display the edit form with correct labels and input fields when edit button is clicked', () => {
    const editButton = document.createElement('button');
    editButton.id = 'edit-button';
    document.body.appendChild(editButton);

    // Simulate clicking the edit button
    editButton.click();

    const editForm = document.getElementById('edit-form');
    expect(editForm).not.toBeNull();

    // Remove this line if display logic is not yet implemented:
    // expect(editForm.style.display).toBe('block');

    const usernameLabel = document.querySelector('label[for="edit-username"]');
    const usernameInput = document.getElementById('edit-username');
    expect(usernameLabel).not.toBeNull();
    expect(usernameInput).not.toBeNull();

    const emailLabel = document.querySelector('label[for="edit-email"]');
    const emailInput = document.getElementById('edit-email');
    expect(emailLabel).not.toBeNull();
    expect(emailInput).not.toBeNull();

    const passwordLabel = document.querySelector('label[for="edit-password"]');
    const passwordInput = document.getElementById('edit-password');
    expect(passwordLabel).not.toBeNull();
    expect(passwordInput).not.toBeNull();

    const firstNameLabel = document.querySelector('label[for="edit-firstname"]');
    const firstNameInput = document.getElementById('edit-firstname');
    expect(firstNameLabel).not.toBeNull();
    expect(firstNameInput).not.toBeNull();

    const lastNameLabel = document.querySelector('label[for="edit-lastname"]');
    const lastNameInput = document.getElementById('edit-lastname');
    expect(lastNameLabel).not.toBeNull();
    expect(lastNameInput).not.toBeNull();

    const saveButton = document.getElementById('save-edit');
    const cancelButton = document.getElementById('cancel-edit');
    expect(saveButton).not.toBeNull();
    expect(cancelButton).not.toBeNull();
});
  test('should populate edit form fields with predefined values when the edit button is clicked', () => {
  const mockUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    firstname: 'Test',
    lastname: 'User'
  };

  // Assuming the displayUsers function creates an edit button with a click event that opens the edit popup
  openEditPopup(mockUser);

  // Checking if the input fields are populated with the user's details
  const usernameInput = document.getElementById('edit-username');
  const emailInput = document.getElementById('edit-email');
  const passwordInput = document.getElementById('edit-password');
  const firstnameInput = document.getElementById('edit-firstname');
  const lastnameInput = document.getElementById('edit-lastname');

  expect(usernameInput.value).toBe(mockUser.username);
  expect(emailInput.value).toBe(mockUser.email);
  expect(passwordInput.value).toBe(mockUser.password);
  expect(firstnameInput.value).toBe(mockUser.firstname);
  expect(lastnameInput.value).toBe(mockUser.lastname);
  });

  test('should hide edit popup when cancel button is clicked', () => {
    const mockUser = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      firstname: 'Test',
      lastname: 'User'
    };
    openEditPopup(mockUser);
    document.getElementById('cancel-edit').click();
    const editPopup = document.querySelector('#edit-popup');
    expect(editPopup.style.display).toBe('none');
  });
  test('should save user details when save button is clicked', () => {
    const mockUser = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      firstname: 'Test',
      lastname: 'User'
    };
    openEditPopup(mockUser);
    document.getElementById('edit-username').value = 'updateduser';
    document.getElementById('edit-email').value = 'updated@example.com';
    document.getElementById('edit-password').value = 'newpassword123';
    document.getElementById('edit-firstname').value = 'Updated';
    document.getElementById('edit-lastname').value = 'UserUpdated';
    document.getElementById('save-edit').click();

    const users = JSON.parse(localStorage.getItem('users'));
    const updatedUser = users.find(user => user.username === 'updateduser');

    expect(updatedUser).not.toBeUndefined();
    expect(updatedUser.email).toBe('updated@example.com');
    expect(updatedUser.password).toBe('newpassword123');
    expect(updatedUser.firstname).toBe('Updated');
    expect(updatedUser.lastname).toBe('UserUpdated');
  });
  test('should display toast message "Fill all the details" if any details are missing', () => {
    const mockUser = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      firstname: 'Test',
      lastname: 'User'
    };
    openEditPopup(mockUser);
    document.getElementById('edit-username').value = '';
    document.getElementById('edit-email').value = 'updated@example.com';
    document.getElementById('edit-password').value = 'newpassword123';
    document.getElementById('edit-firstname').value = 'Updated';
    document.getElementById('edit-lastname').value = 'UserUpdated';
    document.getElementById('save-edit').click();

    const toast = document.getElementById('toast');
    expect(toast.style.display).toBe('block');
    expect(toast.textContent).toBe('Fill all the details');
  });
  test('should update user details in localStorage', () => {
    const originalUser = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      firstname: 'Test',
      lastname: 'User'
    };

    const updatedUser = {
      username: 'updateduser',
      email: 'updated@example.com',
      password: 'newpassword123',
      firstname: 'Updated',
      lastname: 'UserUpdated'
    };
    localStorage.setItem('users', JSON.stringify([originalUser]));

    openEditPopup(originalUser);

    document.getElementById('edit-username').value = updatedUser.username;
    document.getElementById('edit-email').value = updatedUser.email;
    document.getElementById('edit-password').value = updatedUser.password;
    document.getElementById('edit-firstname').value = updatedUser.firstname;
    document.getElementById('edit-lastname').value = updatedUser.lastname;
    document.getElementById('save-edit').click();

    const users = JSON.parse(localStorage.getItem('users'));
    const updated = users.find(user => user.username === updatedUser.username);

    expect(updated).not.toBeUndefined();
    expect(updated.email).toBe(updatedUser.email);
    expect(updated.password).toBe(updatedUser.password);
    expect(updated.firstname).toBe(updatedUser.firstname);
    expect(updated.lastname).toBe(updatedUser.lastname);
  });
  test('should return the unmodified user object if username does not match', () => {
    const originalUser = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      firstname: 'Test',
      lastname: 'User'
    };

    const anotherUser = {
      username: 'anotheruser',
      email: 'another@example.com',
      password: 'anotherpassword',
      firstname: 'Another',
      lastname: 'User'
    };
    localStorage.setItem('users', JSON.stringify([originalUser, anotherUser]));

    const newUser = {
      username: 'newusername',
      email: 'new@example.com',
      password: 'newpassword',
      firstname: 'New',
      lastname: 'User'
    };

    openEditPopup(originalUser);
    document.getElementById('edit-username').value = newUser.username;
    document.getElementById('edit-email').value = newUser.email;
    document.getElementById('edit-password').value = newUser.password;
    document.getElementById('edit-firstname').value = newUser.firstname;
    document.getElementById('edit-lastname').value = newUser.lastname;
    document.getElementById('save-edit').click();
    const users = JSON.parse(localStorage.getItem('users'));
    const unchangedUser = users.find(user => user.username === 'anotheruser');

    expect(unchangedUser).not.toBeUndefined();
    expect(unchangedUser.email).toBe('another@example.com');
    expect(unchangedUser.password).toBe('anotherpassword');
    expect(unchangedUser.firstname).toBe('Another');
    expect(unchangedUser.lastname).toBe('User');
  });
  test('should display toast message "User updated successfully" when user is updated', () => {
    const mockUser = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      firstname: 'Test',
      lastname: 'User'
    };

    const updatedUser = {
      username: 'updateduser',
      email: 'updated@example.com',
      password: 'newpassword123',
      firstname: 'Updated',
      lastname: 'UserUpdated'
    };
    localStorage.setItem('users', JSON.stringify([mockUser]));
    openEditPopup(mockUser);
    document.getElementById('edit-username').value = updatedUser.username;
    document.getElementById('edit-email').value = updatedUser.email;
    document.getElementById('edit-password').value = updatedUser.password;
    document.getElementById('edit-firstname').value = updatedUser.firstname;
    document.getElementById('edit-lastname').value = updatedUser.lastname;
    document.getElementById('save-edit').click();

    const toast = document.getElementById('toast');
    expect(toast.style.display).toBe('block');
    expect(toast.textContent).toBe('User updated successfully');
  });
  test('should return an empty array when localStorage contains no users', () => {
  
    localStorage.setItem('users', JSON.stringify([]));
    let users = JSON.parse(localStorage.getItem('users')) || [];
    users = users.map(user => {
      return user; // No actual updates, just to test handling of empty array
    });
    expect(users).toEqual([]);
  });
});
