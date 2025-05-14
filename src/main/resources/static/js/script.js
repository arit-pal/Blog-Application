// src/main/resources/static/js/script.js

// --- Configuration & State ---
const API_BASE_URL = 'http://localhost:8080/blogs';
let currentUser = null; // Stores username and role after login
let currentAuthHeader = null; // Stores the 'Basic ...' header after login

// State for User View (single blog display)
let currentUserBlogId = 1; // Start with blog ID 1

// --- DOM Elements ---
const welcomeSection = document.getElementById('welcome-section');
const welcomeMessageElement = document.getElementById('welcome-message');
const showLoginButton = document.getElementById('show-login-button');

const loginSection = document.getElementById('login-section');
const loginForm = document.getElementById('login-form');
const loginUsernameInput = document.getElementById('username');
const loginPasswordInput = document.getElementById('password');
const loginErrorElement = document.getElementById('login-error');

const userViewSection = document.getElementById('user-view-section');
const userBlogDisplayDiv = document.getElementById('user-blog-display');
const nextBlogButton = document.getElementById('next-blog-button');
const noMoreBlogsMessage = document.getElementById('no-more-blogs');
const logoutButtonUser = document.getElementById('logout-button-user');


const adminViewSection = document.getElementById('admin-view-section');
const adminMessageArea = document.getElementById('message-area');
const adminCreateBlogForm = document.getElementById('admin-create-blog-form');
const adminBlogsListDiv = document.getElementById('admin-blogs-list');
const adminEditBlogSection = document.getElementById('admin-edit-blog-section');
const adminEditBlogForm = document.getElementById('admin-edit-blog-form');
const adminCancelEditButton = document.getElementById('admin-cancel-edit');
const logoutButtonAdmin = document.getElementById('logout-button-admin');


// --- View Management ---

function showSection(section) {
    // Hide all main sections
    welcomeSection.style.display = 'none';
    loginSection.style.display = 'none';
    userViewSection.style.display = 'none';
    adminViewSection.style.display = 'none';

    // Show the requested section
    section.style.display = 'block';
}

function showWelcomeView() {
    showSection(welcomeSection);
    fetchWelcomeMessage(); // Fetch the welcome message when showing this view
}

function showLoginView() {
    showSection(loginSection);
     loginErrorElement.style.display = 'none'; // Hide previous errors
}

function showUserView() {
    showSection(userViewSection);
    currentUserBlogId = 1; // Reset to first blog on entering user view
    fetchSingleBlogForUser(currentUserBlogId); // Load the first blog
}

function showAdminView() {
    showSection(adminViewSection);
    adminEditBlogSection.style.display = 'none'; // Ensure edit form is hidden initially
    fetchBlogsForAdmin(); // Load all blogs for the admin list
}

// --- API Helpers ---

// Helper to perform fetch with Basic Auth
async function fetchWithAuth(url, options = {}, authHeader = currentAuthHeader) {
    const headers = { ...options.headers };
    if (authHeader) {
        headers['Authorization'] = authHeader;
    }
    const response = await fetch(url, { ...options, headers });

    // Check for authentication/authorization failures specifically
     if (response.status === 401 || response.status === 403) {
         // Clear state and show login if unauthorized, might indicate expired or invalid auth
         currentUser = null;
         currentAuthHeader = null;
         displayMessage('Session expired or unauthorized. Please log in again.', true, adminMessageArea); // Use appropriate message area
         showLoginView(); // Redirect to login
         throw new Error('Unauthorized or Forbidden'); // Propagate error
     }

    return response;
}

function displayAdminMessage(message, isError = false) {
    adminMessageArea.textContent = message;
    adminMessageArea.className = isError ? 'error' : 'message';
    adminMessageArea.style.display = 'block';
    setTimeout(() => {
        adminMessageArea.style.display = 'none';
    }, 5000);
}

// --- API Calls ---

// GET Welcome Message (No Auth Required)
async function fetchWelcomeMessage() {
    try {
        // No authHeader needed for this endpoint
        const response = await fetch(`${API_BASE_URL}/welcome`);
        if (!response.ok) {
            welcomeMessageElement.textContent = `Error fetching welcome message: ${response.status} ${response.statusText}`;
            return;
        }
        const message = await response.text(); // Assuming it returns plain text
        welcomeMessageElement.textContent = message;
    } catch (error) {
        console.error('Error fetching welcome message:', error);
        welcomeMessageElement.textContent = 'Network error fetching welcome message.';
    }
}


