// Load Notes on Page Load
document.addEventListener("DOMContentLoaded", () => {
    fetchNotes();
});

// Function to Fetch Notes from Server
async function fetchNotes() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("You are not logged in!");
        window.location.href = "index.html";
        return;
    }

    try {
        const response = await fetch('http://localhost:3030/api/notes', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        if (response.ok) {
            displayNotes(data.notes);
        } else {
            alert(data.message || "Failed to fetch notes.");
        }
    } catch (error) {
        console.error("Error fetching notes:", error);
        alert("Error fetching notes. Please try again.");
    }
}

// Function to Add a Note
async function addNote() {
    const noteInput = document.getElementById("note-input");
    const noteText = noteInput.value.trim();

    if (!noteText) {
        alert("Please enter some text to add a note.");
        return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
        alert("You are not logged in!");
        window.location.href = "index.html";
        return;
    }

    try {
        const response = await fetch('http://localhost:3030/api/notes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ content: noteText })
        });

        const data = await response.json();
        if (response.ok) {
            alert("Note added successfully!");
            noteInput.value = ""; // Clear input field
            fetchNotes(); // Reload notes
        } else {
            alert(data.message || "Failed to add note.");
        }
    } catch (error) {
        console.error("Error adding note:", error);
        alert("Error adding note. Please try again.");
    }
}

// Function to Display Notes
function displayNotes(notes) {
    const notesList = document.getElementById("notes-list");
    notesList.innerHTML = ""; // Clear existing notes

    notes.forEach((note) => {
        const noteItem = document.createElement("div");
        noteItem.className = "note-item";

        noteItem.innerHTML = `
            <p>${note.content}</p>
            <span>${new Date(note.created_at).toLocaleString()}</span>
            <button onclick="deleteNote('${note.id}')" class="delete-btn">Delete</button>
        `;

        notesList.appendChild(noteItem);
    });
}


// Function to Delete a Note
async function deleteNote(noteId) {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("You are not logged in!");
        return;
    }

    try {
        const response = await fetch(`http://localhost:3030/api/notes/${noteId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            alert("Note deleted successfully!");
            fetchNotes(); // Reload notes after deletion
        } else {
            alert(data.message || "Failed to delete note.");
        }
    } catch (error) {
        console.error("Error deleting note:", error);
        alert("Error deleting note. Please try again.");
    }
}


// Logout Function
function logout() {
    localStorage.removeItem('token');
    window.location.href = "index.html";
}
