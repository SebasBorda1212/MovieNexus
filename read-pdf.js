const fs = require('fs');
const pdf = require('pdf-parse');

console.log(typeof pdf, Object.keys(pdf));

let dataBuffer = fs.readFileSync('C:/Users/SENA/Downloads/Guía Paso a Paso #14.pdf');

(pdf.default || pdf)(dataBuffer).then(function(data) {
    console.log("PDF TEXT: ", data.text);
}).catch(function(err){
    console.error("ERROR: ", err);
});
