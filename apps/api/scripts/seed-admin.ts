/**
 * Cree ou met a jour un compte administrateur.
 *
 *   npm run seed:admin -- --email vous@exemple.dz --name "Amiir"
 *
 * Le mot de passe est demande au clavier, jamais passe en argument : un
 * argument de ligne de commande finit dans l'historique du shell.
 */
import { createInterface } from 'node:readline/promises';
import { parseArgs } from 'node:util';
import argon2 from 'argon2';
import { sqlClient } from '../src/db/client.js';

const { values } = parseArgs({
  options: {
    email: { type: 'string' },
    name: { type: 'string' },
  },
});

if (!values.email || !values.name) {
  console.error('Usage : --email <courriel> --name <nom affiche>');
  process.exit(1);
}

const rl = createInterface({ input: process.stdin, output: process.stdout });
const password = await rl.question('Mot de passe (12 caracteres minimum) : ');
const confirm = await rl.question('Confirmation : ');
rl.close();

if (password.length < 12) {
  console.error('Mot de passe trop court.');
  process.exit(1);
}
if (password !== confirm) {
  console.error('Les deux saisies different.');
  process.exit(1);
}

const hash = await argon2.hash(password, { type: argon2.argon2id });
const email = values.email.toLowerCase();

await sqlClient`
  INSERT INTO users (email, password_hash, display_name, role, organizer_status)
  VALUES (${email}, ${hash}, ${values.name}, 'admin', 'approved')
  ON CONFLICT (email) DO UPDATE
    SET password_hash = EXCLUDED.password_hash,
        display_name  = EXCLUDED.display_name,
        role          = 'admin',
        organizer_status = 'approved'`;

console.log(`Compte administrateur ${email} enregistre.`);
await sqlClient.end();
