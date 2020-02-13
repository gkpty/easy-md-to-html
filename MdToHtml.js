var fs = require("fs");

module.exports = function mdToHtml(md, callback){
  let html = ""
  let codeblock = false;
  let orderedlist = false;
  let unorderedlist = false;
  let mdarr = md.split(/(\r\n|\n|\r)/gm)
  let currentsection = ""
  Object.keys(mdarr).map(function(item, index){
    //replace codeblocks
    if(item.startsWith("    ")){
      if(codeblock){
        item = item.replace("    ", "")
      }
      else{
        item = '<pre><code>' + item.replace("    ", "")
        codeblock = true;
      }
    }
    else{
      //check if its the end of a codeblock
      if(codeblock){
        if(item !== '\n'){
          item = '</pre></code>' + item;
          codeblock = false;
        }
      }
      //replace unordered lists
      if(item.startsWith("- ")){
        if(unorderedlist){
          item = item.replace("- ", '<li>') + '</li>';
        }
        else{
          item = '<ul>' + item.replace("- ", '<li>') + '</li>';
          unorderedlist = true;
        }
      }
      //replace ordered lists
      else if(item.startsWith(/[0-9]/ + '.')){
        if(unorderedlist){
          //replace the first two characters
          item = item.replace(/[0-9]/ + '.', '<li>') + '</li>';
        }
        else{
          //replace the first two characters
          item = '<ol>' + item.replace(/[0-9]/ + '.', '<li>') + '</li>';
          unorderedlist = true;
        }
      }
      else{
        //check if its the end of unordered list
        if(unorderedlist){
          if(item !== '\n'){
            item = '</ul>' + item;
            unorderedlist = false;
          }
        }
        //check if its the end of ordered list
        else if(orderedlist){
          if(item !== '\n'){
            item = '</ol>' + item;
            orderedlist = false;
          }
        }
        //replace newlines with breaks
        if(!codeblock && item.includes('\n')){
          item = item.replace('\n', '<br>')
        }
        //replace title
        if(item.startsWith('# ')){
          item = item.replace('# ', `<h1>`) + '</h1>';
          let id = text.substr(2, 14).replace(/\s/g, '_').replace(`'`, '_').replace(',', '_').replace("(","").replace(")", '_') + index
          AddSection(id, text.substr(2, text.length), function(err, data){
            if(err) throw new Error(err)
            else currentsection = id;
          })
        }
        //replace subtitle
        else if(item.startsWith('## ')){
          let id = text.substr(3, 15).replace(/\s/g, '_').replace(`'`, '_').replace(',', '_').replace("(","").replace(")", '_') + index
          item = item.replace('## ', `<h2>`) + '</h2>';
          AddSubsection(currentsection, id, text.substr(3, text.length))
        }
        //replace pargraphs
        /* else if(item.startsWith(/^[a-zA-Z0-9]*$/)){
          item = '<p>' + item + '</p>';
        } */
      }
      //replace links
      if(item.includes('](')){
        item = replacelinks(item)
      }
      //replace images
      if(item.includes('![')){
        item = replaceImages(item)
      }
      //replace inline code
      if(item.includes('`')){
        item = replaceCodes(item)
      }
      //replace bold characters
      if(item.includes('**')){
        item = replaceBolds(item)
      }
      //replace italics
    }
    console.log(mdarr[item])
    html += mdarr[item];
  })
  if(callback && typeof callback === 'function') callback(null, html)
  else return html;
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
      let arrlink = `[${linkname}](${linkpath})`;
      let htmlink = `<a src='${linkpath}'>${linkname}</a>`;
      text = text.replace(arrlink, htmlink);
    }
  }
  return text
}

function replaceImages(text){
  let imgarr = item.split('](')
  let imgname = null;
  let imgpath = null;
  for(img of imgarr){
    if(img.includes('![')){
      let brackets = img.split('![');
      imgname = brackets[brackets.length-1];
      imgpath = null;
    }
    else if(img.includes(')')){
      let parenthesis = img.split(')');
      imgpath = parenthesis[0];
    }
    if(imgpath && imgname){
      let arrImg = `![${imgname}](${imgpath})`;
      let htmImg = `<img src='${imgpath}' alt='${imgname}'>`;
      text = text.replace(arrImg, htmImg);
    }
  }
  return text
}

function replaceCodes(text){
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

function replaceBolds(text){
  if(text.split('**').length >= 3){
    let textarr = text.split('**')
    let newText = textarr[0]
    for(let i=1; i<textarr.length; i++){
      if(i%2 !== 0){
        newText += `<strong>${textarr[i]}</strong>`
      }
      else newText += textarr[i]
    }
    text = newText
    return text;
  }
}

function AddSection(id, text, callback){
  let rawdata = fs.readFileSync(`docs.json`);  
  obj = JSON.parse(rawdata);
  let sections = obj.sections;
  sections[id] = {"text":text, "subsections":{}}
  jsonString = JSON.stringify(obj);
  fs.writeFileSync(`docs.json`, jsonString);
  if(callback && typeof callback === 'function') callback(null, 'Success');
  else return 'Success';
}

function AddSubsection(section, id, text, callback){
  let rawdata = fs.readFileSync(`docs.json`);  
  obj = JSON.parse(rawdata);
  let subsections = obj.sections[section].subsections;
  subsections[id] = text;
  jsonString = JSON.stringify(obj);
  fs.writeFileSync(`docs.json`, jsonString);
  return 'Success';
}