import { runAllTests } from "./test-suite.js";

const results = runAllTests();
if (results.failed > 0) {
  console.error(`\n❌ Falharam ${results.failed} testes!`);
  process.exit(1);
} else {
  console.log(`\n✅ Todos os ${results.passed} testes passaram com sucesso!`);
  process.exit(0);
}
