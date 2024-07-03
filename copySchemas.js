const fs = require('fs');
const path = require('path');

/**
 * Copies the content from source file to destination file.
 * @param {string} sourceFilePath - The path of the source file.
 * @param {string} destinationFilePath - The path of the destination file.
 */
function copyFileContent(sourceFilePath, destinationFilePath) {
  fs.readFile(sourceFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading from ${sourceFilePath}:`, err);
      return;
    }

    fs.writeFile(destinationFilePath, data, (err) => {
      if (err) {
        console.error(`Error writing to ${destinationFilePath}:`, err);
        return;
      }

      console.log(`Copied content from ${sourceFilePath} to ${destinationFilePath}`);
    });
  });
}

// Define file paths
const schemaForGenerationPath = path.join(__dirname, 'schema_for_generation.graphql');
const schemaForPublicQueriesPath = path.join(__dirname, 'schema_for_public_queries.graphql');
const schemaPath = path.join(__dirname, 'schema.graphql');

// Get the argument passed to the script
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Please provide an argument: "generation" or "public"');
  process.exit(1);
}

const command = args[0];

if (command === 'generation') {
  copyFileContent(schemaForGenerationPath, schemaPath);
} else if (command === 'public') {
  copyFileContent(schemaForPublicQueriesPath, schemaPath);
} else {
  console.error('Unknown argument. Use "generation" or "public".');
  process.exit(1);
}
