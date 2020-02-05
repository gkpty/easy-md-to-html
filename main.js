var fs = require("fs");

function readDocs(file){
  fs.readFile(file, 'utf8', function(err, data){
    let newData = ""
    let codeblock = false;
    let orderedlist = false;
    let unorderedlist = false;
    data = data.split(/(\r\n|\n|\r)/gm)
    //let currentsection = ""
    for(item of data){
      //identify codeblocks
      if(item.startsWith("    ")){
        if(codeblock){
          item = item.replace("    ", "")
        }
        else{
          item = '<pre><code>' + item.replace("    ", "")
          codeblock = true;
        }
      }
      else if(item.startsWith("- ")){
        if(unorderedlist){
          item = item.replace("- ", '<li>') + '</li>';
        }
        else{
          item = '<ul>' + item.replace("- ", '<li>') + '</li>';
          unorderedlist = true;
        }
      }
      else{
        if(codeblock){
          if(item !== '\n'){
            item = '</pre></code>' + item;
            codeblock = false;
          }
        }
        else if(unorderedlist){
          if(item !== '\n'){
            item = '</ul>' + item;
            unorderedlist = false;
          }
        }
        if(!codeblock && item.includes('\n')){
          item = item.replace('\n', '<br>')
        }
        //replace title
        if(item.startsWith('# ')){
          item = item.replace('# ', `<h1>`) + '</h1>';
          //add id of section
          //add section
          //currentsection = section
        }
        //replace subtitle
        else if(item.startsWith('## ')){
          item = item.replace('## ', `<h2>`) + '</h2>';
          //add id of subsection
          //add subsection
        }
        //replace links
        if(item.includes('](')){
          item = replacelinks(item)
        }
        //replace code
        item = replaceCode(item)
      }
      //replace images
      //replace lists
      newData += item;
    }
    fs.writeFileSync('docs.html', newData);
  })
}

function replacelinks(text){
  let linkarr = item.split('](')
  let linkname = null;
  let linkpath = null;
  for(link of linkarr){
    if(link.includes('[')){
      let brackets = link.split('[');
      linkname = brackets[brackets.length-1];
      linkpath = null;
    }
    else if(link.includes(')')){
      let parenthesis = link.split(')');
      linkpath = parenthesis[0];
    }
    if(linkpath && linkname){
      let mdlink = `[${linkname}](${linkpath})`;
      let htmlink = `<a src='${linkpath}'>${linkname}</a>`;
      text = text.replace(mdlink, htmlink);
    }
  }
  return text
}

function replaceCode(text){
  if(text.includes('`')){
    if(text.split('`').length >= 3){
      let textarr = text.split('`')
      let newText = textarr[0]
      for(let i=1; i<textarr.length; i++){
        if(i%2 !== 0){
          newText += `<code>${textarr[i]}</code>`
        }
        else newText += textarr[i]
      }
      text = newText
      return text;
    }
  }
}

function replaceUnorederedLists(item){

}

readDocs('docs.md')