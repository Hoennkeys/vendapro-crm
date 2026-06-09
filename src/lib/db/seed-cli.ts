import { seedDatabaseIfEmpty } from "./seed.server";

const seeded = await seedDatabaseIfEmpty();
console.log(seeded ? "Banco seedado com sucesso." : "Banco já continha dados — seed ignorado.");