// Authenticate User (Logic happens in frontend, then store credentials/header)
// After successful 'login' (validating credentials against an authenticated endpoint),
// we set the global state and show the appropriate view.
async function performLogin(username, password) {
    const basicAuthHeader = 'Basic ' + btoa(username + ':' + password);

    try {
        // Attempt to access a basic authenticated endpoint to validate credentials.
        // Accessing /blogs/all is a good test - requires auth and then ADMIN role.
        // If the user is USER, this will result in 403, but 401 means bad credentials.
        // A better approach might be a dedicated /userinfo endpoint that just requires AUTHENTICATED.
        // For this example, we'll test against /blogs/all and interpret the result.
        const response = await fetch(`${API_BASE_URL}/all`, {
             method: 'GET',
             headers: {
                 'Authorization': basicAuthHeader
             }
        });

        if (response.status === 401) {
            // Authentication failed (invalid username/password)
            loginErrorElement.textContent = 'Invalid username or password.';
            loginErrorElement.style.display = 'block';
            return false;
        }

        // If status is not 401, credentials were valid.
        // Now determine role by fetching user details or checking a protected endpoint response.
        // Since we don't have a dedicated userinfo endpoint that just returns roles,
        // we'll just assume based on which credentials were used for simplicity in this demo.
        // In a real app, you'd get user details and roles from the backend after login.

        // For this demo, let's just determine role based on username (since we know the in-memory users)
        // A real application should NOT determine roles on the frontend like this.
        let role = 'USER'; // Default
        if (username === 'aritpal') { // Assuming 'aritpal' is always ADMIN
            role = 'ADMIN';
        } else if (username === 'momo') { // Assuming 'momo' is always USER
             role = 'USER';
        } else {
             // Handle other possible authenticated users if needed, or refine the login check
             // For this demo, we only support aritpal and momo.
             loginErrorElement.textContent = 'Unexpected user role after authentication.';
             loginErrorElement.style.display = 'block';
             return false;
        }


        // Authentication successful and role determined
        currentUser = { username: username, role: role };
        currentAuthHeader = basicAuthHeader; // Store the header for future requests

        // Redirect to the appropriate view based on role
        if (currentUser.role === 'ADMIN') {
            showAdminView();
        } else { // Must be USER role
            showUserView();
        }

        loginErrorElement.style.display = 'none'; // Hide errors
        return true;

    } catch (error) {
        console.error('Login process error:', error);
         if (error.message !== 'Unauthorized or Forbidden') { // Avoid showing generic error if it was 401/403
             loginErrorElement.textContent = 'Network error during login.';
             loginErrorElement.style.display = 'block';
         }
        return false;
    }
}


// --- User View Specific API Calls & Logic ---

// GET single blog by ID (Accessible by USER or ADMIN)
async function fetchSingleBlogForUser(id) {
    userBlogDisplayDiv.innerHTML = '<p>Loading blog...</p>'; // Loading state
    nextBlogButton.style.display = 'none';
    noMoreBlogsMessage.style.display = 'none';

    try {
        // Use currentAuthHeader (will be USER or ADMIN Basic Auth)
        const response = await fetchWithAuth(`${API_BASE_URL}/${id}`, {
             method: 'GET'
        });

        if (response.status === 404) {
            // No more blogs found
             userBlogDisplayDiv.innerHTML = ''; // Clear display
             noMoreBlogsMessage.style.display = 'block'; // Show "no more" message
             nextBlogButton.style.display = 'none'; // Hide next button
             return; // Stop here
         }

        if (!response.ok) {
            // Handle other errors (e.g., 401/403 handled by fetchWithAuth)
             userBlogDisplayDiv.innerHTML = '<p class="error">Error loading blog.</p>';
             nextBlogButton.style.display = 'none';
             console.error('Failed to fetch blog for user:', response.status, response.statusText);
            return;
        }

        const blog = await response.json();
        renderSingleBlogForUser(blog);
        nextBlogButton.style.display = 'block'; // Show next button if a blog was found


    } catch (error) {
        console.error('Network error fetching blog for user:', error);
        userBlogDisplayDiv.innerHTML = '<p class="error">Network error loading blog.</p>';
        nextBlogButton.style.display = 'none';
    }
}

function renderSingleBlogForUser(blog) {
     userBlogDisplayDiv.innerHTML = `
         <div class="blog-item">
             <h4>Blog ID: ${blog.blogId}</h4>
             <h3>${blog.blogTitle}</h3>
             <p><strong>Author:</strong> ${blog.blogAuthor}</p>
             <p>${blog.blogContent}</p>
             <p><small>Created: ${new Date(blog.createdDate).toLocaleString()}</small></p>
         </div>
     `;
}

// --- Admin View Specific API Calls & Logic ---

