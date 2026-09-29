// Deliberately no credentials: verify the same public records guests read.
async function main() {
  for (const id of ['vwFZcYay5s0HkxCQavuS', '48ZSqEVZ4vu4z8Sxgci9']) {
    const url = new URL(`https://firestore.googleapis.com/v1/projects/druvio/databases/default/documents/publicProjects/${id}`);
    for (const field of ['projectName', 'startingPrice', 'layoutPolygon']) url.searchParams.append('mask.fieldPaths', field);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Anonymous read failed: ${response.status}`);
    const { fields } = await response.json();
    const result = {
      id, name: fields.projectName?.stringValue,
      price: Number(fields.startingPrice?.integerValue ?? fields.startingPrice?.doubleValue),
      boundaryPoints: fields.layoutPolygon?.mapValue?.fields?.points?.arrayValue?.values?.length || 0
    };
    console.log(JSON.stringify(result));
    const expected = id === 'vwFZcYay5s0HkxCQavuS' ? ['Mauli Park', 700000] : ['Veershree Enclave', 2000000];
    if (result.name !== expected[0] || result.price !== expected[1] || result.boundaryPoints < 3) throw new Error('Public project verification failed.');
  }
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
