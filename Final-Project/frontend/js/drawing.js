const canvas = document.getElementById("drawingCanvas");
const ctx = canvas.getContext("2d");
let drawing = false;
let color = "#000000"; // Default color

// Set color picker
const colorPicker = document.getElementById("colorPicker");
colorPicker.addEventListener("input", (e) => {
    color = e.target.value;
});

// Start Drawing
canvas.addEventListener("mousedown", () => {
    drawing = true;
    ctx.beginPath();
});

// Draw on Mouse Movement
canvas.addEventListener("mousemove", (e) => {
    if (drawing) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
    }
});

// Stop Drawing
canvas.addEventListener("mouseup", () => {
    drawing = false;
});

// Clear Canvas
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Save Drawing
async function saveDrawing() {
    const dataURL = canvas.toDataURL();
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('http://localhost:3030/api/drawings', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ image: dataURL })
        });
        const result = await response.json();
        console.log(result);
        alert("Drawing saved successfully!");
    } catch (error) {
        console.error("Error saving drawing:", error);
    }
}

// Fetch Saved Drawings
async function fetchDrawings() {
    const token = localStorage.getItem('token'); // Retrieve the token

    if (!token) {
        alert("You must be logged in to view your drawings!");
        return;
    }

    try {
        const response = await fetch('http://localhost:3030/api/drawings', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json(); // Get the JSON response
        console.log(data); // Check the structure of the response
        console.log(typeof data);

        if (response.ok) {
            displayDrawings(data.results); // Pass only the results array to the display function
        } else {
            alert("Error: " + data.message);
        }
    } catch (error) {
        console.error("Error fetching drawings:", error);
        alert("Failed to fetch drawings. Please try again.");
    }
}




// Display the drawings in the saved-drawings section
function displayDrawings(drawings) {
    const savedImagesContainer = document.getElementById("saved-images");
    savedImagesContainer.innerHTML = ""; // Clear existing images

    drawings.forEach((drawing) => {
        const drawingDiv = document.createElement("div");
        drawingDiv.className = "drawing-item";

        drawingDiv.innerHTML = `
            <img src="${drawing.image}" alt="Saved Drawing" class="saved-drawing">
            <button class="delete-btn" onclick="deleteDrawing(${drawing.id})">Delete</button>
        `;

        savedImagesContainer.appendChild(drawingDiv);
    });
}

// Delete a drawing
async function deleteDrawing(drawingId) {
    const token = localStorage.getItem('token');

    if (!token) {
        alert("You must be logged in to delete a drawing!");
        return;
    }

    try {
        const response = await fetch(`http://localhost:3030/api/drawings/${drawingId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (response.ok) {
            alert("Drawing deleted successfully!");
            fetchDrawings(); // Refresh the drawings list
        } else {
            alert("Error: " + result.message);
        }
    } catch (error) {
        console.error("Error deleting drawing:", error);
        alert("Failed to delete drawing. Please try again.");
    }
}



// Logout Function
function logout() {
    localStorage.removeItem('token');
    window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", fetchDrawings);
