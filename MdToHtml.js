var fs = require("fs");

module.exports = function mdToHtml(md, callback){
  let html = ""
  let codeblock = false;
  let orderedlist = false;
  let orderedsublist = false;
  let unorderedlist = false;
  let mdarr = md.split(/(\r\n|\n|\r)/gm)
  let currentsection = "";
  for(let i=0; i<mdarr.length; i++){
    //replace codeblocks
    if(mdarr[i].startsWith("    ") && !(/^[0-9]/.test(mdarr[i].trim()))){
      if(codeblock){
        mdarr[i] = mdarr[i].replace("    ", "")
      }
      else{
        mdarr[i] = '<pre><code>' + mdarr[i].replace("    ", "")
        codeblock = true;
      }
    }
    else{
      //check if its the end of a codeblock
      if(codeblock){
        if(mdarr[i] !== '\n'){
          mdarr[i] = '</pre></code>' + mdarr[i];
          codeblock = false;
        }
      }
      //replace unordered lists
      if(mdarr[i].startsWith("- ")){
        if(unorderedlist){
          mdarr[i] = mdarr[i].replace("- ", '<li>') + '</li>';
        }
        else{
          mdarr[i] = '<ul>' + mdarr[i].replace("- ", '<li>') + '</li>';
          unorderedlist = true;
        }
      }
      //replace ordered lists
      else if(/^[0-9]/.test(mdarr[i].trim())){
        //console.log(mdarr[i])
        if(mdarr[i].substr(0, 5).includes(". ")){
          //console.log('list', mdarr[i])
          if(orderedlist){
            //replace the first two characters
            mdarr[i] = '<li>' + mdarr[i].split(". ", 2)[1] + '</li>';
          }
          else{
            //replace the first two characters
            mdarr[i] = '<ol><li>' + mdarr[i].split(". ", 2)[1] + '</li>';
            orderedlist = true;
          }
        }
      }
      else{
        //check if its the end of unordered list
        if(unorderedlist){
          if(mdarr[i] !== '\n'){
            mdarr[i] = '</ul>' + mdarr[i];
            unorderedlist = false;
          }
        }
        //check if its the end of ordered list
        else if(orderedlist){
          if(mdarr[i] !== '\n'){
            mdarr[i] = '</ol>' + mdarr[i];
            orderedlist = false;
          }
        }
        //replace newlines with breaks
        if(!codeblock && mdarr[i].includes('\n')){
          mdarr[i] = mdarr[i].replace('\n', '')
        }
        //replace title
        if(mdarr[i].startsWith('# ')){
          let id = mdarr[i].substr(2, 14).replace(/\s/g, '_').replace(`'`, '_').replace(',', '_').replace("(","").replace(")", '_') + i;
          AddSection(id, mdarr[i].substr(2, mdarr[i].length), function(err, data){
            if(err) throw new Error(err)
            else {
              currentsection = id;
              mdarr[i] = mdarr[i].replace('# ', `<h1>`) + '</h1>';
            }
          })
        }
        //replace subtitle
        else if(mdarr[i].startsWith('## ')){
          let id = mdarr[i].substr(3, 15).replace(/\s/g, '_').replace(`'`, '_').replace(',', '_').replace("(","").replace(")", '_') + i;
          AddSubsection(currentsection, id, mdarr[i].substr(3, mdarr[i].length));
          mdarr[i] = mdarr[i].replace('## ', `<h2>`) + '</h2>';
        }
        //replace pargraphs
        else if(/^[a-zA-Z0-9]/.test(mdarr[i])){
          mdarr[i] = '<p>' + mdarr[i] + '</p>';
        }
      }
      //replace bold characters
      if(mdarr[i].includes('**')){
        //console.log('bold', mdarr[i])
        mdarr[i] = replaceBolds(mdarr[i])
      }
      //replace images
      if(mdarr[i].includes('![')){
        mdarr[i] = replaceImages(mdarr[i])
      }
      //replace links
      if(mdarr[i].includes('](')){
        mdarr[i] = replacelinks(mdarr[i])
      }
      //replace inline code
      if(mdarr[i].includes('`')){
        mdarr[i] = replaceCodes(mdarr[i])
      }
 
      //replace italics
    }
    html += mdarr[i];
  }
  if(callback && typeof callback === 'function') callback(null, html)
  else return html;
}

function replacelinks(text){
  let linkarr = text.split('](')
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
      let htmlink = `<a href='${linkpath}'>${linkname}</a>`;
      text = text.replace(arrlink, htmlink);
    }
  }
  return text
}

function replaceImages(text){
  let imgarr = text.split('](')
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