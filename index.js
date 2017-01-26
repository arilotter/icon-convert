#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');
const program = require('commander');
const mkdir = require('mkdir-promise');

const allowedPNGSizes = [16, 24, 32, 48, 64, 96, 128, 256, 512];
const allowedTypes = ['ico', 'icns', 'hqx', ...allowedPNGSizes.map(size => `png${size}`)];

program
  .usage('[options] <file> ')
  .option('-t, --types <items>', `the output file types. one or more of: ${allowedTypes.join(' ')}. defaults to ico,icns`, items => items.split(','), ['ico', 'icns'])
  .option('-o, --out [value]', 'the output directory')
  .option('-f, --filename [value]', 'the output filename prefix. defaults to the name of the input file without an extension')
  .on('--help', () => {
    console.log(`Examples:
      $ icon-convert --t png32,png512 --f BrandIcon icon.svg # creates files: ./BrandIcon_32x32.png, ./BrandIcon_512x512.png
      $ icon-convert --types icns,hqx --out icons NiceIcon.png # creates files: icons/NiceIcons.ics, icons/NiceIcon.svg
    `);
  })
  .parse(process.argv);

const outputDirectory = path.resolve(program.out || '.');

// Check for invalid conversion types
const invalidTypes = program.types.filter(type => !allowedTypes.includes(type))
if (invalidTypes.length != 0) {
  console.error(`Invalid conversion types: ${invalidTypes.map(type => `'${type}'`).join(' ')}.`);
  console.error(`Valid types are one or more of: ${allowedTypes.join(' ')}`)
  return process.exitCode = 1;
}

// Check for invalid file arguments
if (program.args.length != 1) {
  console.error('Wrong number of file arguments.');
  return process.exitCode = 1;
}

// Check for invalid file path
const filePath = path.resolve(program.args[0]);
if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  return process.exitCode = 1;
}

const basename = path.basename(program.args[0]).split('.');
const outputFilePrefix = program.filename || (basename.length > 0 ? basename.slice(0, -1) : basename).join('.');

const encodedTypes = allowedTypes.map(type => `${type}=${program.types.includes(type) ? '1' : '0' }`).join('&');

const form = new FormData();
form.append('files[]', fs.createReadStream(filePath));

mkdir(outputDirectory)
  .then(() => fetch('https://iconverticons.com/api/upload', { method: 'post', body: form }))
  .then(response => response.json())
  .then(json => fetch(`https://iconverticons.com/api/convert?id=${json.id}&output=json&${encodedTypes}`))
  .then(response => response.json())
  .then(json => json.files.filter(file => {
      // Icons are square, so only checking width is OK
      return program.types.includes(file.format) || (file.format === 'png' && (
        program.types
          .filter(type => type.startsWith('png'))
          .map(type => parseInt(type.replace('png','')))
          .includes(file.imgsizes[0].width)
      ))
    }).map(file => {
      fetch(file.download.uri).then(response => {
        response.body.pipe(fs.createWriteStream(path.resolve(outputDirectory, file.filename.replace(json.id, outputFilePrefix))))
      })
    })
  )
  .catch(err => { throw new Error(err) });