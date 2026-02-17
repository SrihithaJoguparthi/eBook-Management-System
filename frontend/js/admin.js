const API_URL = 'http://localhost:8080/api';

// Check authentication
const token = sessionStorage.getItem('token');
const role = sessionStorage.getItem('role');

if (!token || role !== 'ADMIN') {
    window.location.href = 'login.html';
}

// Set axios default header
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// Display username
document.getElementById('adminUsername').textContent = sessionStorage.getItem('username');

// Load ebooks on page load
loadAllEbooks();

function logout() {
    sessionStorage.clear();
    window.location.href = 'login.html';
}

function showSection(section) {
    document.getElementById('ebooksSection').style.display = 'none';
    document.getElementById('usersSection').style.display = 'none';
    document.getElementById('uploadSection').style.display = 'none';

    // Remove active class from all nav items
    document.querySelectorAll('.list-group-item').forEach(item => {
        item.classList.remove('active');
    });

    // Show selected section
    if (section === 'ebooks') {
        document.getElementById('ebooksSection').style.display = 'block';
        loadAllEbooks();
        // Add active class to ebooks nav item
        document.querySelector('[onclick*="ebooks"]')?.classList.add('active');
    } else if (section === 'users') {
        document.getElementById('usersSection').style.display = 'block';
        loadAllUsers();
        // Add active class to users nav item
        document.querySelector('[onclick*="users"]')?.classList.add('active');
    } else if (section === 'upload') {
        document.getElementById('uploadSection').style.display = 'block';
        // Add active class to upload nav item
        document.querySelector('[onclick*="upload"]')?.classList.add('active');
    }
}

async function loadAllEbooks() {
    try {
        const response = await axios.get(`${API_URL}/ebooks`);
        displayEbooks(response.data);
    } catch (error) {
        console.error('Error loading ebooks:', error);
        showToast('Error loading ebooks', 'error');
    }
}

function displayEbooks(ebooks) {
    const ebooksList = document.getElementById('ebooksList');

    if (ebooks.length === 0) {
        ebooksList.innerHTML = '<div class="col-12"><p class="text-center text-muted">No ebooks found.</p></div>';
        return;
    }

    ebooksList.innerHTML = ebooks.map(ebook => `
        <div class="col-md-4 mb-4">
            <div class="book-card">
                <div class="book-card-header">
                    <i class="bi bi-book" style="font-size: 3rem;"></i>
                </div>
                <div class="book-card-body">
                    <h5 class="book-title">${ebook.title}</h5>
                    <p class="book-author"><i class="bi bi-person"></i> ${ebook.author}</p>
                    <span class="book-category">${ebook.category}</span>
                    <p class="book-description">${ebook.description || 'No description available'}</p>
                    <div class="book-actions">
                        <button class="btn btn-sm btn-primary" onclick="editEbook(${ebook.id})">
                            <i class="bi bi-pencil"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteEbook(${ebook.id})">
                            <i class="bi bi-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

async function searchBooks() {
    const keyword = document.getElementById('searchInput').value;

    if (!keyword) {
        loadAllEbooks();
        return;
    }

    try {
        const response = await axios.get(`${API_URL}/ebooks/search?keyword=${keyword}`);
        displayEbooks(response.data);
    } catch (error) {
        console.error('Error searching ebooks:', error);
        showToast('Error searching ebooks', 'error');
    }
}

async function editEbook(id) {
    try {
        const response = await axios.get(`${API_URL}/ebooks/${id}`);
        const ebook = response.data;

        document.getElementById('editId').value = ebook.id;
        document.getElementById('editTitle').value = ebook.title;
        document.getElementById('editAuthor').value = ebook.author;
        document.getElementById('editCategory').value = ebook.category;
        document.getElementById('editDescription').value = ebook.description || '';

        const modal = new bootstrap.Modal(document.getElementById('editModal'));
        modal.show();
    } catch (error) {
        console.error('Error loading ebook:', error);
        showToast('Error loading ebook details', 'error');
    }
}

async function updateEbook() {
    const id = document.getElementById('editId').value;
    const formData = new FormData();

    formData.append('title', document.getElementById('editTitle').value);
    formData.append('author', document.getElementById('editAuthor').value);
    formData.append('category', document.getElementById('editCategory').value);
    formData.append('description', document.getElementById('editDescription').value);

    try {
        await axios.put(`${API_URL}/ebooks/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
        showToast('E-book updated successfully!', 'success');
        loadAllEbooks();
    } catch (error) {
        console.error('Error updating ebook:', error);
        showToast('Error updating ebook', 'error');
    }
}

async function deleteEbook(id) {
    if (!confirm('Are you sure you want to delete this e-book?')) {
        return;
    }

    try {
        await axios.delete(`${API_URL}/ebooks/${id}`);
        showToast('E-book deleted successfully!', 'success');
        loadAllEbooks();
    } catch (error) {
        console.error('Error deleting ebook:', error);
        showToast('Error deleting ebook', 'error');
    }
}

// Upload form handler
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const fileInput = document.getElementById('file');
    const file = fileInput.files[0];

    if (!file) {
        showToast('Please select a PDF file', 'error');
        return;
    }

    if (file.type !== 'application/pdf') {
        showToast('Please select a valid PDF file', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('title', document.getElementById('title').value);
    formData.append('author', document.getElementById('author').value);
    formData.append('category', document.getElementById('category').value);
    formData.append('description', document.getElementById('description').value);
    formData.append('file', file);

    try {
        await axios.post(`${API_URL}/ebooks`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        showToast('E-book uploaded successfully!', 'success');
        document.getElementById('uploadForm').reset();
        showSection('ebooks');
    } catch (error) {
        console.error('Error uploading ebook:', error);
        showToast('Error uploading ebook', 'error');
    }
});

async function loadAllUsers() {
    try {
        const response = await axios.get(`${API_URL}/users`);
        displayUsers(response.data);
    } catch (error) {
        console.error('Error loading users:', error);
        showToast('Error loading users', 'error');
    }
}

function displayUsers(users) {
    const usersList = document.getElementById('usersList');

    if (users.length === 0) {
        usersList.innerHTML = '<p class="text-center text-muted">No users found.</p>';
        return;
    }

    usersList.innerHTML = `
        <div class="table-responsive">
            <table class="table table-hover user-table">
                <thead class="table-light">
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Created At</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.map(user => `
                        <tr>
                            <td>${user.id}</td>
                            <td><i class="bi bi-person-circle"></i> ${user.username}</td>
                            <td>${user.email}</td>
                            <td><span class="badge bg-${user.role === 'ADMIN' ? 'danger' : 'primary'}">${user.role}</span></td>
                            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                            <td>
                                <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})" ${user.role === 'ADMIN' ? 'disabled' : ''}>
                                    <i class="bi bi-trash"></i> Delete
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function deleteUser(id) {
    if (!confirm('Are you sure you want to delete this user?')) {
        return;
    }

    try {
        await axios.delete(`${API_URL}/users/${id}`);
        showToast('User deleted successfully!', 'success');
        loadAllUsers();
    } catch (error) {
        console.error('Error deleting user:', error);
        showToast('Error deleting user', 'error');
    }
}

function showToast(message, type) {
    const alertClass = type === 'success' ? 'alert-success' : 'alert-danger';
    const toastHtml = `
        <div class="alert ${alertClass} alert-dismissible fade show position-fixed top-0 end-0 m-3" role="alert" style="z-index: 9999;">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', toastHtml);

    setTimeout(() => {
        const alert = document.querySelector('.alert');
        if (alert) alert.remove();
    }, 3000);
}