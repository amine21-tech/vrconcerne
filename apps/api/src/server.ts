import { buildApp } from './app.js';
import { checkDatabase, closeDatabase } from './db/client.js';
import { env } from './env.js';

const app = await buildApp();

try {
  await checkDatabase();
  app.log.info('Base de donnees prete.');
} catch (error) {
  app.log.error({ err: error }, "La base de donnees n'est pas joignable.");
  process.exit(1);
}

try {
  await app.listen({ port: env.PORT, host: env.HOST });
} catch (error) {
  app.log.error({ err: error }, 'Demarrage impossible.');
  process.exit(1);
}

/** Arret propre : les requetes en cours se terminent avant de fermer la base. */
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => {
    app.log.info(`${signal} recu, extinction en cours...`);
    void (async () => {
      try {
        await app.close();
        await closeDatabase();
        process.exit(0);
      } catch (error) {
        app.log.error({ err: error }, 'Extinction incomplete.');
        process.exit(1);
      }
    })();
  });
}
