// Reads a password without showing it and prints the hash to put in .env. Nothing is saved.
import { createInterface } from "node:readline";
import { Writable } from "node:stream";
import { hashPassword } from "../src/lib/rules.ts";

process.stdout.write("Nouveau mot de passe admin (12 caractères au moins, saisie invisible) : ");
const hidden = new Writable({ write: (_chunk, _encoding, done) => done() });
const input = createInterface({ input: process.stdin, output: hidden, terminal: true });
input.question("", (password) => {
  input.close();
  if (password.length < 12) {
    console.error("\nTrop court : 12 caractères au moins.");
    process.exitCode = 1;
    return;
  }
  console.log(
    `\nÀ mettre dans .env et sur Netlify : ADMIN_PASSWORD_HASH=${hashPassword(password)}`,
  );
});
