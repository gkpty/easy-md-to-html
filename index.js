var fs = require("fs");

module.exports = function mdToHtml(md, name, callback){
  let html = ""
  let codeblock = false;
  let quotedcodeblock = false;
  let orderedlist = false;
  let orderedlistLevel = 0;
  let unorderedlist = false;
  let unorderedlistLevel = 0;
  if(!name || typeof name === 'function'){
    if(typeof name === 'function') callback = name;
    name = 'config';
  }
  createFile(`${name}.json`, `{"sections":{}}`, (err)=>{
    if(err) callback(err)
    else{
      //split the markdown file at the end of every line
      let mdarr = md.split(/(\r\n|\n|\r)/gm)
      let currentsection = "";
      for(let i=0; i<mdarr.length; i++){
        //replace code blocks with ```
        if(mdarr[i].startsWith("```")){
          if(!quotedcodeblock){
            mdarr[i] = '<pre><code>';
            quotedcodeblock = true;
          }
          else{
            mdarr[i] = '</pre></code>';
            quotedcodeblock = false;
          }
        }
        //replace codeblocks with tabs
        else if(mdarr[i].startsWith("    ") && !(/^[0-9]/.test(mdarr[i].trim())) && !quotedcodeblock){
          if(codeblock){
            mdarr[i] = mdarr[i].replace("    ", "")
            mdarr[i] = ignoreHtml(mdarr[i])
          }
          else{
            mdarr[i] = '<pre><code>' + mdarr[i].replace("    ", "")
            codeblock = true;
          }
        }
        //if its not a codeblock
        else{
          //check if its the line after a codeblock'
          if(codeblock){
            if(mdarr[i] !== '\n'){
              mdarr[i] = '</pre></code>' + mdarr[i]
              codeblock = false;
            }
          }
          //igonre html tags inside quoted codeblocks
          if(quotedcodeblock){
            mdarr[i] = ignoreHtml(mdarr[i])
          }
          if(!quotedcodeblock){
          //replace unordered lists
            if(mdarr[i].trim().startsWith("- ")){
              if(unorderedlist){
                let response = nestedList(mdarr[i], unorderedlistLevel, false)
                mdarr[i] = response.text
                unorderedlistLevel = response.level
              }
              else{
                mdarr[i] = '<ul>' + mdarr[i].replace("- ", '<li>') + '</li>';
                unorderedlist = true;
              }
            }
            //replace ordered lists
            else if(/^[0-9]/.test(mdarr[i].trim()) && mdarr[i].trim().substr(0, 5).includes(". ")){
              if(orderedlist){
                let response = nestedList(mdarr[i], orderedlistLevel, true)
                mdarr[i] = response.text
                orderedlistLevel = response.level
              }
              else{
                //replace the first two characters
                mdarr[i] = '<ol><li>' + mdarr[i].split(". ", 2)[1] + '</li>';
                orderedlist = true;
              }
            }
            else{
              //check if its the end of unordered list
              if(unorderedlist){
                if(mdarr[i] !== '\n'){
                  mdarr[i] = '</ul>' + '</ul>'.repeat(unorderedlistLevel) + mdarr[i];
                  unorderedlist = false;
                }
              }
              //check if its the end of ordered list
              else if(orderedlist){
                if(mdarr[i] !== '\n'){
                  mdarr[i] = '</ol>' + '</ol>'.repeat(orderedlistLevel) + mdarr[i];
                  orderedlist = false;
                }
              }
              //eliminate newline characters
              if(mdarr[i].includes('\n')){
                if(!codeblock && !quotedcodeblock){
                  mdarr[i] = mdarr[i].replace('\n', '')
                }
              }
              //replace title
              if(mdarr[i].startsWith('# ')){
                let id = mdarr[i].substr(2, 14).replace(/\s/g, '_').replace(`'`, '_').replace(',', '_').replace("(","").replace(")", '_') + i;
                AddSection(name, id, mdarr[i].substr(2, mdarr[i].length), function(err, data){
                  if(err) throw new Error(err)
                  else {
                    let section_tag = `<section id="${id}">`;
                    if(currentsection.length > 1){
                      section_tag = `</section><section id="${id}">`;
                    }
                    currentsection = id;
                    mdarr[i] = section_tag + mdarr[i].replace('# ', `<h1>`) + '</h1>';
                  }
                })
              }
              //replace subtitle
              else if(mdarr[i].startsWith('## ')){
                let id = mdarr[i].substr(3, 15).replace(/\s/g, '_').replace(`'`, '_').replace(',', '_').replace("(","").replace(")", '_') + i;
                AddSubsection(name, currentsection, id, mdarr[i].substr(3, mdarr[i].length));
                mdarr[i] = mdarr[i].replace('## ', `<h2 id=${id}>`) + '</h2>';
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
            //replace inline code
            if(mdarr[i].includes('`')){
              if(mdarr[i].split('`').length >= 3){
                mdarr[i] = replaceCodes(mdarr[i])
              }
            }
            //replace images
            if(mdarr[i].includes('![')){
              mdarr[i] = replaceImages(mdarr[i])
            }
            //replace links
            if(mdarr[i].includes('](')){
              mdarr[i] = replacelinks(mdarr[i])
            }
            //replace italics
            if(mdarr[i].includes('*')){
              //console.log('bold', mdarr[i])
              mdarr[i] = replaceItalics(mdarr[i])
            }
          }
        }
        html += mdarr[i];
      }
      if(callback && typeof callback === 'function') callback(null, html)
      else return html;
    }
  })
}

function nestedList(text, listLevel, ordered){
  let tab = "    ";
  let delim = "- "
  let level = listLevel + 1
  let tag = {start:"<ul>", end:"</ul>"}
  if(ordered){
    tag = {start:"<ol>", end:"</ol>"}
    delim = ". "
  }
  if(text.startsWith(tab.repeat(level))){
    text = tag.start + '<li>' + text.substr(text.indexOf(delim)+1) + '</li>';
    return {text:text, level:level};
  }
  else {
    for(let i=listLevel; i >= 0; i--){
      if(text.startsWith(tab.repeat(i))){
        text = tag.end.repeat(listLevel-i) + '<li>' + text.substr(text.indexOf(delim)+1) + '</li>';
        return {text:text, level:i};
      }
    }
  }
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
      let htmImg = `<img src='${imgpath}' alt='${imgname}' class='img-fluid'>`;
      text = text.replace(arrImg, htmImg);
    }
  }
  return text
}

