// src/server.ts
import app from "./app";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(` Register page: http://localhost:${PORT}/register`);
       console.log(`Admin Login → http://localhost:${PORT}/admin/loginAdmin`);
    
});