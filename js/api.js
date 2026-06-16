const API_BASE = 'http://localhost/lab-activity-10-Farah-Nabila-bit/mycampus-cafe-jwt-api/public/api';

const API_URL = `${API_BASE}/menu`;

function getToken() {
    return localStorage.getItem("mycampus_token");
}

function setToken(token) {
    localStorage.setItem("mycampus_token", token);
}

function clearToken() {
    localStorage.removeItem("mycampus_token");
}

function authHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + getToken()
    };
}

function publicHeaders() {
    return {
        "Content-Type": "application/json"
    };
}

