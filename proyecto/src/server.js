import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();

app.listen(process.env.PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${process.env.PORT}`);
  console.log(`Docs: http://localhost:${process.env.PORT}/api-docs`);
});
