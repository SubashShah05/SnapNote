import axios from "axios"

const BACKEND_URL = axios.create({
    baseURL: "http://localhost:4004/api/v1/noteapp/" // Make sure this matches your backend port
})

export default BACKEND_URL