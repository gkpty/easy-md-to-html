var fs = require("fs");
var mdToHtml = require('./index')

function createDocs(){
  //create the config file if it doesnt 
  //read the md file and return body of html
  fs.readFile('./docs.md', 'utf8', function(err, data){
    if(err) throw new Error(err)
    else{
      mdToHtml(data, function(err, data){
        if(err) console.log(err)
        else {
          fs.writeFileSync('docs.html', data);
          console.log('success')
        }
      })
    }
  })
  
}

createDocs()
