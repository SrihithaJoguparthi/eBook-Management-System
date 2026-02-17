const API_URL = 'http://localhost:8080/api';

// Check authentication
const token = sessionStorage.getItem('token');
const role = sessionStorage.getItem('role');

if (!token) {
    window.location.href = 'login.html';
}

// Set axios default header
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// Display username
document.getElementById('username').textContent = sessionStorage.getItem('username');

// Load books on page load
loadAllBooks();

// Add event listener for My Uploads tab
document.getElementById('my-books-tab').addEventListener('click', function() {
    loadMyBooks();
});

function logout() {
    sessionStorage.clear();
    window.location.href = 'login.html';
}

async function loadAllBooks() {
    try {
        const response = await axios.get(`${API_URL}/ebooks`);
        displayBooks(response.data);
    } catch (error) {
        console.error('Error loading books:', error);
        showToast('Error loading books', 'error');
    }
}

async function loadMyBooks() {
    try {
        const response = await axios.get(`${API_URL}/ebooks/my-ebooks`);
        console.log('My books response:', response.data);
        displayMyBooks(response.data);
    } catch (error) {
        console.error('Error loading my books:', error);
        console.error('Error details:', error.response);
        showToast('Error loading your books', 'error');
    }
}

function displayBooks(books) {
    const booksList = document.getElementById('booksList');

    if (books.length === 0) {
        booksList.innerHTML = '<div class="col-12"><p class="text-center text-muted">No books found.</p></div>';
        return;
    }

    booksList.innerHTML = books.map(book => `
        <div class="col-md-4 mb-4">
            <div class="book-card">
                <div class="book-card-header">
                    <i class="bi bi-book" style="font-size: 3rem;"></i>
                </div>
                <div class="book-card-body">
                    <h5 class="book-title">${book.title}</h5>
                    <p class="book-author"><i class="bi bi-person"></i> ${book.author}</p>
                    <span class="book-category">${book.category}</span>
                    <p class="book-description">${book.description || 'No description available'}</p>
                    <small class="text-muted d-block mb-3">
                        <i class="bi bi-calendar"></i> ${new Date(book.uploadDate).toLocaleDateString()}
                    </small>
                    <div class="book-actions">
                        <button class="btn btn-sm btn-primary" onclick="downloadBook(${book.id}, '${book.title}')">
                            <i class="bi bi-download"></i> Download
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function displayMyBooks(books) {
    const myBooksList = document.getElementById('myBooksList');

    if (books.length === 0) {
        myBooksList.innerHTML = '<div class="col-12"><p class="text-center text-muted">You have not uploaded any books yet.</p></div>';
        return;
    }

    myBooksList.innerHTML = books.map(book => `
        <div class="col-md-4 mb-4">
            <div class="book-card">
                <div class="book-card-header">
                    <i class="bi bi-book" style="font-size: 3rem;"></i>
                </div>
                <div class="book-card-body">
                    <h5 class="book-title">${book.title}</h5>
                    <p class="book-author"><i class="bi bi-person"></i> ${book.author}</p>
                    <span class="book-category">${book.category}</span>
                    <p class="book-description">${book.description || 'No description available'}</p>
                    <small class="text-muted d-block mb-3">
                        <i class="bi bi-calendar"></i> ${new Date(book.uploadDate).toLocaleDateString()}
                    </small>
                    <div class="book-actions">
                        <button class="btn btn-sm btn-primary" onclick="downloadBook(${book.id}, '${book.title}')">
                            <i class="bi bi-download"></i> Download
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
        loadAllBooks();
        return;
    }

    try {
        const response = await axios.get(`${API_URL}/ebooks/search?keyword=${keyword}`);
        displayBooks(response.data);
    } catch (error) {
        console.error('Error searching books:', error);
        showToast('Error searching books', 'error');
    }
}

async function filterByCategory() {
    const category = document.getElementById('categoryFilter').value;

    if (!category) {
        loadAllBooks();
        return;
    }

    try {
        const response = await axios.get(`${API_URL}/ebooks/category/${category}`);
        displayBooks(response.data);
    } catch (error) {
        console.error('Error filtering books:', error);
        showToast('Error filtering books', 'error');
    }
}

async function downloadBook(id, title) {
    try {
        const response = await axios.get(`${API_URL}/ebooks/${id}/download`, {
            responseType: 'blob'
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${title}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();

        showToast('Download started!', 'success');
    } catch (error) {
        console.error('Error downloading book:', error);
        showToast('Error downloading book', 'error');
    }
}

async function deleteMyBook(id) {
    if (!confirm('Are you sure you want to delete this book?')) {
        return;
    }

    try {
        await axios.delete(`${API_URL}/ebooks/${id}`);
        showToast('Book deleted successfully!', 'success');
        loadMyBooks();
    } catch (error) {
        console.error('Error deleting book:', error);
        showToast('Error deleting book', 'error');
    }
}

// Upload form handler with PDF file support
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const fileInput = document.getElementById('file');
    const file = fileInput ? fileInput.files[0] : null;

    // Validate PDF file if file input exists
    if (fileInput && file) {
        if (file.type !== 'application/pdf') {
            showToast('Please select a valid PDF file', 'error');
            return;
        }
    }

    const formData = new FormData();
    formData.append('title', document.getElementById('title').value);
    formData.append('author', document.getElementById('author').value);
    formData.append('category', document.getElementById('category').value);
    formData.append('description', document.getElementById('description').value);
    
    // Append file if it exists
    if (file) {
        formData.append('file', file);
    }

    console.log('Uploading with file:', file ? file.name : 'No file');

    try {
        const response = await axios.post(`${API_URL}/ebooks`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        
        console.log('Upload response:', response);

        showToast('E-book uploaded successfully!', 'success');
        document.getElementById('uploadForm').reset();
        
        // Switch to My Uploads tab
        const myBooksTab = new bootstrap.Tab(document.getElementById('my-books-tab'));
        myBooksTab.show();
        loadMyBooks();
    } catch (error) {
        console.error('Error uploading ebook:', error);
        console.error('Error response:', error.response);
        const errorMessage = error.response?.data?.message || 'Error uploading ebook';
        showToast(errorMessage, 'error');
    }
});

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