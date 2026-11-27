// Prints a new admin password and the hash to put in .env. Nothing is saved.
import { randomBytes } from "node:crypto";
import { hashPassword } from "../src/lib/rules.ts";

const password = randomBytes(15).toString("base64url");
console.log(`Mot de passe (à garder dans un gestionnaire de mots de passe) : ${password}`);
console.log(`À mettre dans .env et sur Netlify : ADMIN_PASSWORD_HASH=${hashPassword(password)}`);
