# easy-md-to-html

Easy MdToHTml is a node module with no external dependencias that converts markdown text into HTML using only traditional javascript string methods. The source code of this project is a good educational source for learning about javascript string methods and the logic behind manipulating structured text with javascript.

## Features
- Converts most makrdown elements into html elements 
- Ignores HTML inside inline code or codeblocks
- Identifies headings and subheading and generates a json file with an index

## Installation
`npm i easy-md-to-html`

## Usage
    const emdtohtml = require('easy-md-to-html')

    //md is a string with markdown formatting
    emdtohtml(md, function(err, data){
      if(err) console.error(err)
      else{
        //Do Something
      }
    })