function replaceCodes(text){
  let textarr = text.split('`')
  let newText = textarr[0]
  for(let i=1; i<textarr.length; i++){
    if(i%2 !== 0){
      textarr[i] = ignoreHtml(textarr[i]);
      newText += `<code>${textarr[i]}</code>`;
    }
    else newText += textarr[i]
  }
  text = newText
  return text;
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

function replaceItalics(text){
  if(text.split('*').length >= 3){
    let textarr = text.split('*')
    let newText = textarr[0]
    for(let i=1; i<textarr.length; i++){
      if(i%2 !== 0){
        newText += `<em>${textarr[i]}</em>`
      }
      else newText += textarr[i]
    }
    text = newText
    return text;
  }
}

function ignoreHtml(text){
  if(text.includes('>') && text.includes('>')){
    text = text.replace(/</g, '&_').replace(/>/g, '_&');
    text = text.replace(/&_/g, '<span><</span>').replace(/_&/g, '<span>></span>');
    return text;
  }
  else return text;
}

function createFile(file, contents, callback) {
  if(fs.existsSync(file)){
    let err = `file ${file} already exists`
    callback(null, err)
  }
  else {
    fs.writeFile(file, contents, (err) => {
      if (err) callback(err);
      else {
        let data = `Created the ${file} file`;
        callback(null, data);
      }
    })
  }
}

function AddSection(filename, id, text, callback){
  let rawdata = fs.readFileSync(`${filename}.json`);  
  obj = JSON.parse(rawdata);
  let sections = obj.sections;
  sections[id] = {"text":text, "subsections":{}}
  jsonString = JSON.stringify(obj);
  fs.writeFileSync(`${filename}.json`, jsonString);
  if(callback && typeof callback === 'function') callback(null, 'Success');
  else return 'Success';
}

function AddSubsection(filename, section, id, text){
  let rawdata = fs.readFileSync(`${filename}.json`);  
  obj = JSON.parse(rawdata);
  let subsections = obj.sections[section].subsections;
  subsections[id] = text;
  jsonString = JSON.stringify(obj);
  fs.writeFileSync(`${filename}.json`, jsonString);
  return 'Success';
}