// GET all blogs for Admin list (Accessible by ADMIN)
async function fetchBlogsForAdmin() {
     adminBlogsListDiv.innerHTML = '<p>Loading blogs...</p>'; // Loading state
    try {
        // Use currentAuthHeader (must be ADMIN Basic Auth)
         const response = await fetchWithAuth(`${API_BASE_URL}/all`, {
             method: 'GET'
         });

         if (!response.ok) {
              adminBlogsListDiv.innerHTML = '<p class="error">Failed to load blogs for Admin.</p>';
              // Specific error message handled by fetchWithAuth
             return;
         }

         const blogs = await response.json();
         renderBlogListForAdmin(blogs);

     } catch (error) {
         console.error('Network error fetching blogs for admin:', error);
         adminBlogsListDiv.innerHTML = '<p class="error">Network error loading blogs.</p>';
     }
}

function renderBlogListForAdmin(blogs) {
     adminBlogsListDiv.innerHTML = ''; // Clear previous list
     if (blogs.length === 0) {
         adminBlogsListDiv.innerHTML = '<p>No blogs found.</p>';
         return;
     }
     blogs.forEach(blog => {
         const blogDiv = document.createElement('div');
         blogDiv.className = 'admin-blog-item';
         blogDiv.innerHTML = `
             <h4>ID: ${blog.blogId}</h4>
             <h4>${blog.blogTitle}</h4>
             <p><strong>Author:</strong> ${blog.blogAuthor}</p>
             <p>${blog.blogContent.substring(0, 150)}...</p> <p><small>Created: ${new Date(blog.createdDate).toLocaleString()}</small></p>
             <button onclick="viewBlogForAdmin(${blog.blogId})">View Full</button>
             <button onclick="showEditFormAdmin(${blog.blogId})">Edit</button>
             <button onclick="deleteBlogAdmin(${blog.blogId})">Delete</button>
         `;
         adminBlogsListDiv.appendChild(blogDiv);
     });
}

// GET single blog for Admin (viewing full details)
async function viewBlogForAdmin(id) {
     try {
         // Use currentAuthHeader (must be ADMIN Basic Auth)
         const response = await fetchWithAuth(`${API_BASE_URL}/${id}`, {
              method: 'GET'
         });

         if (!response.ok) {
              displayAdminMessage(`Error viewing blog ${id}.`, true); // Specific message handled by fetchWithAuth
             return;
         }

         const blog = await response.json();
         // Display in a modal or a dedicated area? For simplicity, let's just alert or log
         alert(`Blog ID: ${blog.blogId}\nTitle: ${blog.blogTitle}\nAuthor: ${blog.blogAuthor}\nContent:\n${blog.blogContent}\nCreated: ${new Date(blog.createdDate).toLocaleString()}`);
         console.log('Full Blog Details:', blog); // Also log to console
     } catch (error) {
         console.error('Network error viewing blog for admin:', error);
         displayAdminMessage('Network error viewing blog.', true);
     }
}


// POST new blog (Admin only)
async function createBlogAdmin(blogData) {
    try {
        // Use currentAuthHeader (must be ADMIN Basic Auth)
        const response = await fetchWithAuth(`${API_BASE_URL}/post`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(blogData)
        });

        if (!response.ok) {
             displayAdminMessage(`Error creating blog: ${response.status} ${response.statusText}`, true); // Specific handled by fetchWithAuth
             return false; // Indicate failure
         }

        const success = await response.json(); // Assuming backend returns boolean true/false

        if (success) {
            displayAdminMessage('Blog created successfully!');
            adminCreateBlogForm.reset(); // Clear form
            fetchBlogsForAdmin(); // Refresh list
            return true;
        } else {
             displayAdminMessage('Blog creation failed on the backend.', true);
             return false;
        }

    } catch (error) {
        console.error('Error creating blog:', error);
        displayAdminMessage('Network error while creating blog.', true);
        return false;
    }
}

// Show Edit Form and populate (Admin only)
async function showEditFormAdmin(id) {
    try {
        // Fetch blog data first
         const response = await fetchWithAuth(`${API_BASE_URL}/${id}`, {
              method: 'GET' // Use GET /blogs/{id}
         });

          if (!response.ok) {
               displayAdminMessage(`Error fetching blog ${id} for editing.`, true); // Specific handled by fetchWithAuth
               return;
           }

           const blog = await response.json();

           // Populate the edit form
           document.getElementById('admin-edit-blog-id').value = blog.blogId;
           document.getElementById('admin-edit-author').value = blog.blogAuthor;
           document.getElementById('admin-edit-title').value = blog.blogTitle;
           document.getElementById('admin-edit-content').value = blog.blogContent;

           adminEditBlogSection.style.display = 'block'; // Show the edit form section
           adminBlogsListDiv.style.display = 'none'; // Hide the blog list

       } catch (error) {
           console.error('Network error fetching blog for editing:', error);
           displayAdminMessage('Network error while fetching blog for editing.', true);
       }
}

// Hide Edit Form and show list (Admin only)
function hideEditFormAdmin() {
    adminEditBlogSection.style.display = 'none';
    adminBlogsListDiv.style.display = 'block'; // Show the list again
    fetchBlogsForAdmin(); // Refresh the list
}

