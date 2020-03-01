# easy-md-to-html

Easy MdToHTml is a node module with no external dependencias that converts markdown text into HTML using only traditional javascript string methods. The source code of this project may also serve as an educational resource for learning about javascript string methods and the logic behind manipulating structured text.

## Features
- Converts most makrdown elements into html elements 
- Ignores HTML inside inline code or codeblocks
- Identifies headings and subheading and generates a json file with an index

## Installation
`npm i easy-md-to-html`

## Usage
    const emdtohtml = require('easy-md-to-html')

    //MD is a string with markdown formatting. optionally, as a second argument, you can provide a custom name for the json file that will contain your markdown headings and subheadings.

    emdtohtml(MD, function(err, data){
      if(err) console.error(err)
      else{
        //Do Something
      }
    })




