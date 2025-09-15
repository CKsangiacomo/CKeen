// Minimal façade to be replaced in PR#3/PR#4 with actual DB/RPC calls.
export async function sql(strings: TemplateStringsArray, ...values: any[]) {
  throw new Error('db_not_initialized'); // Intentionally not used in PR#1
}