// PUT update blog (Admin only)
async function updateBlogAdmin(id, blogData) {
    try {
        // Your backend PUT /blogs/update expects the complete Blog object including ID
        const blogDataWithId = { ...blogData, blogId: id };

         // Use currentAuthHeader (must be ADMIN Basic Auth)
        const response = await fetchWithAuth(`${API_BASE_URL}/update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(blogDataWithId)
        });

        if (!response.ok) {
            displayAdminMessage(`Error updating blog ${id}: ${response.status} ${response.statusText}`, true); // Specific handled by fetchWithAuth
             return false; // Indicate failure
         }

        const success = await response.json(); // Assuming backend returns boolean true/false

        if (success) {
            displayAdminMessage(`Blog with ID ${id} updated successfully!`);
            hideEditFormAdmin(); // Hide form and refresh list
            return true;
        } else {
            displayAdminMessage(`Blog update failed on the backend for ID ${id}.`, true);
            return false;
        }

    } catch (error) {
        console.error('Error updating blog:', error);
        displayAdminMessage('Network error while updating blog.', true);
        return false;
    }
}

// DELETE blog by ID (Admin only)
async function deleteBlogAdmin(id) {
    if (!confirm(`Are you sure you want to delete blog with ID ${id}?`)) {
        return; // User cancelled
    }

    try {
         // Use currentAuthHeader (must be ADMIN Basic Auth)
        const response = await fetchWithAuth(`${API_BASE_URL}/${id}`, {
            method: 'DELETE'
            // No body needed for DELETE by ID
        });

        if (!response.ok) {
             displayAdminMessage(`Error deleting blog ${id}: ${response.status} ${response.statusText}`, true); // Specific handled by fetchWithAuth
             return false; // Indicate failure
         }

        const success = await response.json(); // Assuming backend returns boolean true/false

        if (success) {
            displayAdminMessage(`Blog with ID ${id} deleted successfully!`);
            fetchBlogsForAdmin(); // Refresh list
            return true;
        } else {
            displayAdminMessage(`Blog deletion failed on the backend for ID ${id}.`, true);
            return false;
        }

    } catch (error) {
        console.error('Error deleting blog:', error);
        displayAdminMessage('Network error while deleting blog.', true);
        return false;
    }
}

// --- Logout ---
function performLogout() {
     currentUser = null;
     currentAuthHeader = null;
     // Note: For Basic Auth, 'logging out' on the client just means clearing credentials.
     // The browser might cache credentials for the session. A full page reload
     // or clearing browser data is often needed for a true Basic Auth logout effect.
     // For this demo, clearing variables is sufficient for the JS app state.
     showWelcomeView(); // Go back to welcome screen
     displayMessage('Logged out successfully.', false, welcomeMessageElement); // Show message on welcome
}


// --- Event Listeners ---

// Initial button to show login form
showLoginButton.addEventListener('click', showLoginView);

// Handle Login Form submission
loginForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default browser form submission

    const username = loginUsernameInput.value;
    const password = loginPasswordInput.value;

    await performLogin(username, password); // performLogin handles showing the right view
});

// Handle User View 'Next' button
nextBlogButton.addEventListener('click', () => {
    currentUserBlogId++; // Increment blog ID
    fetchSingleBlogForUser(currentUserBlogId); // Fetch and display the next blog
});

// Handle Admin Create Form submission
adminCreateBlogForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission

    const blogData = {
        blogAuthor: document.getElementById('admin-create-author').value,
        blogTitle: document.getElementById('admin-create-title').value,
        blogContent: document.getElementById('admin-create-content').value
    };

    const success = await createBlogAdmin(blogData);
    if (success) {
        adminCreateBlogForm.reset(); // Clear the form on success
    }
});

// Handle Admin Edit Form submission
adminEditBlogForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission

    const blogId = document.getElementById('admin-edit-blog-id').value;
    const blogData = {
        blogAuthor: document.getElementById('admin-edit-author').value,
        blogTitle: document.getElementById('admin-edit-title').value,
        blogContent: document.getElementById('admin-edit-content').value
    };

    await updateBlogAdmin(blogId, blogData); // updateBlogAdmin handles hiding form and refreshing list
});

// Handle Admin Cancel Edit button
adminCancelEditButton.addEventListener('click', () => {
    hideEditFormAdmin(); // Hide edit form and refresh list
});

// Handle Logout Buttons
logoutButtonUser.addEventListener('click', performLogout);
logoutButtonAdmin.addEventListener('click', performLogout);


// --- Initialization ---

// Show the welcome view when the page loads
document.addEventListener('DOMContentLoaded', () => {
    showWelcomeView();
});
